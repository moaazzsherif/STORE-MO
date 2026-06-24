from rest_framework import viewsets, generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import get_user_model
from apps.accounts.models import LoginHistory, DeviceTracking
from apps.accounts.serializers import (
    UserSerializer,
    RegisterUserSerializer,
    LoginHistorySerializer,
    DeviceTrackingSerializer
)

User = get_user_model()


class RegisterUserView(generics.CreateAPIView):
    """Allows creating user credentials linked to a tenant."""
    queryset = User.objects.unfiltered()
    serializer_class = RegisterUserSerializer
    permission_classes = [AllowAny]


class UserViewSet(viewsets.ModelViewSet):
    """
    CRUD for User profiles under the tenant.
    Enforces active tenant query isolation automatically.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]


class LoginHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    """Tenant-isolated user login logs."""
    queryset = LoginHistory.objects.all()
    serializer_class = LoginHistorySerializer
    permission_classes = [IsAuthenticated]


class DeviceTrackingViewSet(viewsets.ReadOnlyModelViewSet):
    """Tenant-isolated device login records."""
    queryset = DeviceTracking.objects.all()
    serializer_class = DeviceTrackingSerializer
    permission_classes = [IsAuthenticated]
