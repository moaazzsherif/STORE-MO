from rest_framework import serializers
from apps.sales.models import Sale, SaleItem


class SaleItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = SaleItem
        fields = ('id', 'product_variant', 'quantity', 'unit_price', 'discount_amount', 'total_price')


class SaleSerializer(serializers.ModelSerializer):
    items = SaleItemSerializer(many=True, read_only=True)

    class Meta:
        model = Sale
        fields = (
            'id', 'branch', 'shift', 'cashier', 'customer', 'subtotal',
            'discount_amount', 'tax_amount', 'total_amount', 'payment_method',
            'invoice_number', 'created_at', 'items'
        )


class SaleItemCreateSerializer(serializers.Serializer):
    product_variant_id = serializers.UUIDField()
    quantity = serializers.IntegerField(min_value=1)
    unit_price = serializers.DecimalField(max_digits=12, decimal_places=2)
    discount_amount = serializers.DecimalField(max_digits=12, decimal_places=2, default=0.0)


class CreateSaleSerializer(serializers.Serializer):
    branch_id = serializers.UUIDField()
    shift_id = serializers.UUIDField()
    payment_method = serializers.ChoiceField(choices=['cash', 'card', 'wallet'])
    customer_id = serializers.UUIDField(required=False, allow_null=True)
    tax_amount = serializers.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    items = SaleItemCreateSerializer(many=True)
