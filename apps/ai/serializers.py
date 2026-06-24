from rest_framework import serializers


class AIDemandForecastRequestSerializer(serializers.Serializer):
    product_variant_id = serializers.UUIDField()
    forecast_days = serializers.IntegerField(default=30)
