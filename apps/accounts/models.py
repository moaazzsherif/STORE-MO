import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from apps.core.models import BaseTenantModel
from apps.core.tenant_context import TenantContext


class TenantUserManager(BaseUserManager):
    def get_queryset(self):
        """
        Enforce tenant-isolated query results.
        If a tenant ID is set in the thread-local context, we only return users belonging to it.
        Allows superusers to view all records.
        """
        qs = super().get_queryset().filter(is_deleted=False)
        tid = TenantContext.get_current_tenant_id()
        if tid:
            return qs.filter(tenant_id=tid)
        return qs

    def for_tenant(self, tenant_id=None):
        tid = tenant_id or TenantContext.get_current_tenant_id()
        return super().get_queryset().filter(tenant_id=tid, is_deleted=False)

    def unfiltered(self):
        """Bypass tenant context checks (e.g. for user authentication login)."""
        return super().get_queryset()

    def create_user(self, email, password=None, tenant=None, **extra_fields):
        if not email:
            raise ValueError('The Email field is required.')
        email = self.normalize_email(email)
        user = self.model(email=email, tenant=tenant, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, tenant=None, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # Nullable tenant references for global superusers
    tenant = models.ForeignKey(
        'tenants.Tenant',
        on_delete=models.CASCADE,
        related_name='users',
        null=True,
        blank=True
    )
    email = models.EmailField(unique=True, db_index=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    preferred_language = models.CharField(
        max_length=5,
        choices=[('en', 'English'), ('ar', 'Arabic')],
        default='en'
    )
    is_active = models.BooleanField(default=True, db_index=True)
    is_staff = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = TenantUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return f"{self.email} ({self.tenant.name if self.tenant else 'Global'})"

    def delete(self, using=None, keep_parents=False, force=False):
        if force:
            return super().delete(using=using, keep_parents=keep_parents)
        self.is_deleted = True
        self.save(update_fields=['is_deleted'])


class LoginHistory(BaseTenantModel):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='login_histories'
    )
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} logged in from {self.ip_address} at {self.timestamp}"


class DeviceTracking(BaseTenantModel):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='devices'
    )
    device_token = models.CharField(max_length=255)
    device_name = models.CharField(max_length=255, null=True, blank=True)
    last_login = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} - {self.device_name}"
