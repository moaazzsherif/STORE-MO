from rest_framework import viewsets
from apps.customers.models import Customer
from apps.customers.serializers import CustomerSerializer
from apps.permissions.permissions import HasTenantPermission


class CustomerViewSet(viewsets.ModelViewSet):
    """
    CRUD for Customers list.
    Enforces active tenant isolation and 'customer.*' RBAC permissions.
    """
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [HasTenantPermission]
    permission_code_prefix = 'customer'
