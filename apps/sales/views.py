from rest_framework import status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from apps.branches.models import Branch
from apps.shifts.models import Shift
from apps.customers.models import Customer
from apps.products.models import ProductVariant
from apps.sales.models import Sale
from apps.sales.serializers import SaleSerializer, CreateSaleSerializer
from apps.sales.services import SaleService
from apps.permissions.permissions import HasTenantPermission


class CreateSaleAPIView(APIView):
    """
    POST /api/v1/sales/create
    Creates a new POS sale checkout, deducting stock levels and updating cashier shifts.
    """
    permission_classes = [HasTenantPermission]
    permission_code_prefix = 'sale'

    def post(self, request):
        serializer = CreateSaleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # Resolve models within active tenant context
        branch = get_object_or_404(Branch, id=data['branch_id'])
        shift = get_object_or_404(Shift, id=data['shift_id'])
        
        customer = None
        if data.get('customer_id'):
            customer = get_object_or_404(Customer, id=data['customer_id'])

        # Resolve product variants and build service payload list
        items_payload = []
        for item in data['items']:
            variant = get_object_or_404(ProductVariant, id=item['product_variant_id'])
            items_payload.append({
                'product_variant': variant,
                'quantity': item['quantity'],
                'unit_price': item['unit_price'],
                'discount_amount': item['discount_amount']
            })

        # Process checkout via service layer
        try:
            sale = SaleService.create_sale(
                branch=branch,
                shift=shift,
                cashier=request.user,  # Cashier is mapped as custom User
                items_data=items_payload,
                payment_method=data['payment_method'],
                customer=customer,
                tax_amount=data['tax_amount']
            )
        except Exception as e:
            raise ValidationError(str(e))

        return Response(SaleSerializer(sale).data, status=status.HTTP_201_CREATED)


class SaleViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only tracking endpoint for Sales records.
    """
    queryset = Sale.objects.all()
    serializer_class = SaleSerializer
    permission_classes = [HasTenantPermission]
    permission_code_prefix = 'sale'

