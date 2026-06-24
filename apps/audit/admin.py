from django.contrib import admin
from .models import AuditLog

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('user_id', 'action', 'entity', 'entity_id', 'ip_address', 'timestamp')
    search_fields = ('action', 'entity', 'user_id')
    list_filter = ('action', 'timestamp')
