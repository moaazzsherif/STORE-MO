from rest_framework import serializers
from apps.ecommerce.models import (
    OnlineStore,
    EcommerceCategory,
    EcommerceProduct,
    Cart,
    CartItem,
    Order,
    OrderItem
)


class OnlineStoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = OnlineStore
        fields = '__all__'


class EcommerceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = EcommerceCategory
        fields = '__all__'


class EcommerceProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = EcommerceProduct
        fields = '__all__'


class CartItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = CartItem
        fields = ('id', 'product_variant', 'quantity', 'price_snapshot')


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = ('id', 'customer', 'session_id', 'items')


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ('id', 'product_variant', 'quantity', 'price', 'total')


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = (
            'id', 'customer', 'status', 'subtotal', 'discount',
            'tax', 'total', 'payment_method', 'order_number', 'created_at', 'items'
        )


class AddCartItemSerializer(serializers.Serializer):
    product_variant_id = serializers.UUIDField()
    quantity = serializers.IntegerField(min_value=1, default=1)


class CreateCartSerializer(serializers.Serializer):
    customer_id = serializers.UUIDField(required=False, allow_null=True)
    session_id = serializers.CharField(max_length=255, required=False, allow_blank=True)


class CreateEcommerceOrderSerializer(serializers.Serializer):
    cart_id = serializers.UUIDField()
    payment_method = serializers.ChoiceField(choices=['cod', 'card', 'wallet'])
    discount_amount = serializers.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    tax_amount = serializers.DecimalField(max_digits=12, decimal_places=2, default=0.0)
