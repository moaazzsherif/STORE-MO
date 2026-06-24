from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.purchases.views import PurchaseOrderViewSet, PurchaseOrderItemViewSet

router = DefaultRouter()
router.register('orders', PurchaseOrderViewSet, basename='order')
router.register('items', PurchaseOrderItemViewSet, basename='purchase-item')

urlpatterns = [
    path('', include(router.urls)),
]
