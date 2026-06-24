from django.core.exceptions import ValidationError
from django.db import transaction
from apps.core.services import BaseService
from apps.core.tenant_context import TenantContext
from apps.inventory.models import Warehouse, Stock, InventoryMovement


class InventoryService(BaseService):
    @classmethod
    def get_warehouse_for_branch(cls, branch):
        """Resolves the warehouse associated with a branch."""
        current_tenant_id = TenantContext.get_current_tenant_id()
        if not current_tenant_id:
            from apps.core.exceptions import TenantMissingError
            raise TenantMissingError("Active tenant context required to fetch branch warehouse.")

        from apps.core.exceptions import TenantAccessError
        if str(branch.tenant_id) != str(current_tenant_id):
            raise TenantAccessError("Tenant isolation violation: Branch does not belong to the active tenant.")
        
        return Warehouse.objects.filter(branch=branch).first()

    @classmethod
    def get_default_warehouse(cls):
        """Resolves the default warehouse for e-commerce orders."""
        current_tenant_id = TenantContext.get_current_tenant_id()
        if not current_tenant_id:
            from apps.core.exceptions import TenantMissingError
            raise TenantMissingError("Active tenant context required to fetch default warehouse.")
        
        # Will naturally filter by current tenant due to default manager
        return Warehouse.objects.first()

    @classmethod
    def get_stock_for_update(cls, warehouse, product_variant):
        """Retrieves Stock cache row with select_for_update lock."""
        current_tenant_id = TenantContext.get_current_tenant_id()
        if not current_tenant_id:
            from apps.core.exceptions import TenantMissingError
            raise TenantMissingError("Active tenant context required to lock stock.")

        from apps.core.exceptions import TenantAccessError
        if str(warehouse.tenant_id) != str(current_tenant_id):
            raise TenantAccessError("Tenant isolation violation: Warehouse does not belong to the active tenant.")
        if str(product_variant.tenant_id) != str(current_tenant_id):
            raise TenantAccessError("Tenant isolation violation: Product variant does not belong to the active tenant.")

        return Stock.objects.select_for_update().get(
            warehouse=warehouse,
            product_variant=product_variant
        )

    @classmethod
    def create_movement(
        cls,
        warehouse,
        product_variant,
        movement_type,
        quantity,
        created_by,
        reference_id=None
    ):
        """
        Creates an InventoryMovement and updates the corresponding Stock cache safely.
        Runs inside an atomic transaction with a database row lock (select_for_update)
        to prevent race conditions in concurrent transactions.
        """
        current_tenant_id = TenantContext.get_current_tenant_id()
        if not current_tenant_id:
            from apps.core.exceptions import TenantMissingError
            raise TenantMissingError("Active tenant context required to create inventory movement.")

        from apps.core.exceptions import TenantAccessError
        if str(warehouse.tenant_id) != str(current_tenant_id):
            raise TenantAccessError("Tenant isolation violation: Warehouse does not belong to the active tenant.")
        if str(product_variant.tenant_id) != str(current_tenant_id):
            raise TenantAccessError("Tenant isolation violation: Product variant does not belong to the active tenant.")
        if created_by.tenant_id and str(created_by.tenant_id) != str(current_tenant_id):
            raise TenantAccessError("Tenant isolation violation: User does not belong to the active tenant.")

        if quantity == 0:
            raise ValidationError("Movement quantity cannot be zero.")

        # Ensure operation runs inside an atomic transaction
        with transaction.atomic():
            # 1. Write the InventoryMovement entry
            movement = InventoryMovement.objects.create(
                tenant_id=current_tenant_id,
                warehouse=warehouse,
                product_variant=product_variant,
                movement_type=movement_type,
                quantity=quantity,
                reference_id=reference_id,
                created_by=created_by
            )

            # 2. Retrieve or create the cached Stock row with a row-level database lock
            try:
                stock = Stock.objects.select_for_update().get(
                    warehouse=warehouse,
                    product_variant=product_variant
                )
            except Stock.DoesNotExist:
                # Bypass the model guard to create the initial stock cache record
                stock = Stock(
                    tenant_id=current_tenant_id,
                    warehouse=warehouse,
                    product_variant=product_variant,
                    quantity=0
                )
                stock._bypass_stock_guard = True
                stock.save()
                
                # Re-fetch with row lock to align with atomic execution
                stock = Stock.objects.select_for_update().get(id=stock.id)

            old_quantity = stock.quantity
            new_quantity = old_quantity + quantity

            # Check: Stock must never go negative (business sanity check)
            # Sales and transfers require sufficient stock. Purchases/returns add to stock.
            if new_quantity < 0:
                raise ValidationError(
                    f"Insufficient stock for {product_variant.sku} at warehouse {warehouse.name}. "
                    f"Available: {old_quantity}, Requested: {abs(quantity)}"
                )

            # 3. Safely update the Stock cache (bypassing the model lock)
            stock.quantity = new_quantity
            stock._bypass_stock_guard = True
            stock.save()

            # 4. Write to the Audit Log
            cls.log_audit(
                action='INVENTORY_MOVEMENT',
                entity='Stock',
                entity_id=stock.id,
                old_value={'quantity': old_quantity},
                new_value={'quantity': new_quantity},
                module_name='inventory'
            )

            return movement

