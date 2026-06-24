from django.contrib import admin
from .models import Category, Product, ProductVariant, Barcode, ProductImage

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'parent')
    search_fields = ('name', 'slug')

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'sku', 'is_active')
    search_fields = ('name', 'sku')
    list_filter = ('is_active', 'category')

@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ('product', 'name', 'sku', 'price', 'cost')
    search_fields = ('name', 'sku', 'product__name')

@admin.register(Barcode)
class BarcodeAdmin(admin.ModelAdmin):
    list_display = ('product_variant', 'code')
    search_fields = ('code', 'product_variant__sku')

@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ('product', 'is_primary')
