from django.urls import path
from apps.reports.views import (
    SalesSummaryReportView,
    ProfitLossReportView,
    InventoryValuationReportView
)

urlpatterns = [
    path('sales/', SalesSummaryReportView.as_view(), name='report-sales'),
    path('profit-loss/', ProfitLossReportView.as_view(), name='report-profit-loss'),
    path('inventory-valuation/', InventoryValuationReportView.as_view(), name='report-inventory-valuation'),
]
