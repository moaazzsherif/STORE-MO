from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.ecommerce.views import (
    OnlineStoreViewSet,
    EcommerceCategoryViewSet,
    EcommerceProductViewSet,
    CartViewSet,
    OrderViewSet
)

router = DefaultRouter()
router.register('stores', OnlineStoreViewSet, basename='store')
router.register('categories', EcommerceCategoryViewSet, basename='category')
router.register('products', EcommerceProductViewSet, basename='product')
router.register('carts', CartViewSet, basename='cart')
router.register('orders', OrderViewSet, basename='order')

urlpatterns = [
    path('', include(router.urls)),
]
