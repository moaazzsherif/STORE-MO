from django.db import models
from apps.core.models import BaseTenantModel


class Store(BaseTenantModel):
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=100)
    logo = models.ImageField(upload_to='store_logos/', null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta(BaseTenantModel.Meta):
        constraints = BaseTenantModel.Meta.constraints + [
            models.UniqueConstraint(
                fields=['tenant', 'slug'],
                name='stores_store_slug_tenant_unique'
            )
        ]

    def __str__(self):
        return f"{self.name} ({self.tenant.name})"
