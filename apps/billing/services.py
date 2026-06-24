from decimal import Decimal
from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone
from datetime import timedelta
from apps.core.services import BaseService
from apps.core.tenant_context import TenantContext
from apps.core.exceptions import TenantAccessError, TenantMissingError
from apps.billing.models import Invoice
from apps.tenants.models import TenantSubscription


class BillingService(BaseService):
    @classmethod
    def create_invoice(cls, subscription, amount, due_date=None):
        """
        Creates an unpaid invoice for a subscription inside an atomic transaction.
        Enforces tenant context boundaries.
        """
        current_tenant_id = TenantContext.get_current_tenant_id()
        if not current_tenant_id:
            raise TenantMissingError("Tenant isolation violation: No active tenant context resolved.")

        if str(subscription.tenant_id) != str(current_tenant_id):
            raise TenantAccessError("Tenant isolation violation: Subscription does not belong to the active tenant.")

        if not due_date:
            due_date = timezone.now().date() + timedelta(days=7)

        amount = Decimal(str(amount))
        if amount < Decimal('0.0'):
            raise ValidationError("Invoice amount cannot be negative.")

        with transaction.atomic():
            invoice = Invoice.objects.create(
                tenant_id=current_tenant_id,
                subscription=subscription,
                amount=amount,
                status='unpaid',
                due_date=due_date
            )
            
            cls.log_audit(
                action='CREATE_INVOICE',
                entity='Invoice',
                entity_id=invoice.id,
                new_value={'amount': float(amount), 'due_date': str(due_date)},
                module_name='billing'
            )
            return invoice

    @classmethod
    def process_payment(cls, invoice):
        """
        Processes payment for an invoice and updates the associated subscription status/dates.
        Runs inside an atomic transaction with select_for_update row locking.
        """
        current_tenant_id = TenantContext.get_current_tenant_id()
        if not current_tenant_id:
            raise TenantMissingError("Tenant isolation violation: No active tenant context resolved.")

        if str(invoice.tenant_id) != str(current_tenant_id):
            raise TenantAccessError("Tenant isolation violation: Invoice does not belong to the active tenant.")

        if invoice.status == 'paid':
            raise ValidationError("This invoice has already been paid.")

        with transaction.atomic():
            # Row lock both invoice and subscription to prevent concurrency issues
            invoice = Invoice.objects.select_for_update().get(id=invoice.id)
            subscription = TenantSubscription.objects.select_for_update().get(id=invoice.subscription.id)

            old_invoice_status = invoice.status
            old_sub_status = subscription.status

            # Update invoice
            invoice.status = 'paid'
            invoice.paid_at = timezone.now()
            invoice.save(update_fields=['status', 'paid_at'])

            # Update subscription status and extend dates
            subscription.status = 'active'
            today = timezone.now().date()
            subscription.start_date = today
            
            cycle = subscription.plan.billing_cycle
            if cycle == 'monthly':
                subscription.end_date = today + timedelta(days=30)
            elif cycle == 'yearly':
                subscription.end_date = today + timedelta(days=365)
            else:
                subscription.end_date = today + timedelta(days=30)

            subscription.save(update_fields=['status', 'start_date', 'end_date'])

            # Audit Invoice payment
            cls.log_audit(
                action='PROCESS_PAYMENT',
                entity='Invoice',
                entity_id=invoice.id,
                old_value={'status': old_invoice_status},
                new_value={'status': invoice.status, 'paid_at': str(invoice.paid_at)},
                module_name='billing'
            )

            # Audit Subscription update
            cls.log_audit(
                action='UPDATE_SUBSCRIPTION',
                entity='TenantSubscription',
                entity_id=subscription.id,
                old_value={'status': old_sub_status},
                new_value={
                    'status': subscription.status,
                    'start_date': str(subscription.start_date),
                    'end_date': str(subscription.end_date)
                },
                module_name='billing'
            )

            return invoice
