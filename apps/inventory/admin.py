from django.contrib import admin
from .models import Warehouse, Stock, InventoryMovement

@admin.register(Warehouse)
class WarehouseAdmin(admin.ModelAdmin):
    list_display = ('name', 'branch', 'location')
    search_fields = ('name', 'branch__name')
    list_filter = ('branch',)

@admin.register(Stock)
class StockAdmin(admin.ModelAdmin):
    list_display = ('product_variant', 'warehouse', 'quantity')
    search_fields = ('product_variant__sku', 'warehouse__name')
    list_filter = ('warehouse',)

@admin.register(InventoryMovement)
class InventoryMovementAdmin(admin.ModelAdmin):
    list_display = ('product_variant', 'warehouse', 'movement_type', 'quantity', 'created_at')
    search_fields = ('product_variant__sku', 'warehouse__name')
    list_filter = ('movement_type', 'created_at')
