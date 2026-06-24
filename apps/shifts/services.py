import decimal
from decimal import Decimal
from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone
from apps.core.services import BaseService
from apps.core.tenant_context import TenantContext
from apps.core.exceptions import TenantAccessError, TenantMissingError
from apps.shifts.models import Shift


class ShiftService(BaseService):
    @classmethod
    def start_shift(cls, branch, cashier, opening_cash):
        """
        Starts a new cashier shift session.
        Validates that no active open shift exists for the cashier.
        """
        current_tenant_id = TenantContext.get_current_tenant_id()
        if not current_tenant_id:
            raise TenantMissingError("Tenant context error: Active tenant required to start a shift.")

        if str(branch.tenant_id) != str(current_tenant_id):
            raise TenantAccessError("Tenant isolation violation: Branch does not belong to the active tenant.")
        if cashier.tenant_id and str(cashier.tenant_id) != str(current_tenant_id):
            raise TenantAccessError("Tenant isolation violation: Cashier does not belong to the active tenant.")

        # Convert to Decimal to enforce precision
        opening_cash = Decimal(str(opening_cash))
        if opening_cash < Decimal('0.0'):
            raise ValidationError("Opening cash cannot be negative.")

        # Ensure no duplicate open shift exists for the cashier
        has_open = Shift.objects.filter(cashier=cashier, status='open').exists()
        if has_open:
            raise ValidationError("Open Shift Detected: Cashier already has an active open shift.")

        with transaction.atomic():
            shift = Shift.objects.create(
                tenant_id=current_tenant_id,
                branch=branch,
                cashier=cashier,
                opening_cash=opening_cash,
                expected_cash=opening_cash,  # expected cash starts at opening cash
                status='open'
            )

            # Audit shift start
            cls.log_audit(
                action='START_SHIFT',
                entity='Shift',
                entity_id=shift.id,
                new_value={'opening_cash': float(opening_cash)},
                module_name='shifts'
            )
            return shift

    @classmethod
    def close_shift(cls, shift, actual_cash):
        """
        Closes the active cashier shift session.
        Calculates expected vs actual cash difference.
        """
        current_tenant_id = TenantContext.get_current_tenant_id()
        if not current_tenant_id:
            raise TenantMissingError("Tenant context error: Active tenant required to close a shift.")

        if str(shift.tenant_id) != str(current_tenant_id):
            raise TenantAccessError("Tenant isolation violation: Shift does not belong to the active tenant.")

        if shift.status != 'open':
            raise ValidationError("Validation Error: This shift session is already closed.")

        actual_cash = Decimal(str(actual_cash))
        if actual_cash < Decimal('0.0'):
            raise ValidationError("Actual cash cannot be negative.")

        with transaction.atomic():
            old_status = shift.status
            shift.status = 'closed'
            shift.end_time = timezone.now()
            shift.actual_cash = actual_cash
            shift.closing_cash = actual_cash  # closing_cash is defined as actual cash counted

            # Calculate difference = actual_cash - expected_cash
            expected = Decimal(str(shift.expected_cash))
            difference = actual_cash - expected

            shift.save(update_fields=['status', 'end_time', 'actual_cash', 'closing_cash'])

            # Audit shift closure
            cls.log_audit(
                action='CLOSE_SHIFT',
                entity='Shift',
                entity_id=shift.id,
                old_value={'status': old_status},
                new_value={
                    'status': shift.status,
                    'expected_cash': float(expected),
                    'actual_cash': float(actual_cash),
                    'difference': float(difference)
                },
                module_name='shifts'
            )
            return shift, difference

