from rest_framework import viewsets
from apps.branches.models import Branch
from apps.branches.serializers import BranchSerializer
from apps.permissions.permissions import HasTenantPermission


class BranchViewSet(viewsets.ModelViewSet):
    """
    CRUD for Store Branches.
    Enforces active tenant isolation and 'branch.*' RBAC permissions.
    """
    queryset = Branch.objects.all()
    serializer_class = BranchSerializer
    permission_classes = [HasTenantPermission]
    permission_code_prefix = 'branch'
