from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.notifications.models import Notification
from apps.notifications.serializers import NotificationSerializer
from apps.permissions.permissions import HasTenantPermission


class NotificationViewSet(viewsets.ModelViewSet):
    """
    CRUD for Notifications alerts.
    Enforces active tenant isolation and 'notification.*' RBAC permissions.
    """
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [HasTenantPermission]
    permission_code_prefix = 'notification'

    @action(detail=True, methods=['post'], url_path='mark-read')
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save(update_fields=['is_read'])
        return Response(
            {'status': 'success', 'message': 'Notification marked as read.'},
            status=status.HTTP_200_OK
        )
