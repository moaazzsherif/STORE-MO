import uuid
from django.db import models
from apps.core.tenant_context import TenantContext


class AuditLogQuerySet(models.QuerySet):
    def for_tenant(self, tenant_id=None):
        tid = tenant_id or TenantContext.get_current_tenant_id()
        if not tid:
            return self.none()
        return self.filter(tenant_id=tid)


class AuditLogManager(models.Manager):
    def get_queryset(self):
        """
        Enforce tenant isolation on audit log reads.
        Automatically logs out other tenant views unless bypassed via .unfiltered()
        """
        qs = AuditLogQuerySet(self.model, using=self._db)
        tid = TenantContext.get_current_tenant_id()
        if tid:
            return qs.filter(tenant_id=tid)
        return qs.none()

    def unfiltered(self):
        return AuditLogQuerySet(self.model, using=self._db)


class AuditLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # Nullable for global super-admin actions
    tenant_id = models.UUIDField(null=True, blank=True, db_index=True)
    user_id = models.UUIDField(null=True, blank=True, db_index=True)
    action = models.CharField(max_length=50)  # CREATE, UPDATE, DELETE
    entity = models.CharField(max_length=100, db_index=True)  # e.g., Product, Sale
    entity_id = models.UUIDField(db_index=True)
    old_value = models.TextField(null=True, blank=True)  # JSON string
    new_value = models.TextField(null=True, blank=True)  # JSON string
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    request_id = models.UUIDField(null=True, blank=True, db_index=True)
    session_id = models.CharField(max_length=255, null=True, blank=True)
    module_name = models.CharField(max_length=100, db_index=True)

    objects = AuditLogManager()

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.action} on {self.entity} ({self.entity_id}) at {self.timestamp}"
