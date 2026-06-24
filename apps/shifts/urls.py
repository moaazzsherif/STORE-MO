from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.shifts.views import ShiftViewSet, StartShiftAPIView, CloseShiftAPIView

router = DefaultRouter()
router.register('', ShiftViewSet, basename='shift')

urlpatterns = [
    path('start', StartShiftAPIView.as_view(), name='shift-start'),
    path('close', CloseShiftAPIView.as_view(), name='shift-close'),
    path('', include(router.urls)),
]
