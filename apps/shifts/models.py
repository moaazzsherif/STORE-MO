from django.db import models
from apps.core.models import BaseTenantModel
from apps.branches.models import Branch
from apps.accounts.models import User


class Shift(BaseTenantModel):
    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name='shifts'
    )
    cashier = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='shifts'
    )
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    opening_cash = models.DecimalField(max_digits=12, decimal_places=2)
    closing_cash = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    expected_cash = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    actual_cash = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=[('open', 'Open'), ('closed', 'Closed')],
        default='open',
        db_index=True
    )

    def __str__(self):
        return f"Shift {self.id} ({self.cashier.email}) - {self.status}"
