from django.urls import path
from apps.ai.views import (
    AIDemandForecastingView,
    AISalesPredictionView,
    AIInventorySuggestionsView
)

urlpatterns = [
    path('demand-forecast/', AIDemandForecastingView.as_view(), name='ai-demand-forecast'),
    path('sales-prediction/', AISalesPredictionView.as_view(), name='ai-sales-prediction'),
    path('inventory-suggestions/', AIInventorySuggestionsView.as_view(), name='ai-inventory-suggestions'),
]
