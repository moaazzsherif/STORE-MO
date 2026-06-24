from django.db import models
from apps.core.models import BaseTenantModel
from apps.suppliers.models import Supplier
from apps.inventory.models import Warehouse
from apps.accounts.models import User


class PurchaseOrder(BaseTenantModel):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('ordered', 'Ordered'),
        ('received', 'Received'),
        ('cancelled', 'Cancelled'),
    ]

    supplier = models.ForeignKey(
        Supplier,
        on_delete=models.CASCADE,
        related_name='purchase_orders'
    )
    warehouse = models.ForeignKey(
        Warehouse,
        on_delete=models.CASCADE,
        related_name='purchase_orders'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='purchase_orders'
    )
    po_number = models.CharField(max_length=100)
    currency = models.CharField(
        max_length=5,
        choices=[('EGP', 'EGP'), ('USD', 'USD'), ('SAR', 'SAR'), ('AED', 'AED')],
        default='EGP'
    )

    class Meta(BaseTenantModel.Meta):
        constraints = BaseTenantModel.Meta.constraints + [
            models.UniqueConstraint(
                fields=['tenant', 'po_number'],
                name='purchases_po_number_tenant_unique'
            )
        ]

    def __str__(self):
        return f"PO {self.po_number} - {self.supplier.name} ({self.status})"


class PurchaseOrderItem(BaseTenantModel):
    purchase_order = models.ForeignKey(
        PurchaseOrder,
        on_delete=models.CASCADE,
        related_name='items'
    )
    product_variant = models.ForeignKey(
        'products.ProductVariant',
        on_delete=models.PROTECT,
        related_name='purchase_order_items'
    )
    quantity = models.IntegerField()
    unit_cost = models.DecimalField(max_digits=12, decimal_places=2)
    total_cost = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"{self.product_variant.sku} x {self.quantity}"
