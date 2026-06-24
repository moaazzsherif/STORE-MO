from django.test import TestCase
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta

from apps.tenants.models import Tenant
from apps.accounts.models import User
from apps.permissions.models import Role, Permission, RolePermission, UserRole
from apps.stores.models import Store
from apps.branches.models import Branch
from apps.employees.models import Employee
from apps.shifts.models import Shift
from apps.shifts.services import ShiftService
from apps.products.models import Product, ProductVariant
from apps.inventory.models import Warehouse, Stock, InventoryMovement
from apps.inventory.services import InventoryService
from apps.sales.services import SaleService
from apps.sales.models import Sale, SaleItem
from apps.audit.models import AuditLog
from apps.core.tenant_context import TenantContext


class StoreMoTestCase(TestCase):
    def setUp(self):
        # Clear contexts
        TenantContext.clear()

        # 1. Create two Tenants for isolation testing
        self.tenant_a = Tenant.objects.create(name="Tenant A", subdomain="tenant-a")
        self.tenant_b = Tenant.objects.create(name="Tenant B", subdomain="tenant-b")

        # 2. Create Users (Cashiers)
        self.user_a = User.objects.create_user(
            email="user@tenant-a.com",
            password="password123",
            tenant=self.tenant_a
        )
        self.user_b = User.objects.create_user(
            email="user@tenant-b.com",
            password="password123",
            tenant=self.tenant_b
        )

        # 3. Set up Tenant A structures
        TenantContext.set_current_tenant_id(self.tenant_a.id)
        
        self.store_a = Store.objects.create(tenant=self.tenant_a, name="Store A", slug="store-a")
        self.branch_a = Branch.objects.create(tenant=self.tenant_a, store=self.store_a, name="Branch A")
        self.employee_a = Employee.objects.create(
            tenant=self.tenant_a,
            user=self.user_a,
            branch=self.branch_a,
            employee_code="EMP001",
            position="Cashier"
        )
        self.warehouse_a = Warehouse.objects.create(
            tenant=self.tenant_a,
            branch=self.branch_a,
            name="Warehouse A"
        )
        self.product_a = Product.objects.create(tenant=self.tenant_a, name="Product A", sku="SKU-A")
        self.variant_a = ProductVariant.objects.create(
            tenant=self.tenant_a,
            product=self.product_a,
            name="Default",
            sku="SKU-A-VAR",
            price=100.0,
            cost=60.0
        )

        # Set up Tenant B structures
        TenantContext.set_current_tenant_id(self.tenant_b.id)
        
        self.store_b = Store.objects.create(tenant=self.tenant_b, name="Store B", slug="store-b")
        self.branch_b = Branch.objects.create(tenant=self.tenant_b, store=self.store_b, name="Branch B")
        self.employee_b = Employee.objects.create(
            tenant=self.tenant_b,
            user=self.user_b,
            branch=self.branch_b,
            employee_code="EMP002",
            position="Manager"
        )
        self.warehouse_b = Warehouse.objects.create(
            tenant=self.tenant_b,
            branch=self.branch_b,
            name="Warehouse B"
        )
        self.product_b = Product.objects.create(tenant=self.tenant_b, name="Product B", sku="SKU-B")
        self.variant_b = ProductVariant.objects.create(
            tenant=self.tenant_b,
            product=self.product_b,
            name="Default",
            sku="SKU-B-VAR",
            price=200.0,
            cost=120.0
        )

        # Clear context
        TenantContext.clear()

    def test_tenant_isolation(self):
        """
        Ensure Tenant A query filters successfully isolate from Tenant B's data.
        """
        # Set context to Tenant A
        TenantContext.set_current_tenant_id(self.tenant_a.id)

        # 1. Query Stores - should only return Tenant A's store
        stores = Store.objects.all()
        self.assertEqual(stores.count(), 1)
        self.assertEqual(stores.first().name, "Store A")

        # 2. Try to query using unfiltered to assert they exist in the DB
        all_stores = Store.objects.unfiltered().all()
        self.assertEqual(all_stores.count(), 2)

        # Set context to Tenant B
        TenantContext.set_current_tenant_id(self.tenant_b.id)
        stores_b = Store.objects.all()
        self.assertEqual(stores_b.count(), 1)
        self.assertEqual(stores_b.first().name, "Store B")

    def test_stock_cache_write_protection(self):
        """
        Direct writes or updates to Stock.quantity must raise PermissionError.
        """
        TenantContext.set_current_tenant_id(self.tenant_a.id)

        # Direct creation should fail
        with self.assertRaises(PermissionError):
            Stock.objects.create(
                tenant=self.tenant_a,
                warehouse=self.warehouse_a,
                product_variant=self.variant_a,
                quantity=10
            )

        # Direct update should fail
        stock = Stock(
            tenant=self.tenant_a,
            warehouse=self.warehouse_a,
            product_variant=self.variant_a,
            quantity=10
        )
        with self.assertRaises(PermissionError):
            stock.save()

    def test_inventory_service_movement(self):
        """
        Verify stock movements register via InventoryService, lock rows, and save.
        """
        TenantContext.set_current_tenant_id(self.tenant_a.id)
        TenantContext.set_current_user(self.user_a)

        # Record a stock replenishment (purchase addition)
        movement = InventoryService.create_movement(
            warehouse=self.warehouse_a,
            product_variant=self.variant_a,
            movement_type='purchase',
            quantity=50,
            created_by=self.user_a
        )

        self.assertIsNotNone(movement.id)
        self.assertEqual(movement.quantity, 50)

        # Verify cached stock quantity was updated
        stock = Stock.objects.get(warehouse=self.warehouse_a, product_variant=self.variant_a)
        self.assertEqual(stock.quantity, 50)

    def test_cogs_and_sale_service(self):
        """
        Verify POS checkout processes sales inside atomic transaction,
        creates items, deducts inventory, and increments expected cash.
        """
        TenantContext.set_current_tenant_id(self.tenant_a.id)
        TenantContext.set_current_user(self.user_a)

        # Add initial stock
        InventoryService.create_movement(
            warehouse=self.warehouse_a,
            product_variant=self.variant_a,
            movement_type='purchase',
            quantity=10,
            created_by=self.user_a
        )

        # Start Shift
        shift = ShiftService.start_shift(
            branch=self.branch_a,
            cashier=self.user_a,
            opening_cash=500.0
        )

        # Create POS Sale: sell 2 items of product A
        items_data = [{
            'product_variant': self.variant_a,
            'quantity': 2,
            'unit_price': self.variant_a.price,
            'discount_amount': 10.0
        }]

        sale = SaleService.create_sale(
            branch=self.branch_a,
            shift=shift,
            cashier=self.user_a,
            items_data=items_data,
            payment_method='cash',
            tax_amount=15.0
        )

        self.assertIsNotNone(sale.id)
        # Expected total = (100 * 2) + 15 - 10 = 205
        self.assertEqual(sale.total_amount, 205.0)

        # Verify stock was decremented from 10 to 8
        stock = Stock.objects.get(warehouse=self.warehouse_a, product_variant=self.variant_a)
        self.assertEqual(stock.quantity, 8)

        # Verify shift expected cash tracks the cash sale: 500 + 205 = 705
        shift.refresh_from_db()
        self.assertEqual(shift.expected_cash, 705.0)

    def test_tenant_isolation_validation(self):
        """
        Verify that SaleService raises ValidationError if any cross-tenant entities are provided.
        """
        # Set context to Tenant A
        TenantContext.set_current_tenant_id(self.tenant_a.id)
        TenantContext.set_current_user(self.user_a)

        # Create active shift for Tenant A cashier
        shift = ShiftService.start_shift(
            branch=self.branch_a,
            cashier=self.user_a,
            opening_cash=100.0
        )

        items_data = [{
            'product_variant': self.variant_a,
            'quantity': 1,
            'unit_price': self.variant_a.price,
            'discount_amount': 0.0
        }]

        # Try to register a sale targeting Branch B (which belongs to Tenant B)
        from apps.core.exceptions import TenantAccessError
        with self.assertRaises(TenantAccessError):
            SaleService.create_sale(
                branch=self.branch_b,
                shift=shift,
                cashier=self.user_a,
                items_data=items_data,
                payment_method='cash'
            )

    def test_cashier_shift_validation(self):
        """
        Verify that cashier cannot sell without an active open shift,
        and cannot log sales to other cashier's shifts.
        """
        TenantContext.set_current_tenant_id(self.tenant_a.id)
        TenantContext.set_current_user(self.user_a)

        # 1. Try to sell with a closed shift
        closed_shift = Shift.objects.create(
            tenant_id=self.tenant_a.id,
            branch=self.branch_a,
            cashier=self.user_a,
            opening_cash=100.0,
            status='closed'
        )

        items_data = [{
            'product_variant': self.variant_a,
            'quantity': 1,
            'unit_price': self.variant_a.price,
            'discount_amount': 0.0
        }]

        with self.assertRaises(ValidationError):
            SaleService.create_sale(
                branch=self.branch_a,
                shift=closed_shift,
                cashier=self.user_a,
                items_data=items_data,
                payment_method='cash'
            )

        # 2. Try to sell using another user's shift
        # Set cashier context to user_a, but pass user_b's shift (temporary setup)
        shift_b = Shift.objects.create(
            tenant_id=self.tenant_a.id,
            branch=self.branch_a,
            cashier=self.user_b,  # User B is in Tenant B, but create this record to test cashier mismatch
            opening_cash=100.0,
            status='open'
        )

        with self.assertRaises(ValidationError):
            SaleService.create_sale(
                branch=self.branch_a,
                shift=shift_b,
                cashier=self.user_a,
                items_data=items_data,
                payment_method='cash'
            )

    def test_shift_close_difference_calculation(self):
        """
        Verify that closing a shift session calculates expected cash,
        actual cash difference, and sets the closed status.
        """
        TenantContext.set_current_tenant_id(self.tenant_a.id)
        TenantContext.set_current_user(self.user_a)

        # Start Shift: Opening Cash = 300.0
        shift = ShiftService.start_shift(
            branch=self.branch_a,
            cashier=self.user_a,
            opening_cash=300.0
        )

        # Register a cash sale of 150.0
        # Add stock first
        InventoryService.create_movement(
            warehouse=self.warehouse_a,
            product_variant=self.variant_a,
            movement_type='purchase',
            quantity=5,
            created_by=self.user_a
        )

        SaleService.create_sale(
            branch=self.branch_a,
            shift=shift,
            cashier=self.user_a,
            items_data=[{
                'product_variant': self.variant_a,
                'quantity': 1,
                'unit_price': 150.0,
                'discount_amount': 0.0
            }],
            payment_method='cash'
        )

        shift.refresh_from_db()
        self.assertEqual(shift.expected_cash, 450.0)

        # Close shift reporting actual counted cash as 440.0 (drawer is short by 10.0)
        closed_shift, difference = ShiftService.close_shift(
            shift=shift,
            actual_cash=440.0
        )

        self.assertEqual(closed_shift.status, 'closed')
        self.assertEqual(closed_shift.actual_cash, 440.0)
        self.assertEqual(difference, -10.0)

    def test_ecommerce_cart_conversion_to_order(self):
        """
        Verify that EcommerceService correctly converts Cart -> Order inside transaction,
        creates OrderItems, deducts stock via InventoryService, and clears cart.
        """
        from apps.ecommerce.models import Cart, CartItem, Order, OrderItem
        from apps.ecommerce.services import EcommerceService
        
        TenantContext.set_current_tenant_id(self.tenant_a.id)
        TenantContext.set_current_user(self.user_a)

        # 1. Add stock first
        InventoryService.create_movement(
            warehouse=self.warehouse_a,
            product_variant=self.variant_a,
            movement_type='purchase',
            quantity=10,
            created_by=self.user_a
        )

        # 2. Create Cart and CartItem
        cart = Cart.objects.create(
            tenant_id=self.tenant_a.id,
            session_id="session-123"
        )
        cart_item = CartItem.objects.create(
            tenant_id=self.tenant_a.id,
            cart=cart,
            product_variant=self.variant_a,
            quantity=3,
            price_snapshot=self.variant_a.price
        )

        # 3. Trigger order checkout
        order = EcommerceService.create_order(
            cart=cart,
            payment_method='cod',
            created_by_user=self.user_a
        )

        self.assertIsNotNone(order.id)
        self.assertEqual(order.status, 'pending')
        # Total = 100 * 3 = 300
        self.assertEqual(order.total, 300.0)

        # Verify stock was decremented from 10 to 7
        stock = Stock.objects.get(warehouse=self.warehouse_a, product_variant=self.variant_a)
        self.assertEqual(stock.quantity, 7)

        # Verify cart items were cleared
        self.assertEqual(cart.items.count(), 0)

        # Verify order items were created
        self.assertEqual(order.items.count(), 1)
        self.assertEqual(order.items.first().quantity, 3)

    def test_ecommerce_stock_validation(self):
        """
        Verify that order creation fails if stock levels are insufficient.
        """
        from apps.ecommerce.models import Cart, CartItem
        from apps.ecommerce.services import EcommerceService
        
        TenantContext.set_current_tenant_id(self.tenant_a.id)
        TenantContext.set_current_user(self.user_a)

        # 1. Add stock first
        InventoryService.create_movement(
            warehouse=self.warehouse_a,
            product_variant=self.variant_a,
            movement_type='purchase',
            quantity=2,
            created_by=self.user_a
        )

        # 2. Create Cart for 5 items (exceeds available 2)
        cart = Cart.objects.create(
            tenant_id=self.tenant_a.id,
            session_id="session-456"
        )
        CartItem.objects.create(
            tenant_id=self.tenant_a.id,
            cart=cart,
            product_variant=self.variant_a,
            quantity=5,
            price_snapshot=self.variant_a.price
        )

        # 3. Order creation should raise ValidationError
        with self.assertRaises(ValidationError):
            EcommerceService.create_order(
                cart=cart,
                payment_method='cod',
                created_by_user=self.user_a
            )

    def test_ecommerce_tenant_isolation(self):
        """
        Verify that EcommerceService raises ValidationError if cart tenant does not match context tenant.
        """
        from apps.ecommerce.models import Cart
        from apps.ecommerce.services import EcommerceService
        
        # Set context to Tenant A
        TenantContext.set_current_tenant_id(self.tenant_a.id)
        TenantContext.set_current_user(self.user_a)

        # Create Cart under Tenant B
        # Bypass managers by setting tenant_id manually on save
        cart_b = Cart.objects.unfiltered().create(
            tenant_id=self.tenant_b.id,
            session_id="session-tenant-b"
        )

        # Try to checkout Cart B in Tenant A context
        from apps.core.exceptions import TenantAccessError
        with self.assertRaises(TenantAccessError):
            EcommerceService.create_order(
                cart=cart_b,
                payment_method='cod',
                created_by_user=self.user_a
            )

    def test_ecommerce_product_variant_tenant_isolation(self):
        """
        Verify that EcommerceService raises ValidationError if a cart item's product variant
        belongs to a different tenant than the current tenant context.
        """
        from apps.ecommerce.models import Cart, CartItem
        from apps.ecommerce.services import EcommerceService

        # Set context to Tenant A
        TenantContext.set_current_tenant_id(self.tenant_a.id)
        TenantContext.set_current_user(self.user_a)

        # Create Cart under Tenant A
        cart_a = Cart.objects.create(
            tenant_id=self.tenant_a.id,
            session_id="session-tenant-a"
        )

        # Create CartItem pointing to Tenant B's variant (self.variant_b)
        cart_item = CartItem.objects.unfiltered().create(
            tenant_id=self.tenant_a.id,
            cart=cart_a,
            product_variant=self.variant_b,  # Tenant B's product variant
            quantity=1,
            price_snapshot=self.variant_b.price
        )

        # Try to checkout cart_a (contains Tenant B variant) in Tenant A context
        from apps.core.exceptions import TenantAccessError
        with self.assertRaises(TenantAccessError):
            EcommerceService.create_order(
                cart=cart_a,
                payment_method='cod',
                created_by_user=self.user_a
            )

    def test_billing_invoice_and_payment_flow(self):
        """
        Verify that BillingService creates unpaid invoices and processes payments
        correctly inside transaction, updating subscription end date and status.
        """
        from apps.tenants.models import SubscriptionPlan, TenantSubscription
        from apps.billing.models import Invoice
        from apps.billing.services import BillingService
        from datetime import date
        from decimal import Decimal

        TenantContext.set_current_tenant_id(self.tenant_a.id)

        # Create Plan and TenantSubscription
        plan = SubscriptionPlan.objects.create(
            name="Starter Plan",
            price=Decimal('29.00'),
            billing_cycle='monthly'
        )
        subscription = TenantSubscription.objects.create(
            tenant_id=self.tenant_a.id,
            plan=plan,
            status='trialing',
            start_date=date(2026, 1, 1),
            end_date=date(2026, 2, 1)
        )

        # 1. Create Invoice
        invoice = BillingService.create_invoice(
            subscription=subscription,
            amount=Decimal('29.00')
        )
        self.assertEqual(invoice.status, 'unpaid')
        self.assertEqual(invoice.amount, Decimal('29.00'))

        # 2. Process Payment
        paid_invoice = BillingService.process_payment(invoice)
        self.assertEqual(paid_invoice.status, 'paid')
        self.assertIsNotNone(paid_invoice.paid_at)

        # 3. Check subscription renewed
        subscription.refresh_from_db()
        self.assertEqual(subscription.status, 'active')
        # Extended by 30 days starting today
        expected_end = timezone.now().date() + timedelta(days=30)
        self.assertEqual(subscription.end_date, expected_end)

    def test_unauthorized_permission_crud_blocked(self):
        """
        Verify that non-admin cashiers cannot create/edit permissions or roles.
        """
        from rest_framework.test import APIClient

        client = APIClient()
        client.force_authenticate(user=self.user_a)

        # Try to POST to roles API
        # Header tenant resolver middleware is triggered by HTTP_X_TENANT_ID
        response = client.post(
            '/api/v1/permissions/roles/',
            {'name': 'Malicious Role', 'description': 'Hacker role'},
            HTTP_X_TENANT_ID=str(self.tenant_a.id)
        )
        # Should be forbidden because cashier lacks permission
        self.assertEqual(response.status_code, 403)

    def test_tenant_crud_boundaries(self):
        """
        Verify that normal users can only retrieve/update their own tenant and cannot delete it.
        """
        from rest_framework.test import APIClient
        client = APIClient()
        client.force_authenticate(user=self.user_a)

        # 1. GET business list - should only return User's own tenant (Tenant A)
        response = client.get('/api/v1/tenants/businesses/', HTTP_X_TENANT_ID=str(self.tenant_a.id))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()['results']), 1)
        self.assertEqual(response.json()['results'][0]['id'], str(self.tenant_a.id))

        # 2. DELETE business should be forbidden for non-superusers
        response = client.delete(
            f'/api/v1/tenants/businesses/{self.tenant_a.id}/',
            HTTP_X_TENANT_ID=str(self.tenant_a.id)
        )
        self.assertEqual(response.status_code, 403)

    def test_audit_log_tracking(self):
        """
        Verify that audit logs are created for critical writes.
        """
        from apps.audit.models import AuditLog
        from decimal import Decimal

        TenantContext.set_current_tenant_id(self.tenant_a.id)
        TenantContext.set_current_user(self.user_a)

        # Trigger shift start which writes audit log
        ShiftService.start_shift(
            branch=self.branch_a,
            cashier=self.user_a,
            opening_cash=Decimal('100.00')
        )

        # Read audit logs (bypassed via unfiltered() for test validation)
        logs = AuditLog.objects.unfiltered().filter(
            tenant_id=self.tenant_a.id,
            action='START_SHIFT'
        )
        self.assertTrue(logs.exists())
        self.assertEqual(logs.first().user_id, self.user_a.id)



