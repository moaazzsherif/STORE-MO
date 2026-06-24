from rest_framework import viewsets
from apps.permissions.models import Role, Permission, RolePermission, UserRole
from apps.permissions.serializers import (
    PermissionSerializer,
    RoleSerializer,
    RolePermissionSerializer,
    UserRoleSerializer
)
from apps.permissions.permissions import HasTenantPermission


class PermissionViewSet(viewsets.ModelViewSet):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [HasTenantPermission]
    permission_code_prefix = 'permission'


class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [HasTenantPermission]
    permission_code_prefix = 'permission'


class RolePermissionViewSet(viewsets.ModelViewSet):
    queryset = RolePermission.objects.all()
    serializer_class = RolePermissionSerializer
    permission_classes = [HasTenantPermission]
    permission_code_prefix = 'permission'


class UserRoleViewSet(viewsets.ModelViewSet):
    queryset = UserRole.objects.all()
    serializer_class = UserRoleSerializer
    permission_classes = [HasTenantPermission]
    permission_code_prefix = 'permission'

