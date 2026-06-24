from rest_framework.exceptions import APIException, PermissionDenied, ValidationError

class TenantError(APIException):
    """Base exception for tenant-related issues."""
    status_code = 400
    default_detail = 'A tenant context error occurred.'
    default_code = 'tenant_error'


class TenantMissingError(ValidationError, TenantError):
    """Raised when an operation requires an active tenant, but none is set in context."""
    default_detail = 'Tenant isolation filter triggered: No active tenant ID resolved in the context.'
    default_code = 'tenant_missing'


class TenantAccessError(PermissionDenied, TenantError):
    """Raised when there is a violation of tenant boundaries."""
    default_detail = 'Security Alert: Access denied due to tenant boundary violation.'
    default_code = 'tenant_access_denied'



def custom_exception_handler(exc, context):
    """
    Structured API Exception Handler.
    - Captures all errors
    - Logs unhandled exceptions (along with tracebacks) to django.request with active metadata
    - Returns standardized JSON format, suppressing internal tracebacks from clients
    """
    import logging
    import traceback
    from rest_framework.views import exception_handler
    from rest_framework.response import Response
    from rest_framework import status
    from apps.core.tenant_context import TenantContext
    from apps.core.middleware import get_audit_meta

    logger = logging.getLogger('django.request')

    # Call REST framework's default exception handler to get the standard error response
    response = exception_handler(exc, context)

    meta = get_audit_meta()
    req_id = meta.get('request_id')
    tenant_id = TenantContext.get_current_tenant_id()
    user = TenantContext.get_current_user()
    user_id = user.id if user else None

    # Retrieve request detail
    request = context.get('request')
    path = request.path if request else 'Unknown Path'
    method = request.method if request else 'Unknown Method'

    # If it is not a standard DRF exception, log traceback as ERROR
    if response is None:
        tb = traceback.format_exc()
        logger.error(
            f"[UNHANDLED EXCEPTION] Path: {method} {path} | Tenant: {tenant_id} | "
            f"User: {user_id} | ReqID: {req_id} | Error: {str(exc)}\nTraceback:\n{tb}"
        )
        response = Response(
            {
                'detail': 'An internal server error occurred.',
                'request_id': str(req_id) if req_id else None
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    else:
        # Log validation / permission issues as WARNING
        logger.warning(
            f"[API ERROR] {method} {path} | Status: {response.status_code} | "
            f"Tenant: {tenant_id} | User: {user_id} | ReqID: {req_id} | Detail: {response.data}"
        )
        if isinstance(response.data, dict):
            response.data['request_id'] = str(req_id) if req_id else None
        elif isinstance(response.data, list):
            # If standard DRF list error, restructure
            response.data = {
                'detail': response.data,
                'request_id': str(req_id) if req_id else None
            }

    return response

