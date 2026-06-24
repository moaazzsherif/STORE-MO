from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from apps.tenants.models import Tenant, SubscriptionPlan, TenantSubscription
from apps.tenants.serializers import (
    TenantSerializer,
    SubscriptionPlanSerializer,
    TenantSubscriptionSerializer
)
from apps.permissions.permissions import HasTenantPermission


class TenantViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Tenant registration and management.
    - POST (create) is AllowAny for registration
    - GET (retrieve/list) filters by user's tenant boundary unless superuser
    - DELETE is restricted to superuser only
    """
    serializer_class = TenantSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        if not self.request.user or not self.request.user.is_authenticated:
            return Tenant.objects.none()
        if self.request.user.is_superuser:
            return Tenant.objects.unfiltered()
        if self.request.user.tenant:
            return Tenant.objects.unfiltered().filter(id=self.request.user.tenant.id)
        return Tenant.objects.none()

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_superuser:
            return Response(
                {"detail": "Tenant deletion is restricted to global super-administrators."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)


class SubscriptionPlanViewSet(viewsets.ReadOnlyModelViewSet):
    """Global subscription plans viewable by anyone."""
    queryset = SubscriptionPlan.objects.unfiltered()
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [AllowAny]


class TenantSubscriptionViewSet(viewsets.ModelViewSet):
    """
    Tenant-specific subscriptions.
    Enforces active tenant isolation and 'billing.*' RBAC permissions.
    """
    queryset = TenantSubscription.objects.all()
    serializer_class = TenantSubscriptionSerializer
    permission_classes = [HasTenantPermission]
    permission_code_prefix = 'billing'

