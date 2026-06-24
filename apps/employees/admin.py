from django.contrib import admin
from .models import Employee

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('user', 'branch', 'employee_code', 'position', 'is_active')
    search_fields = ('user__email', 'employee_code', 'position')
    list_filter = ('is_active', 'branch')
