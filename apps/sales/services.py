import uuid
from decimal import Decimal
from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone
from apps.core.services import BaseService
from apps.core.tenant_context import TenantContext
from apps.core.exceptions import TenantAccessError, TenantMissingError
from apps.inventory.services import InventoryService
from apps.sales.models import Sale, SaleItem


class SaleService(BaseService):
    @classmethod
    def create_sale(
        cls,
        branch,
        shift,
        cashier,
        items_data,
        payment_method,
        customer=None,
        tax_amount=0.0
    ):
        """
        Creates a Sale inside an atomic database transaction.
        Enforces:
        1. Tenant isolation validation
        2. Active cashier shift validation
        3. Sale header record generation
        4. SaleItems creation
        5. Stock level deductions via InventoryService
        6. Aggregate calculations
        7. Cash tracking updates
        8. Audit logs
        """
        # 1. Validate tenant isolation
        current_tenant_id = TenantContext.get_current_tenant_id()
        if not current_tenant_id:
            raise TenantMissingError("Tenant isolation violation: No active tenant context resolved.")
        
        # Verify all entities belong to the active tenant context
        if str(branch.tenant_id) != str(current_tenant_id):
            raise TenantAccessError("Tenant isolation violation: Branch does not belong to the active tenant.")
        if str(shift.tenant_id) != str(current_tenant_id):
            raise TenantAccessError("Tenant isolation violation: Shift does not belong to the active tenant.")
        if cashier.tenant_id and str(cashier.tenant_id) != str(current_tenant_id):
            raise TenantAccessError("Tenant isolation violation: Cashier does not belong to the active tenant.")
        if customer and str(customer.tenant_id) != str(current_tenant_id):
            raise TenantAccessError("Tenant isolation violation: Customer does not belong to the active tenant.")

        # 2. Validate active shift for cashier
        if shift.status != 'open':
            raise ValidationError("Cashier cannot sell without an OPEN shift.")
        if shift.cashier_id != cashier.id:
            raise ValidationError("Validation Error: Active shift does not belong to the current cashier.")

        # Resolve branch warehouse target to deduct stock
        warehouse = InventoryService.get_warehouse_for_branch(branch)
        if not warehouse:
            raise ValidationError(
                f"Configuration Error: No active warehouse associated with branch {branch.name}."
            )

        if not items_data:
            raise ValidationError("A sale must contain at least one item.")

        with transaction.atomic():
            # 3. Create Sale record (with temporary zero totals to be calculated in step 6)
            timestamp = timezone.now().strftime("%Y%m%d%H%M%S")
            rand_suffix = str(uuid.uuid4().int)[:6]
            invoice_number = f"INV-{timestamp}-{rand_suffix}"

            sale = Sale.objects.create(
                tenant_id=current_tenant_id,
                branch=branch,
                shift=shift,
                cashier=cashier,
                customer=customer,
                subtotal=0.0,
                discount_amount=0.0,
                tax_amount=0.0,
                total_amount=0.0,
                payment_method=payment_method,
                invoice_number=invoice_number
            )

            # 4. Create SaleItems
            # 5. FOR EACH ITEM: Call InventoryService.create_movement()
            subtotal = Decimal('0.0')
            total_discount = Decimal('0.0')

            for item in items_data:
                variant = item['product_variant']
                qty = Decimal(str(item['quantity']))
                price = Decimal(str(item['unit_price']))
                item_discount = Decimal(str(item.get('discount_amount', '0.0')))

                if qty <= 0:
                    raise ValidationError("Item quantity must be greater than zero.")

                item_total = (price * qty) - item_discount
                if item_total < 0:
                    item_total = Decimal('0.0')

                # Create SaleItem
                SaleItem.objects.create(
                    tenant_id=current_tenant_id,
                    sale=sale,
                    product_variant=variant,
                    quantity=int(qty),
                    unit_price=price,
                    discount_amount=item_discount,
                    total_price=item_total
                )

                # Deduct inventory: call InventoryService.create_movement()
                # movement_type = "sale", quantity = negative quantity
                InventoryService.create_movement(
                    warehouse=warehouse,
                    product_variant=variant,
                    movement_type='sale',
                    quantity=-int(qty),
                    created_by=cashier,
                    reference_id=sale.id
                )

                subtotal += price * qty
                total_discount += item_discount

            # 6. Calculate totals (subtotal, discount, tax, total)
            tax = Decimal(str(tax_amount))
            total_amount = subtotal + tax - total_discount
            if total_amount < 0:
                total_amount = Decimal('0.0')

            # Update Sale record with calculated totals
            sale.subtotal = subtotal
            sale.discount_amount = total_discount
            sale.tax_amount = tax
            sale.total_amount = total_amount
            sale.save(update_fields=['subtotal', 'discount_amount', 'tax_amount', 'total_amount'])

            # 7. Update shift cash tracking
            # If payment method is cash, we increment expected_cash
            if payment_method == 'cash':
                shift.expected_cash = Decimal(str(shift.expected_cash or '0.0')) + total_amount
                shift.save(update_fields=['expected_cash'])

            # 8. Write audit log entry
            cls.log_audit(
                action='CREATE_SALE',
                entity='Sale',
                entity_id=sale.id,
                new_value={
                    'invoice_number': invoice_number,
                    'total_amount': float(total_amount),
                    'payment_method': payment_method
                },
                module_name='sales'
            )

            # 9. Return final invoice object
            return sale
