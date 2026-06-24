from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
from apps.reports.selectors import ReportSelectors
from apps.reports.serializers import DateRangeReportSerializer
from apps.permissions.permissions import HasTenantPermission


class SalesSummaryReportView(APIView):
    permission_classes = [HasTenantPermission]
    permission_code_prefix = 'report'

    def get(self, request):
        serializer = DateRangeReportSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        end_date = data.get('end_date') or timezone.now()
        start_date = data.get('start_date') or (end_date - timedelta(days=30))

        summary = ReportSelectors.get_sales_summary(start_date, end_date)
        return Response(summary, status=status.HTTP_200_OK)


class ProfitLossReportView(APIView):
    permission_classes = [HasTenantPermission]
    permission_code_prefix = 'report'

    def get(self, request):
        serializer = DateRangeReportSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        end_date = data.get('end_date') or timezone.now()
        start_date = data.get('start_date') or (end_date - timedelta(days=30))

        pl_data = ReportSelectors.get_profit_loss(start_date, end_date)
        return Response(pl_data, status=status.HTTP_200_OK)


class InventoryValuationReportView(APIView):
    permission_classes = [HasTenantPermission]
    permission_code_prefix = 'report'

    def get(self, request):
        valuation = ReportSelectors.get_inventory_valuation()
        return Response(valuation, status=status.HTTP_200_OK)
