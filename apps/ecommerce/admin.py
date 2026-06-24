from django.contrib import admin
from .models import OnlineStore, EcommerceCategory, EcommerceProduct, Cart, CartItem, Order, OrderItem

@admin.register(OnlineStore)
class OnlineStoreAdmin(admin.ModelAdmin):
    list_display = ('name', 'domain', 'is_active')
    search_fields = ('name', 'domain')
    list_filter = ('is_active',)

@admin.register(EcommerceCategory)
class EcommerceCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent')
    search_fields = ('name',)

@admin.register(EcommerceProduct)
class EcommerceProductAdmin(admin.ModelAdmin):
    list_display = ('product_variant', 'is_visible', 'is_featured', 'online_price', 'stock_status')
    search_fields = ('product_variant__sku',)
    list_filter = ('is_visible', 'is_featured', 'stock_status')

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'session_id')
    search_fields = ('session_id', 'customer__first_name', 'customer__last_name')

@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('cart', 'product_variant', 'quantity', 'price_snapshot')
    search_fields = ('product_variant__sku',)

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'customer', 'status', 'total', 'payment_method', 'created_at')
    search_fields = ('order_number', 'customer__first_name', 'customer__last_name')
    list_filter = ('status', 'payment_method', 'created_at')

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('order', 'product_variant', 'quantity', 'price', 'total')
    search_fields = ('product_variant__sku',)
