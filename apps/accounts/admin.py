from django.contrib import admin
from .models import User, LoginHistory, DeviceTracking

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'first_name', 'last_name', 'tenant', 'is_staff', 'is_active')
    search_fields = ('email', 'first_name', 'last_name')
    list_filter = ('is_staff', 'is_active', 'tenant')

@admin.register(LoginHistory)
class LoginHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'ip_address', 'timestamp')
    search_fields = ('user__email', 'ip_address')
    list_filter = ('timestamp',)

@admin.register(DeviceTracking)
class DeviceTrackingAdmin(admin.ModelAdmin):
    list_display = ('user', 'device_name', 'last_login')
    search_fields = ('user__email', 'device_name')
