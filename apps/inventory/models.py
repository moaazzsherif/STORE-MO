from django.db import models
from apps.core.models import BaseTenantModel
from apps.core.tenant_manager import TenantQuerySet, TenantManager
from apps.branches.models import Branch
from apps.accounts.models import User


class Warehouse(BaseTenantModel):
    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name='warehouses'
    )
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True, null=True)

    class Meta(BaseTenantModel.Meta):
        constraints = BaseTenantModel.Meta.constraints + [
            models.UniqueConstraint(
                fields=['tenant', 'branch', 'name'],
                name='inventory_warehouse_branch_name_tenant_unique'
            )
        ]

    def __str__(self):
        return f"{self.name} ({self.branch.name})"


class StockQuerySet(TenantQuerySet):
    def update(self, *args, **kwargs):
        """
        Guard against bulk database updates to stock quantities.
        """
        if 'quantity' in kwargs and not getattr(self, '_bypass_stock_guard', False):
            raise PermissionError(
                "Security Alert: Direct database stock updates are prohibited. "
                "Stock must only be modified via InventoryMovement."
            )
        return super().update(*args, **kwargs)


class StockManager(TenantManager):
    def get_queryset(self):
        tid = self.model._meta.get_field('tenant').related_model.objects.unfiltered()
        # Returns the custom queryset containing the bulk update block
        qs = StockQuerySet(self.model, using=self._db).active()
        from apps.core.tenant_context import TenantContext
        tid = TenantContext.get_current_tenant_id()
        if tid:
            return qs.filter(tenant_id=tid)
        return qs.none()


class Stock(BaseTenantModel):
    warehouse = models.ForeignKey(
        Warehouse,
        on_delete=models.CASCADE,
        related_name='stocks'
    )
    product_variant = models.ForeignKey(
        'products.ProductVariant',
        on_delete=models.CASCADE,
        related_name='stocks'
    )
    quantity = models.IntegerField(default=0)

    objects = StockManager()

    class Meta(BaseTenantModel.Meta):
        constraints = BaseTenantModel.Meta.constraints + [
            models.UniqueConstraint(
                fields=['tenant', 'warehouse', 'product_variant'],
                name='inventory_stock_warehouse_variant_tenant_unique'
            )
        ]

    def save(self, *args, **kwargs):
        """
        Guard against direct saving of stock adjustments.
        Requires _bypass_stock_guard=True to write.
        """
        if not getattr(self, '_bypass_stock_guard', False):
            raise PermissionError(
                "Security Alert: Direct stock saving is prohibited. "
                "Stock must only be modified via InventoryMovement."
            )
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.product_variant.sku} @ {self.warehouse.name}: {self.quantity}"


class InventoryMovement(BaseTenantModel):
    MOVEMENT_TYPES = [
        ('sale', 'Sale'),
        ('purchase', 'Purchase'),
        ('return', 'Return'),
        ('damage', 'Damage'),
        ('adjustment', 'Adjustment'),
        ('transfer', 'Transfer'),
    ]

    warehouse = models.ForeignKey(
        Warehouse,
        on_delete=models.CASCADE,
        related_name='movements'
    )
    product_variant = models.ForeignKey(
        'products.ProductVariant',
        on_delete=models.CASCADE,
        related_name='movements'
    )
    movement_type = models.CharField(max_length=20, choices=MOVEMENT_TYPES)
    # Positive for additions (purchase, return, etc.), Negative for deductions (sale, damage, etc.)
    quantity = models.IntegerField()
    reference_id = models.UUIDField(null=True, blank=True, db_index=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='inventory_movements'
    )

    def __str__(self):
        return f"{self.movement_type} - {self.product_variant.sku} ({self.quantity})"
