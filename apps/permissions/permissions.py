from rest_framework.permissions import BasePermission
from apps.permissions.models import UserRole, RolePermission


class HasTenantPermission(BasePermission):
    """
    Custom DRF Permission Class that enforces Tenant RBAC rules.
    Views using this permission must declare `permission_code_prefix` (e.g., 'product').
    Maps HTTP methods to actions:
      - GET -> view
      - POST -> create
      - PUT/PATCH -> update
      - DELETE -> delete
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # Superadmins bypass all role constraints
        if request.user.is_superuser:
            return True

        prefix = getattr(view, 'permission_code_prefix', None)
        # If no prefix is specified, default to requiring authentication only
        if not prefix:
            return True

        # Resolve action name from request method
        method_action_map = {
            'GET': 'view',
            'POST': 'create',
            'PUT': 'update',
            'PATCH': 'update',
            'DELETE': 'delete'
        }
        action = method_action_map.get(request.method)
        if not action:
            return False

        required_permission_code = f"{prefix}.{action}"

        # Fetch roles assigned to this user in the active tenant context
        # Automatic tenant isolation is applied via TenantManager
        user_role_ids = UserRole.objects.filter(user=request.user).values_list('role_id', flat=True)
        if not user_role_ids:
            return False

        # Verify if any role maps to the required permission code
        has_permission = RolePermission.objects.filter(
            role_id__in=user_role_ids,
            permission__code=required_permission_code
        ).exists()

        return has_permission
