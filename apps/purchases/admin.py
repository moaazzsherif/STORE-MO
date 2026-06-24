from django.contrib import admin
from .models import PurchaseOrder, PurchaseOrderItem

@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
    list_display = ('po_number', 'supplier', 'total_amount', 'status', 'created_at')
    search_fields = ('po_number', 'supplier__name')
    list_filter = ('status', 'created_at')

@admin.register(PurchaseOrderItem)
class PurchaseOrderItemAdmin(admin.ModelAdmin):
    list_display = ('purchase_order', 'product_variant', 'quantity', 'unit_cost', 'total_cost')
    search_fields = ('product_variant__sku',)
