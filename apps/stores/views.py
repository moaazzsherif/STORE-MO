from rest_framework import viewsets
from apps.stores.models import Store
from apps.stores.serializers import StoreSerializer
from apps.permissions.permissions import HasTenantPermission


class StoreViewSet(viewsets.ModelViewSet):
    """
    CRUD for Tenant Stores.
    Enforces active tenant isolation and 'store.*' RBAC permissions.
    """
    queryset = Store.objects.all()
    serializer_class = StoreSerializer
    permission_classes = [HasTenantPermission]
    permission_code_prefix = 'store'
