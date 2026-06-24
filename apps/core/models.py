import uuid
from django.db import models
from apps.core.tenant_manager import TenantManager


class BaseTenantModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(
        'tenants.Tenant',
        on_delete=models.CASCADE,
        related_name='%(app_label)s_%(class)s_set',
        db_index=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False, db_index=True)

    objects = TenantManager()

    class Meta:
        abstract = True
        constraints = [
            models.UniqueConstraint(
                fields=['tenant', 'id'],
                name='%(app_label)s_%(class)s_tenant_id_unique'
            )
        ]

    def save(self, *args, **kwargs):
        """
        Enforce tenant isolation on writes.
        Automatically sets tenant_id from thread-local context if not provided.
        Throws TenantMissingError if no tenant can be resolved.
        """
        from apps.core.tenant_context import TenantContext
        from apps.core.exceptions import TenantMissingError

        if not getattr(self, 'tenant_id', None):
            tid = TenantContext.get_current_tenant_id()
            if tid:
                self.tenant_id = tid
            else:
                raise TenantMissingError(
                    f"Tenant isolation integrity violation: Attempted to save a tenant-scoped model "
                    f"({self.__class__.__name__}) without an active tenant context."
                )
        
        # Automatically update updated_at if update_fields is passed
        # and doesn't contain 'updated_at' but contains other fields
        if 'update_fields' in kwargs and kwargs['update_fields'] and 'updated_at' not in kwargs['update_fields']:
            kwargs['update_fields'] = list(kwargs['update_fields']) + ['updated_at']

        super().save(*args, **kwargs)

    def delete(self, using=None, keep_parents=False, force=False):
        """
        Soft delete by default.
        Pass force=True to permanently delete from the database.
        """
        if force:
            return super().delete(using=using, keep_parents=keep_parents)
        self.is_deleted = True
        self.save(update_fields=['is_deleted'])

    def restore(self):
        """Restores a soft-deleted record."""
        self.is_deleted = False
        self.save(update_fields=['is_deleted'])

