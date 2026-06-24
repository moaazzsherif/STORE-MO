import threading

_thread_local = threading.local()


class TenantContext:
    @staticmethod
    def set_current_tenant_id(tenant_id):
        """Bind the active tenant UUID to the current thread."""
        setattr(_thread_local, 'tenant_id', tenant_id)

    @staticmethod
    def get_current_tenant_id():
        """Retrieve the active tenant UUID from the current thread."""
        return getattr(_thread_local, 'tenant_id', None)

    @staticmethod
    def clear_current_tenant_id():
        """Remove the tenant UUID from the current thread context."""
        if hasattr(_thread_local, 'tenant_id'):
            delattr(_thread_local, 'tenant_id')

    @staticmethod
    def set_current_user(user):
        """Bind the active User model instance to the current thread."""
        setattr(_thread_local, 'user', user)

    @staticmethod
    def get_current_user():
        """Retrieve the active User model instance from the current thread."""
        return getattr(_thread_local, 'user', None)

    @staticmethod
    def clear_current_user():
        """Remove the User instance from the current thread context."""
        if hasattr(_thread_local, 'user'):
            delattr(_thread_local, 'user')

    @classmethod
    def clear(cls):
        """Clear all active contexts for the thread."""
        cls.clear_current_tenant_id()
        cls.clear_current_user()
