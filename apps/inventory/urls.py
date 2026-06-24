from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.inventory.views import WarehouseViewSet, StockViewSet, InventoryMovementViewSet

router = DefaultRouter()
router.register('warehouses', WarehouseViewSet, basename='warehouse')
router.register('stock-levels', StockViewSet, basename='stock-level')
router.register('movements', InventoryMovementViewSet, basename='movement')

urlpatterns = [
    path('', include(router.urls)),
]
