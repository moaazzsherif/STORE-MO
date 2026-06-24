from django.db import models
from apps.core.models import BaseTenantModel
from apps.accounts.models import User


class Notification(BaseTenantModel):
    NOTIFICATION_TYPES = [
        ('low_stock', 'Low Stock Alert'),
        ('new_order', 'New Order Alert'),
        ('shift', 'Shift Status Alert'),
        ('subscription', 'Subscription Alert'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications',
        null=True,
        blank=True
    )
    # Translation keys for localizing titles/bodies on the client
    title_key = models.CharField(max_length=255)
    body_key = models.CharField(max_length=255)
    params = models.JSONField(default=dict, blank=True)
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    is_read = models.BooleanField(default=False, db_index=True)

    def __str__(self):
        return f"{self.notification_type} - {self.title_key} (Read: {self.is_read})"
