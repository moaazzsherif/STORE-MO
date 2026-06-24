from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.products.views import (
    CategoryViewSet,
    ProductViewSet,
    ProductVariantViewSet,
    BarcodeViewSet,
    ProductImageViewSet
)

router = DefaultRouter()
router.register('categories', CategoryViewSet, basename='category')
router.register('items', ProductViewSet, basename='product')
router.register('variants', ProductVariantViewSet, basename='variant')
router.register('barcodes', BarcodeViewSet, basename='barcode')
router.register('images', ProductImageViewSet, basename='image')

urlpatterns = [
    path('', include(router.urls)),
]
