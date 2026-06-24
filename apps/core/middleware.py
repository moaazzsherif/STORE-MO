import uuid
import threading
from django.utils import translation
from django.utils.deprecation import MiddlewareMixin
from django.conf import settings
from apps.core.tenant_context import TenantContext
from apps.core.exceptions import TenantAccessError

# Thread-local storage to hold audit-relevant request details
_audit_context = threading.local()


def get_audit_meta():
    """Retrieve the current thread's HTTP request metadata for audit logging."""
    return {
        'request_id': getattr(_audit_context, 'request_id', None),
        'ip_address': getattr(_audit_context, 'ip_address', None),
        'session_key': getattr(_audit_context, 'session_key', None),
    }


class TenantResolutionMiddleware(MiddlewareMixin):
    def __call__(self, request):
        TenantContext.clear()
        
        # 1. Extract Tenant ID from Custom Header
        tenant_id_header = request.META.get('HTTP_X_TENANT_ID')
        from apps.tenants.models import Tenant
        
        tenant = None
        if tenant_id_header:
            try:
                # Query unfiltered to bypass the default tenant filter
                tenant = Tenant.objects.unfiltered().get(id=tenant_id_header, is_active=True)
            except (Tenant.DoesNotExist, ValueError):
                pass
                
        # 2. Fallback to Subdomain resolution
        if not tenant:
            host_parts = request.get_host().split('.')
            # e.g. tenant1.store-mo.com
            if len(host_parts) > 2 and host_parts[0] != 'www':
                subdomain = host_parts[0]
                try:
                    tenant = Tenant.objects.unfiltered().get(subdomain=subdomain, is_active=True)
                except Tenant.DoesNotExist:
                    pass

        # 3. Bind resolved tenant context
        if tenant:
            TenantContext.set_current_tenant_id(tenant.id)
            request.tenant = tenant
        else:
            request.tenant = None

        # 4. Bind User context & Enforce Tenant Boundaries
        if request.user and request.user.is_authenticated:
            TenantContext.set_current_user(request.user)
            
            # Guardrail: Check cross-tenant boundaries for non-superusers
            if not request.user.is_superuser and request.tenant:
                # Ensure user's associated tenant matches the active context tenant
                user_tenant_id = getattr(request.user, 'tenant_id', None)
                if user_tenant_id and str(user_tenant_id) != str(request.tenant.id):
                    TenantContext.clear()
                    raise TenantAccessError("Security Alert: User does not belong to this tenant.")

        try:
            response = self.get_response(request)
            return response
        finally:
            # Securely clear contexts after request finishes
            TenantContext.clear()


class LocaleMiddleware(MiddlewareMixin):
    def process_request(self, request):
        lang = None
        
        # 1. User Preferred Language Override
        if request.user and request.user.is_authenticated:
            lang = getattr(request.user, 'preferred_language', None)

        # 2. Accept-Language HTTP Header
        if not lang:
            accept_lang = request.META.get('HTTP_ACCEPT_LANGUAGE', '')
            for part in accept_lang.split(','):
                locale = part.split(';')[0].strip().lower()
                if locale in ['ar', 'en']:
                    lang = locale
                    break

        # 3. Tenant Default Language Fallback
        if not lang and request.tenant:
            lang = getattr(request.tenant, 'default_language', None)

        # 4. Global Fallback
        if not lang or lang not in ['ar', 'en']:
            lang = settings.LANGUAGE_CODE

        translation.activate(lang)
        request.LANGUAGE_CODE = lang


class AuditLogMiddleware(MiddlewareMixin):
    def __call__(self, request):
        # Resolve Requesting Client IP
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR', '0.0.0.0')

        # Store metadata in thread-local storage
        setattr(_audit_context, 'request_id', uuid.uuid4())
        setattr(_audit_context, 'ip_address', ip)
        
        # Check for active session ID (if available)
        session_key = getattr(request, 'session', None)
        session_id = session_key.session_key if session_key else None
        setattr(_audit_context, 'session_key', session_id)

        try:
            response = self.get_response(request)
            return response
        finally:
            # Clean up thread context variables
            if hasattr(_audit_context, 'request_id'):
                delattr(_audit_context, 'request_id')
            if hasattr(_audit_context, 'ip_address'):
                delattr(_audit_context, 'ip_address')
            if hasattr(_audit_context, 'session_key'):
                delattr(_audit_context, 'session_key')
