from rest_framework import viewsets
from apps.employees.models import Employee
from apps.employees.serializers import EmployeeSerializer
from apps.permissions.permissions import HasTenantPermission


class EmployeeViewSet(viewsets.ModelViewSet):
    """
    CRUD for Tenant Employees.
    Enforces active tenant isolation and 'employee.*' RBAC permissions.
    """
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [HasTenantPermission]
    permission_code_prefix = 'employee'
