from django.contrib import admin
from .models import Supplier, SupplierProduct

@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ('name', 'contact_name', 'phone', 'email')
    search_fields = ('name', 'contact_name', 'phone')

@admin.register(SupplierProduct)
class SupplierProductAdmin(admin.ModelAdmin):
    list_display = ('supplier', 'product_variant', 'unit_cost')
    search_fields = ('product_variant__sku', 'supplier__name')
