from rest_framework import serializers
from apps.shifts.models import Shift


class ShiftSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shift
        fields = (
            'id', 'branch', 'cashier', 'start_time', 'end_time',
            'opening_cash', 'closing_cash', 'expected_cash', 'actual_cash', 'status'
        )
        read_only_fields = ('id', 'cashier', 'start_time', 'end_time', 'expected_cash', 'status')


class StartShiftRequestSerializer(serializers.Serializer):
    branch_id = serializers.UUIDField()
    opening_cash = serializers.DecimalField(max_digits=12, decimal_places=2)


class CloseShiftRequestSerializer(serializers.Serializer):
    actual_cash = serializers.DecimalField(max_digits=12, decimal_places=2)
