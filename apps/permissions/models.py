from django.db import models
from apps.core.models import BaseTenantModel
from apps.accounts.models import User


class Permission(BaseTenantModel):
    # Format: module.action, e.g., product.create, sale.view
    code = models.CharField(max_length=100)
    name = models.CharField(max_length=255)

    class Meta(BaseTenantModel.Meta):
        constraints = BaseTenantModel.Meta.constraints + [
            models.UniqueConstraint(
                fields=['tenant', 'code'],
                name='permissions_permission_code_tenant_unique'
            )
        ]

    def __str__(self):
        return f"{self.code} ({self.tenant.name})"


class Role(BaseTenantModel):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    class Meta(BaseTenantModel.Meta):
        constraints = BaseTenantModel.Meta.constraints + [
            models.UniqueConstraint(
                fields=['tenant', 'name'],
                name='permissions_role_name_tenant_unique'
            )
        ]

    def __str__(self):
        return f"{self.name} ({self.tenant.name})"


class RolePermission(BaseTenantModel):
    role = models.ForeignKey(
        Role,
        on_delete=models.CASCADE,
        related_name='role_permissions'
    )
    permission = models.ForeignKey(
        Permission,
        on_delete=models.CASCADE,
        related_name='role_permissions'
    )

    class Meta(BaseTenantModel.Meta):
        constraints = BaseTenantModel.Meta.constraints + [
            models.UniqueConstraint(
                fields=['tenant', 'role', 'permission'],
                name='permissions_rolepermission_role_perm_tenant_unique'
            )
        ]

    def __str__(self):
        return f"{self.role.name} -> {self.permission.code}"


class UserRole(BaseTenantModel):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='user_roles'
    )
    role = models.ForeignKey(
        Role,
        on_delete=models.CASCADE,
        related_name='user_roles'
    )

    class Meta(BaseTenantModel.Meta):
        constraints = BaseTenantModel.Meta.constraints + [
            models.UniqueConstraint(
                fields=['tenant', 'user', 'role'],
                name='permissions_userrole_user_role_tenant_unique'
            )
        ]

    def __str__(self):
        return f"{self.user.email} -> {self.role.name}"
