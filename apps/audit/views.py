from rest_framework import viewsets
from apps.audit.models import AuditLog
from apps.audit.serializers import AuditLogSerializer
from apps.permissions.permissions import HasTenantPermission


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only view of historical Audit Logs.
    Enforces active tenant isolation and 'audit.*' RBAC permissions.
    """
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [HasTenantPermission]
    permission_code_prefix = 'audit'
