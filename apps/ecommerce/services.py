import uuid
from decimal import Decimal
from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone
from apps.core.services import BaseService
from apps.core.tenant_context import TenantContext
from apps.core.exceptions import TenantAccessError, TenantMissingError
from apps.inventory.services import InventoryService
from apps.inventory.models import Stock
from apps.notifications.models import Notification
from apps.accounts.models import User
from apps.ecommerce.models import Order, OrderItem


class EcommerceService(BaseService):
    @classmethod
    def add_to_cart(cls, cart, product_variant, quantity):
        """
        Adds a product variant item to a cart.
        Resolves prices (handling overrides), increments quantities,
        and enforces tenant boundaries.
        """
        from apps.ecommerce.models import CartItem, EcommerceProduct
        
        current_tenant_id = TenantContext.get_current_tenant_id()
        if not current_tenant_id:
            raise TenantMissingError("Tenant context error: Active tenant required to add item to cart.")

        if str(cart.tenant_id) != str(current_tenant_id):
            raise TenantAccessError("Tenant isolation violation: Cart does not belong to the active tenant.")
        if str(product_variant.tenant_id) != str(current_tenant_id):
            raise TenantAccessError("Tenant isolation violation: Product variant does not belong to the active tenant.")

        if quantity <= 0:
            raise ValidationError("Quantity to add must be greater than zero.")

        # Determine price: check for EcommerceProduct visibility and override price
        ecommerce_product = EcommerceProduct.objects.filter(
            product_variant=product_variant,
            is_visible=True
        ).first()

        resolved_price = Decimal(str(product_variant.price))
        if ecommerce_product and ecommerce_product.online_price is not None:
            resolved_price = Decimal(str(ecommerce_product.online_price))

        with transaction.atomic():
            # Update or create CartItem
            cart_item, created = CartItem.objects.get_or_create(
                tenant_id=current_tenant_id,
                cart=cart,
                product_variant=product_variant,
                defaults={
                    'quantity': 0,
                    'price_snapshot': resolved_price
                }
            )

            # Increment quantity
            cart_item.quantity += quantity
            cart_item.price_snapshot = resolved_price  # refresh snapshot to current online price
            cart_item.save()

            return cart_item

    @classmethod
    def create_order(
        cls,
        cart,
        payment_method,
        customer=None,
        discount_amount=0.0,
        tax_amount=0.0,
        created_by_user=None
    ):
        """
        Converts a Cart into an Order inside an atomic transaction.
        Enforces:
        1. Tenant validation
        2. Stock availability checks
        3. Order generation
        4. OrderItems creation
        5. Stock deductions via InventoryService
        6. Cart clearing
        7. Notification triggers
        8. Audit logs
        """
        current_tenant_id = TenantContext.get_current_tenant_id()
        if not current_tenant_id:
            raise TenantMissingError("Tenant isolation violation: No active tenant context resolved.")

        # 1. Validate tenant isolation
        if str(cart.tenant_id) != str(current_tenant_id):
            raise TenantAccessError("Tenant isolation violation: Cart does not belong to the active tenant.")
        if customer and str(customer.tenant_id) != str(current_tenant_id):
            raise TenantAccessError("Tenant isolation violation: Customer does not belong to the active tenant.")

        cart_items = cart.items.all()
        if not cart_items.exists():
            raise ValidationError("Cannot checkout an empty cart.")

        # Resolve the default warehouse of the tenant to fulfill this order
        warehouse = InventoryService.get_default_warehouse()
        if not warehouse:
            raise ValidationError("Configuration Error: No warehouse configured to fulfill e-commerce orders.")

        with transaction.atomic():
            # 2. Validate stock availability via InventoryService (Read-Only Check)
            # We lock the stocks using select_for_update to ensure stock counts don't change during validation
            for item in cart_items:
                # Security Guardrail: Check product variant tenant boundaries
                if str(item.product_variant.tenant_id) != str(current_tenant_id):
                    raise TenantAccessError(
                        f"Tenant isolation violation: Product variant {item.product_variant.sku} does not belong to the active tenant."
                    )

                try:
                    stock = InventoryService.get_stock_for_update(warehouse, item.product_variant)
                except Stock.DoesNotExist:
                    raise ValidationError(
                        f"Stock Error: No inventory record found for variant {item.product_variant.sku}."
                    )

                if stock.quantity < item.quantity:
                    raise ValidationError(
                        f"Insufficient stock for product {item.product_variant.sku} at warehouse {warehouse.name}. "
                        f"Available: {stock.quantity}, Requested: {item.quantity}"
                    )

            # 3. Create Order record
            timestamp = timezone.now().strftime("%Y%m%d%H%M%S")
            rand_suffix = str(uuid.uuid4().int)[:6]
            order_number = f"ECO-{timestamp}-{rand_suffix}"

            # Calculate initial totals using Decimal math
            subtotal = Decimal('0.0')
            for item in cart_items:
                subtotal += Decimal(str(item.price_snapshot)) * item.quantity

            discount = Decimal(str(discount_amount))
            tax = Decimal(str(tax_amount))
            total = subtotal + tax - discount
            if total < Decimal('0.0'):
                total = Decimal('0.0')

            order = Order.objects.create(
                tenant_id=current_tenant_id,
                customer=customer,
                status='pending',
                subtotal=subtotal,
                discount=discount,
                tax=tax,
                total=total,
                payment_method=payment_method,
                order_number=order_number
            )

            # 4. Create OrderItems and 5. Deduct stock via InventoryService
            # Resolve system/default user to assign movement if user is anonymous guest checkout
            mover_user = created_by_user
            if not mover_user:
                mover_user = User.objects.filter(is_staff=True).first()
                if not mover_user:
                    # Fallback to any user if no staff exists
                    mover_user = User.objects.first()

            for item in cart_items:
                item_total = Decimal(str(item.price_snapshot)) * item.quantity
                
                # Create OrderItem
                OrderItem.objects.create(
                    tenant_id=current_tenant_id,
                    order=order,
                    product_variant=item.product_variant,
                    quantity=item.quantity,
                    price=item.price_snapshot,
                    total=item_total
                )

                # Deduct stock
                InventoryService.create_movement(
                    warehouse=warehouse,
                    product_variant=item.product_variant,
                    movement_type='sale',
                    quantity=-item.quantity,  # negative quantity
                    created_by=mover_user,
                    reference_id=order.id
                )

            # 6. Clear cart after successful order
            cart.items.all().delete()

            # 7. Trigger notifications
            # Locate first admin to notify
            admin_user = User.objects.filter(is_staff=True).first()
            if admin_user:
                # Notify Tenant Admin
                Notification.objects.create(
                    tenant_id=current_tenant_id,
                    user=admin_user,
                    title_key='notification.ecommerce_order.title',
                    body_key='notification.ecommerce_order.body',
                    notification_type='new_order',
                    params={
                        'order_id': str(order.id),
                        'order_number': order_number,
                        'total': float(total)
                    }
                )

            # Trigger low stock alerts if quantity fell below 10 units
            for item in cart_items:
                stock_level = Stock.objects.get(warehouse=warehouse, product_variant=item.product_variant)
                if stock_level.quantity < 10 and admin_user:
                    Notification.objects.create(
                        tenant_id=current_tenant_id,
                        user=admin_user,
                        title_key='notification.low_stock.title',
                        body_key='notification.low_stock.body',
                        notification_type='low_stock',
                        params={
                            'sku': item.product_variant.sku,
                            'warehouse': warehouse.name,
                            'quantity': stock_level.quantity
                        }
                    )

            # 8. Write audit log entry
            cls.log_audit(
                action='CREATE_ECOMMERCE_ORDER',
                entity='Order',
                entity_id=order.id,
                new_value={
                    'order_number': order_number,
                    'total': float(total),
                    'payment_method': payment_method
                },
                module_name='ecommerce'
            )

            # 9. Return order confirmation
            return order

