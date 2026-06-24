from django.contrib import admin
from .models import Sale, SaleItem

@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ('invoice_number', 'branch', 'customer', 'total_amount', 'payment_method', 'created_at')
    search_fields = ('invoice_number', 'customer__first_name', 'customer__last_name')
    list_filter = ('payment_method', 'created_at', 'branch')

@admin.register(SaleItem)
class SaleItemAdmin(admin.ModelAdmin):
    list_display = ('sale', 'product_variant', 'quantity', 'unit_price', 'total_price')
    search_fields = ('product_variant__sku',)
