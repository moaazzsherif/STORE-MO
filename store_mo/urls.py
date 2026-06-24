from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # SimpleJWT Authentication routes
    path('api/v1/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/v1/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/v1/auth/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # Versioned Core Modules
    path('api/v1/tenants/', include('apps.tenants.urls')),
    path('api/v1/accounts/', include('apps.accounts.urls')),
    path('api/v1/permissions/', include('apps.permissions.urls')),
    path('api/v1/stores/', include('apps.stores.urls')),
    path('api/v1/branches/', include('apps.branches.urls')),
    path('api/v1/employees/', include('apps.employees.urls')),
    path('api/v1/shifts/', include('apps.shifts.urls')),
    path('api/v1/products/', include('apps.products.urls')),
    path('api/v1/inventory/', include('apps.inventory.urls')),
    path('api/v1/sales/', include('apps.sales.urls')),
    path('api/v1/purchases/', include('apps.purchases.urls')),
    path('api/v1/customers/', include('apps.customers.urls')),
    path('api/v1/suppliers/', include('apps.suppliers.urls')),
    path('api/v1/ecommerce/', include('apps.ecommerce.urls')),
    path('api/v1/billing/', include('apps.billing.urls')),
    path('api/v1/reports/', include('apps.reports.urls')),
    path('api/v1/notifications/', include('apps.notifications.urls')),
    path('api/v1/audit/', include('apps.audit.urls')),
    path('api/v1/ai/', include('apps.ai.urls')),
]
