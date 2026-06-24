from rest_framework import viewsets
from apps.suppliers.models import Supplier, SupplierProduct
from apps.suppliers.serializers import SupplierSerializer, SupplierProductSerializer
from apps.permissions.permissions import HasTenantPermission


class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [HasTenantPermission]
    permission_code_prefix = 'supplier'


class SupplierProductViewSet(viewsets.ModelViewSet):
    queryset = SupplierProduct.objects.all()
    serializer_class = SupplierProductSerializer
    permission_classes = [HasTenantPermission]
    permission_code_prefix = 'supplier'

