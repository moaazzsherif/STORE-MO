from django.db import models
from apps.core.tenant_context import TenantContext
from apps.core.exceptions import TenantMissingError


class TenantQuerySet(models.QuerySet):
    def for_tenant(self, tenant_id=None):
        """
        Filters the queryset by the active tenant ID from context or parameter.
        Throws TenantMissingError if no tenant context is resolved.
        """
        tid = tenant_id or TenantContext.get_current_tenant_id()
        if not tid:
            raise TenantMissingError(
                "Tenant isolation filter triggered: No active tenant ID resolved in the context."
            )
        return self.filter(tenant_id=tid)

    def active(self):
        """Filters out soft-deleted records."""
        return self.filter(is_deleted=False)


class TenantManager(models.Manager):
    def get_queryset(self):
        """
        Returns a tenant-isolated queryset.
        If a tenant ID is active in context, it automatically filters by it.
        If no context is resolved, it returns an empty queryset to prevent data leakage.
        """
        qs = TenantQuerySet(self.model, using=self._db).active()
        tid = TenantContext.get_current_tenant_id()
        if tid:
            return qs.filter(tenant_id=tid)
        return qs.none()

    def for_tenant(self, tenant_id=None):
        """
        Explicit filter boundary check.
        Usage: Model.objects.for_tenant()
        """
        tid = tenant_id or TenantContext.get_current_tenant_id()
        if not tid:
            raise TenantMissingError(
                "Tenant isolation filter triggered: No active tenant ID resolved in the context."
            )
        # We query unfiltered first, then apply the specific tenant to bypass the default get_queryset empty behavior
        return TenantQuerySet(self.model, using=self._db).active().filter(tenant_id=tid)

    def unfiltered(self):
        """
        Bypasses the automatic tenant filter (e.g. for super-admin analytics or migrations).
        """
        return TenantQuerySet(self.model, using=self._db)
