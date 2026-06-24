from rest_framework import viewsets
from apps.products.models import Category, Product, ProductVariant, Barcode, ProductImage
from apps.products.serializers import (
    CategorySerializer,
    ProductSerializer,
    ProductVariantSerializer,
    BarcodeSerializer,
    ProductImageSerializer
)
from apps.permissions.permissions import HasTenantPermission


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [HasTenantPermission]
    permission_code_prefix = 'category'


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [HasTenantPermission]
    permission_code_prefix = 'product'


class ProductVariantViewSet(viewsets.ModelViewSet):
    queryset = ProductVariant.objects.all()
    serializer_class = ProductVariantSerializer
    permission_classes = [HasTenantPermission]
    permission_code_prefix = 'product'


class BarcodeViewSet(viewsets.ModelViewSet):
    queryset = Barcode.objects.all()
    serializer_class = BarcodeSerializer
    permission_classes = [HasTenantPermission]
    permission_code_prefix = 'product'


class ProductImageViewSet(viewsets.ModelViewSet):
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer
    permission_classes = [HasTenantPermission]
    permission_code_prefix = 'product'
