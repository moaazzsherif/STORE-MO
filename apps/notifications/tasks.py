from celery import shared_task
from django.utils import timezone
from apps.inventory.models import Stock
from apps.notifications.models import Notification
from apps.core.tenant_context import TenantContext


@shared_task
def check_low_stock_levels():
    """
    Background worker task that checks for low stock counts across all tenants.
    Creates notification alerts when quantity falls below 10 units.
    Runs globally by bypassing the tenant manager filter.
    """
    # Query all stocks across all tenants using unfiltered()
    low_stocks = Stock.objects.unfiltered().select_related('product_variant', 'warehouse', 'tenant').filter(
        quantity__lt=10,
        is_deleted=False
    )
    
    notifications_created = 0

    for stock in low_stocks:
        # Check if a low stock notification was already created today to avoid spamming
        today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
        exists = Notification.objects.unfiltered().filter(
            tenant_id=stock.tenant_id,
            notification_type='low_stock',
            params__stock_id=str(stock.id),
            created_at__gte=today_start
        ).exists()

        if not exists:
            Notification.objects.unfiltered().create(
                tenant_id=stock.tenant_id,
                title_key='notification.low_stock.title',
                body_key='notification.low_stock.body',
                notification_type='low_stock',
                params={
                    'stock_id': str(stock.id),
                    'sku': stock.product_variant.sku,
                    'warehouse': stock.warehouse.name,
                    'quantity': stock.quantity
                }
            )
            notifications_created += 1

    return f"Processed stock check. Created {notifications_created} notifications."
