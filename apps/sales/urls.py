from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.sales.views import SaleViewSet, CreateSaleAPIView

router = DefaultRouter()
router.register('', SaleViewSet, basename='sale')

urlpatterns = [
    path('create', CreateSaleAPIView.as_view(), name='sale-create'),
    path('', include(router.urls)),
]
