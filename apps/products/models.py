from django.db import models
from apps.core.models import BaseTenantModel


class Category(BaseTenantModel):
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=100)
    parent = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='children'
    )

    class Meta(BaseTenantModel.Meta):
        constraints = BaseTenantModel.Meta.constraints + [
            models.UniqueConstraint(
                fields=['tenant', 'slug'],
                name='products_category_slug_tenant_unique'
            )
        ]

    def __str__(self):
        return self.name


class Product(BaseTenantModel):
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='products'
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    sku = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)

    class Meta(BaseTenantModel.Meta):
        constraints = BaseTenantModel.Meta.constraints + [
            models.UniqueConstraint(
                fields=['tenant', 'sku'],
                name='products_product_sku_tenant_unique'
            )
        ]

    def __str__(self):
        return self.name


class ProductVariant(BaseTenantModel):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='variants'
    )
    name = models.CharField(max_length=255)  # e.g., "Size: L, Color: Red"
    sku = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    cost = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta(BaseTenantModel.Meta):
        constraints = BaseTenantModel.Meta.constraints + [
            models.UniqueConstraint(
                fields=['tenant', 'sku'],
                name='products_variant_sku_tenant_unique'
            )
        ]

    def __str__(self):
        return f"{self.product.name} - {self.name}"


class Barcode(BaseTenantModel):
    product_variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.CASCADE,
        related_name='barcodes'
    )
    code = models.CharField(max_length=100)

    class Meta(BaseTenantModel.Meta):
        constraints = BaseTenantModel.Meta.constraints + [
            models.UniqueConstraint(
                fields=['tenant', 'code'],
                name='products_barcode_code_tenant_unique'
            )
        ]

    def __str__(self):
        return f"{self.code} -> {self.product_variant.sku}"


class ProductImage(BaseTenantModel):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='images'
    )
    image = models.ImageField(upload_to='product_images/')
    is_primary = models.BooleanField(default=False)

    def __str__(self):
        return f"Image for {self.product.name} ({'Primary' if self.is_primary else 'Secondary'})"
