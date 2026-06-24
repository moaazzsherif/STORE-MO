from django.contrib import admin
from .models import Tenant, SubscriptionPlan, TenantSubscription

@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'subdomain', 'is_active', 'created_at')
    search_fields = ('name', 'subdomain')
    list_filter = ('is_active',)

@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'billing_cycle')
    search_fields = ('name',)
    list_filter = ('billing_cycle',)

@admin.register(TenantSubscription)
class TenantSubscriptionAdmin(admin.ModelAdmin):
    list_display = ('tenant', 'plan', 'start_date', 'end_date', 'status')
    search_fields = ('tenant__name', 'plan__name')
    list_filter = ('status',)
