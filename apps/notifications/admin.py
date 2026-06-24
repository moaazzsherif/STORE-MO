from django.contrib import admin
from .models import Notification

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('title_key', 'user', 'notification_type', 'is_read', 'created_at')
    search_fields = ('title_key', 'user__email')
    list_filter = ('notification_type', 'is_read', 'created_at')
