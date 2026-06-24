from django.db import models
from django.core.validators import MinValueValidator
from apps.core.models import BaseTenantModel
from apps.branches.models import Branch
from apps.shifts.models import Shift
from apps.accounts.models import User


class Sale(BaseTenantModel):
    PAYMENT_METHODS = [
        ('cash', 'Cash'),
        ('card', 'Card'),
        ('wallet', 'Wallet'),
    ]

    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name='sales'
    )
    shift = models.ForeignKey(
        Shift,
        on_delete=models.CASCADE,
        related_name='sales'
    )
    cashier = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='sales'
    )
    # Reference customers.Customer as string to avoid circular dependency
    customer = models.ForeignKey(
        'customers.Customer',
        on_delete=models.SET_NULL,
        related_name='sales',
        null=True,
        blank=True
    )
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHODS)
    invoice_number = models.CharField(max_length=100)

    class Meta(BaseTenantModel.Meta):
        constraints = BaseTenantModel.Meta.constraints + [
            models.UniqueConstraint(
                fields=['tenant', 'invoice_number'],
                name='sales_sale_invoice_tenant_unique'
            )
        ]

    def __str__(self):
        return f"Invoice {self.invoice_number} - Total {self.total_amount}"


class SaleItem(BaseTenantModel):
    sale = models.ForeignKey(
        Sale,
        on_delete=models.CASCADE,
        related_name='items'
    )
    product_variant = models.ForeignKey(
        'products.ProductVariant',
        on_delete=models.PROTECT,
        related_name='sale_items'
    )
    quantity = models.IntegerField(validators=[MinValueValidator(1)])
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"{self.product_variant.sku} x {self.quantity}"
