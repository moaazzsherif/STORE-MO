from django.contrib import admin
from .models import Invoice

@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('id', 'subscription', 'amount', 'status', 'due_date', 'paid_at')
    search_fields = ('id', 'subscription__tenant__name')
    list_filter = ('status', 'due_date')
