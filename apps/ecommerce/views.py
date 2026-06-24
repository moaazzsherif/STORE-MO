import uuid
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from apps.ecommerce.models import (
    OnlineStore,
    EcommerceCategory,
    EcommerceProduct,
    Cart,
    CartItem,
    Order,
    OrderItem
)
from apps.ecommerce.serializers import (
    OnlineStoreSerializer,
    EcommerceCategorySerializer,
    EcommerceProductSerializer,
    CartSerializer,
    CartItemSerializer,
    OrderSerializer,
    AddCartItemSerializer,
    CreateCartSerializer,
    CreateEcommerceOrderSerializer
)
from apps.products.models import ProductVariant
from apps.customers.models import Customer
from apps.ecommerce.services import EcommerceService
from apps.permissions.permissions import HasTenantPermission
from apps.core.tenant_context import TenantContext


class OnlineStoreViewSet(viewsets.ModelViewSet):
    queryset = OnlineStore.objects.all()
    serializer_class = OnlineStoreSerializer
    permission_classes = [HasTenantPermission]
    permission_code_prefix = 'ecommerce'


class EcommerceCategoryViewSet(viewsets.ModelViewSet):
    queryset = EcommerceCategory.objects.all()
    serializer_class = EcommerceCategorySerializer
    permission_classes = [HasTenantPermission]
    permission_code_prefix = 'ecommerce'


class EcommerceProductViewSet(viewsets.ModelViewSet):
    queryset = EcommerceProduct.objects.all()
    serializer_class = EcommerceProductSerializer
    permission_classes = [HasTenantPermission]
    permission_code_prefix = 'ecommerce'


class CartViewSet(viewsets.ModelViewSet):
    """
    ViewSet to manage shopping carts.
    Allows cart creation, adding items, and viewing items.
    """
    queryset = Cart.objects.all()
    serializer_class = CartSerializer
    permission_classes = [HasTenantPermission]
    permission_code_prefix = 'ecommerce'

    def create(self, request, *args, **kwargs):
        serializer = CreateCartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        customer = None
        if data.get('customer_id'):
            customer = get_object_or_404(Customer, id=data['customer_id'])

        session_id = data.get('session_id') or str(uuid.uuid4())

        cart = Cart.objects.create(
            tenant_id=TenantContext.get_current_tenant_id(),
            customer=customer,
            session_id=session_id
        )
        return Response(CartSerializer(cart).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='add')
    def add_item(self, request, pk=None):
        cart = self.get_object()
        serializer = AddCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        variant = get_object_or_404(ProductVariant, id=data['product_variant_id'])
        qty = data['quantity']

        try:
            EcommerceService.add_to_cart(
                cart=cart,
                product_variant=variant,
                quantity=qty
            )
        except Exception as e:
            raise ValidationError(str(e))

        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)



class OrderViewSet(viewsets.ModelViewSet):
    """
    ViewSet to manage ecommerce Orders.
    Includes /checkout/ action to convert Cart -> Order.
    """
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [HasTenantPermission]
    permission_code_prefix = 'ecommerce'

    @action(detail=False, methods=['post'], url_path='checkout')
    def checkout(self, request):
        serializer = CreateEcommerceOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        cart = get_object_or_404(Cart, id=data['cart_id'])

        try:
            order = EcommerceService.create_order(
                cart=cart,
                payment_method=data['payment_method'],
                customer=cart.customer,
                discount_amount=data['discount_amount'],
                tax_amount=data['tax_amount'],
                created_by_user=request.user
            )
        except Exception as e:
            raise ValidationError(str(e))

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

