from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.tenants.views import (
    TenantViewSet,
    SubscriptionPlanViewSet,
    TenantSubscriptionViewSet
)

router = DefaultRouter()
router.register('businesses', TenantViewSet, basename='business')
router.register('plans', SubscriptionPlanViewSet, basename='plan')
router.register('subscriptions', TenantSubscriptionViewSet, basename='subscription')

urlpatterns = [
    path('', include(router.urls)),
]
