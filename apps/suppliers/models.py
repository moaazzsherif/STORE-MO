from django.db import models
from apps.core.models import BaseTenantModel


class Supplier(BaseTenantModel):
    name = models.CharField(max_length=255)
    contact_name = models.CharField(max_length=255, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    class Meta(BaseTenantModel.Meta):
        constraints = BaseTenantModel.Meta.constraints + [
            models.UniqueConstraint(
                fields=['tenant', 'name'],
                name='suppliers_supplier_name_tenant_unique'
            )
        ]

    def __str__(self):
        return f"{self.name} ({self.tenant.name})"


class SupplierProduct(BaseTenantModel):
    supplier = models.ForeignKey(
        Supplier,
        on_delete=models.CASCADE,
        related_name='supplier_products'
    )
    product_variant = models.ForeignKey(
        'products.ProductVariant',
        on_delete=models.CASCADE,
        related_name='supplier_products'
    )
    supplier_sku = models.CharField(max_length=100, blank=True, null=True)
    unit_cost = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta(BaseTenantModel.Meta):
        constraints = BaseTenantModel.Meta.constraints + [
            models.UniqueConstraint(
                fields=['tenant', 'supplier', 'product_variant'],
                name='suppliers_supplierproduct_variant_tenant_unique'
            )
        ]

    def __str__(self):
        return f"{self.supplier.name} -> {self.product_variant.sku}"
