from django.contrib import admin
from .models import Shift

@admin.register(Shift)
class ShiftAdmin(admin.ModelAdmin):
    list_display = ('branch', 'cashier', 'start_time', 'end_time', 'status', 'actual_cash')
    search_fields = ('cashier__email', 'branch__name')
    list_filter = ('status', 'branch')
