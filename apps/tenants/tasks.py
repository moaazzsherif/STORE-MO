from celery import shared_task
from django.utils import timezone
from apps.tenants.models import Tenant, TenantSubscription
from apps.notifications.models import Notification


@shared_task
def check_expired_subscriptions():
    """
    Background worker task running daily to check for expired SaaS subscriptions.
    If a subscription has ended, it marks it as expired and deactivates the tenant.
    """
    today = timezone.now().date()
    
    # Query all active subscriptions that have expired
    expired_subs = TenantSubscription.objects.unfiltered().select_related('tenant').filter(
        status__in=['active', 'trialing'],
        end_date__lt=today,
        is_deleted=False
    )
    
    expired_count = 0
    
    for sub in expired_subs:
        sub.status = 'expired'
        sub.save(update_fields=['status'])
        
        # Deactivate the tenant brand access
        tenant = sub.tenant
        tenant.is_active = False
        tenant.save(update_fields=['is_active'])
        
        # Register a notification alert
        Notification.objects.unfiltered().create(
            tenant_id=tenant.id,
            title_key='notification.subscription_expired.title',
            body_key='notification.subscription_expired.body',
            notification_type='subscription',
            params={
                'plan_name': sub.plan.name,
                'end_date': str(sub.end_date)
            }
        )
        expired_count += 1
        
    return f"SaaS Subscription Check complete. Expired and deactivated {expired_count} tenants."
