import logging
from apps.core.tenant_context import TenantContext
from apps.core.middleware import get_audit_meta


class RequestIDFilter(logging.Filter):
    """
    Logging Filter to inject request_id, tenant_id, and user_id into log records.
    Allows structured formatted logging.
    """
    def filter(self, record):
        meta = get_audit_meta()
        record.request_id = meta.get('request_id') or '-'
        record.tenant_id = TenantContext.get_current_tenant_id() or '-'
        
        user = TenantContext.get_current_user()
        record.user_id = user.id if user else '-'
        
        return True
