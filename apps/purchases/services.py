from django.core.exceptions import ValidationError
from django.db import transaction
from apps.core.services import BaseService
from apps.core.tenant_context import TenantContext
from apps.inventory.services import InventoryService
from apps.purchases.models import PurchaseOrder


class PurchaseService(BaseService):
    @classmethod
    def receive_purchase_order(cls, purchase_order_id, user):
        """
        Marks a Purchase Order as 'received' and increments inventory.
        Runs inside an atomic transaction to ensure stock synchronization.
        """
        with transaction.atomic():
            po = PurchaseOrder.objects.select_for_update().get(id=purchase_order_id)
            
            if po.status == 'received':
                raise ValidationError("This purchase order has already been received.")
            if po.status == 'cancelled':
                raise ValidationError("Cannot receive a cancelled purchase order.")

            old_status = po.status
            po.status = 'received'
            po.save(update_fields=['status'])

            # Increment stock for each item in the purchase order
            for item in po.items.all():
                InventoryService.create_movement(
                    warehouse=po.warehouse,
                    product_variant=item.product_variant,
                    movement_type='purchase',
                    quantity=item.quantity,  # positive quantity additions
                    created_by=user,
                    reference_id=po.id
                )

            # Audit log
            cls.log_audit(
                action='RECEIVE_PURCHASE_ORDER',
                entity='PurchaseOrder',
                entity_id=po.id,
                old_value={'status': old_status},
                new_value={'status': po.status},
                module_name='purchases'
            )

            return po
