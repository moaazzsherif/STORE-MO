from django.db import models
from apps.core.models import BaseTenantModel
from apps.accounts.models import User
from apps.branches.models import Branch


class Employee(BaseTenantModel):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='employee_profiles'
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.SET_NULL,
        related_name='employees',
        null=True,
        blank=True
    )
    employee_code = models.CharField(max_length=50)
    position = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)

    class Meta(BaseTenantModel.Meta):
        constraints = BaseTenantModel.Meta.constraints + [
            models.UniqueConstraint(
                fields=['tenant', 'employee_code'],
                name='employees_employee_code_tenant_unique'
            ),
            models.UniqueConstraint(
                fields=['tenant', 'user'],
                name='employees_employee_user_tenant_unique'
            )
        ]

    def __str__(self):
        return f"{self.user.email} - {self.position} ({self.tenant.name})"
