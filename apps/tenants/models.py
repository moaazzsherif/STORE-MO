import uuid
from django.db import models
from apps.core.models import BaseTenantModel


class GlobalTenantManager(models.Manager):
    """
    Manager for global models that are NOT tenant-isolated (e.g. Tenant itself, SubscriptionPlan).
    Provides compatibility with .unfiltered() query patterns.
    """
    def unfiltered(self):
        return self.get_queryset()


class Tenant(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    subdomain = models.CharField(max_length=100, unique=True, db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)
    default_language = models.CharField(
        max_length=5,
        choices=[('en', 'English'), ('ar', 'Arabic')],
        default='en'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = GlobalTenantManager()

    def __str__(self):
        return self.name


class SubscriptionPlan(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    billing_cycle = models.CharField(
        max_length=20,
        choices=[('monthly', 'Monthly'), ('yearly', 'Yearly')]
    )
    features = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = GlobalTenantManager()

    def __str__(self):
        return self.name


class TenantSubscription(BaseTenantModel):
    plan = models.ForeignKey(
        SubscriptionPlan,
        on_delete=models.PROTECT,
        related_name='subscriptions'
    )
    status = models.CharField(
        max_length=50,
        choices=[
            ('active', 'Active'),
            ('trialing', 'Trialing'),
            ('past_due', 'Past Due'),
            ('canceled', 'Canceled'),
            ('expired', 'Expired')
        ],
        default='trialing'
    )
    start_date = models.DateField()
    end_date = models.DateField()

    def __str__(self):
        return f"{self.tenant.name} - {self.plan.name} ({self.status})"
