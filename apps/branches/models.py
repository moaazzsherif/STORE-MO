from django.db import models
from apps.core.models import BaseTenantModel
from apps.stores.models import Store


class Branch(BaseTenantModel):
    store = models.ForeignKey(
        Store,
        on_delete=models.CASCADE,
        related_name='branches'
    )
    name = models.CharField(max_length=255)
    address = models.TextField(blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta(BaseTenantModel.Meta):
        constraints = BaseTenantModel.Meta.constraints + [
            models.UniqueConstraint(
                fields=['tenant', 'name'],
                name='branches_branch_name_tenant_unique'
            )
        ]

    def __str__(self):
        return f"{self.name} - {self.store.name}"
