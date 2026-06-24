from rest_framework import status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from apps.branches.models import Branch
from apps.shifts.models import Shift
from apps.shifts.serializers import (
    ShiftSerializer,
    StartShiftRequestSerializer,
    CloseShiftRequestSerializer
)
from apps.shifts.services import ShiftService
from apps.permissions.permissions import HasTenantPermission


class StartShiftAPIView(APIView):
    """
    POST /api/v1/shifts/start
    Opens a new cashier POS shift session with starting opening cash.
    """
    permission_classes = [HasTenantPermission]
    permission_code_prefix = 'shift'

    def post(self, request):
        serializer = StartShiftRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        branch = get_object_or_404(Branch, id=data['branch_id'])

        try:
            shift = ShiftService.start_shift(
                branch=branch,
                cashier=request.user,
                opening_cash=data['opening_cash']
            )
        except Exception as e:
            raise ValidationError(str(e))

        return Response(ShiftSerializer(shift).data, status=status.HTTP_201_CREATED)


class CloseShiftAPIView(APIView):
    """
    POST /api/v1/shifts/close
    Closes the current active POS shift, counts closing cash, and returns expected vs actual differences.
    """
    permission_classes = [HasTenantPermission]
    permission_code_prefix = 'shift'

    def post(self, request):
        serializer = CloseShiftRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # Find the active cashier's open shift in the active tenant context
        shift = Shift.objects.filter(cashier=request.user, status='open').first()
        if not shift:
            raise ValidationError("No active open shift session found for this cashier.")

        try:
            shift, difference = ShiftService.close_shift(
                shift=shift,
                actual_cash=data['actual_cash']
            )
        except Exception as e:
            raise ValidationError(str(e))

        return Response({
            'shift': ShiftSerializer(shift).data,
            'difference': difference
        }, status=status.HTTP_200_OK)


class ShiftViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only history tracking for Shifts.
    """
    queryset = Shift.objects.all()
    serializer_class = ShiftSerializer
    permission_classes = [HasTenantPermission]
    permission_code_prefix = 'shift'

