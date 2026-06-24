from rest_framework import viewsets, mixins
from rest_framework.exceptions import ValidationError
from apps.inventory.models import Warehouse, Stock, InventoryMovement
from apps.inventory.serializers import (
    WarehouseSerializer,
    StockSerializer,
    InventoryMovementSerializer
)
from apps.permissions.permissions import HasTenantPermission
from apps.inventory.services import InventoryService


class WarehouseViewSet(viewsets.ModelViewSet):
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer
    permission_classes = [HasTenantPermission]
    permission_code_prefix = 'inventory'


class StockViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only view of cached stock quantities.
    Direct modification of Stock cache is blocked.
    """
    queryset = Stock.objects.all()
    serializer_class = StockSerializer
    permission_classes = [HasTenantPermission]
    permission_code_prefix = 'inventory'


class InventoryMovementViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet
):

    """
    Handles inventory movement logs (sales, purchases, damage logs, etc.).
    Delegates create events to InventoryService for locking and stock synchronization.
    """
    queryset = InventoryMovement.objects.all()
    serializer_class = InventoryMovementSerializer
    permission_classes = [HasTenantPermission]
    permission_code_prefix = 'inventory'

    def perform_create(self, serializer):
        # Extract validated fields
        data = serializer.validated_data
        
        try:
            # Delegate entire stock lock + log + audit execution to the Service Layer
            InventoryService.create_movement(
                warehouse=data['warehouse'],
                product_variant=data['product_variant'],
                movement_type=data['movement_type'],
                quantity=data['quantity'],
                created_by=self.request.user,
                reference_id=data.get('reference_id')
            )
        except Exception as e:
            raise ValidationError(str(e))

