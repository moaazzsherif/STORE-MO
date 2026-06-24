from django.db import models
from apps.core.models import BaseTenantModel


class Customer(BaseTenantModel):
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=50)
    address = models.TextField(blank=True, null=True)
    loyalty_points = models.IntegerField(default=0)

    class Meta(BaseTenantModel.Meta):
        constraints = BaseTenantModel.Meta.constraints + [
            models.UniqueConstraint(
                fields=['tenant', 'phone'],
                name='customers_customer_phone_tenant_unique'
            )
        ]

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.phone})"
