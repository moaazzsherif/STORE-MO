from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from apps.purchases.models import PurchaseOrder, PurchaseOrderItem
from apps.purchases.serializers import PurchaseOrderSerializer, PurchaseOrderItemSerializer
from apps.purchases.services import PurchaseService
from apps.permissions.permissions import HasTenantPermission


class PurchaseOrderViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.all()
    serializer_class = PurchaseOrderSerializer
    permission_classes = [HasTenantPermission]
    permission_code_prefix = 'purchase'

    @action(detail=True, methods=['post'], url_path='receive')
    def receive(self, request, pk=None):
        po = get_object_or_404(PurchaseOrder, id=pk)
        try:
            po = PurchaseService.receive_purchase_order(po.id, request.user)
        except Exception as e:
            raise ValidationError(str(e))
        return Response(PurchaseOrderSerializer(po).data, status=status.HTTP_200_OK)


class PurchaseOrderItemViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrderItem.objects.all()
    serializer_class = PurchaseOrderItemSerializer
    permission_classes = [HasTenantPermission]
    permission_code_prefix = 'purchase'
