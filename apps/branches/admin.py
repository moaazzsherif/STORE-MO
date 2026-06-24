from django.contrib import admin
from .models import Branch

@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display = ('name', 'store', 'phone', 'is_active')
    search_fields = ('name', 'phone')
    list_filter = ('is_active', 'store')
