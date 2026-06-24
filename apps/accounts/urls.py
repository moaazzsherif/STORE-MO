from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.accounts.views import (
    RegisterUserView,
    UserViewSet,
    LoginHistoryViewSet,
    DeviceTrackingViewSet
)

router = DefaultRouter()
router.register('users', UserViewSet, basename='user')
router.register('login-history', LoginHistoryViewSet, basename='login-history')
router.register('devices', DeviceTrackingViewSet, basename='device')

urlpatterns = [
    path('register/', RegisterUserView.as_view(), name='register'),
    path('', include(router.urls)),
]
