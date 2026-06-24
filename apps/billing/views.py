from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from apps.billing.models import Invoice
from apps.billing.serializers import InvoiceSerializer
from apps.billing.services import BillingService
from apps.permissions.permissions import HasTenantPermission


class InvoiceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only history tracking for Tenant Invoices.
    Enforces active tenant isolation and 'billing.view' RBAC permissions.
    Payments are triggered via the /pay/ action.
    """
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [HasTenantPermission]
    permission_code_prefix = 'billing'

    @action(detail=True, methods=['post'], url_path='pay')
    def pay(self, request, pk=None):
        invoice = self.get_object()
        try:
            paid_invoice = BillingService.process_payment(invoice)
        except Exception as e:
            raise ValidationError(str(e))
        return Response(InvoiceSerializer(paid_invoice).data, status=status.HTTP_200_OK)

