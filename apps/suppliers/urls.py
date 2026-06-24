from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.suppliers.views import SupplierViewSet, SupplierProductViewSet

router = DefaultRouter()
router.register('vendors', SupplierViewSet, basename='vendor')
router.register('products', SupplierProductViewSet, basename='supplier-product')

urlpatterns = [
    path('', include(router.urls)),
]
