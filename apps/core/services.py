import json
from django.db import transaction
from apps.core.tenant_context import TenantContext
from apps.core.middleware import get_audit_meta


class BaseService:
    @staticmethod
    def log_audit(
        action,
        entity,
        entity_id,
        old_value=None,
        new_value=None,
        tenant_id=None,
        user_id=None,
        module_name=None
    ):
        """
        Creates an AuditLog record for any write operation.
        Pulls IP, request_id, and session_id from the active middleware thread context.
        """
        from apps.audit.models import AuditLog

        meta = get_audit_meta()
        tid = tenant_id or TenantContext.get_current_tenant_id()
        
        # Resolve active user ID
        uid = user_id
        if not uid:
            user = TenantContext.get_current_user()
            if user:
                uid = user.id

        # Convert dict outputs to JSON strings
        old_val_json = None
        new_val_json = None
        if old_value is not None:
            old_val_json = json.dumps(old_value) if isinstance(old_value, (dict, list)) else str(old_value)
        if new_value is not None:
            new_val_json = json.dumps(new_value) if isinstance(new_value, (dict, list)) else str(new_value)

        # Write to audit database unfiltered (to bypass tenant scope check on write)
        AuditLog.objects.unfiltered().create(
            tenant_id=tid,
            user_id=uid,
            action=action,
            entity=entity,
            entity_id=entity_id,
            old_value=old_val_json,
            new_value=new_val_json,
            ip_address=meta.get('ip_address') or '0.0.0.0',
            request_id=meta.get('request_id'),
            session_id=meta.get('session_key'),
            module_name=module_name or entity.lower()
        )

    @staticmethod
    def atomic():
        """Helper decorator/context manager wrapper for atomic transactions."""
        return transaction.atomic()
