import os
import sys
from pathlib import Path
from datetime import date, timedelta
from decimal import Decimal

# Add project root to python path
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'store_mo.settings')
import django
django.setup()

from apps.tenants.models import Tenant, SubscriptionPlan, TenantSubscription
from apps.accounts.models import User
from apps.stores.models import Store
from apps.branches.models import Branch
from apps.products.models import Category, Product, ProductVariant
from apps.inventory.models import Warehouse, Stock
from apps.shifts.models import Shift
from apps.sales.models import Sale, SaleItem
from apps.customers.models import Customer
from apps.core.tenant_context import TenantContext

# Check if database is already populated
if Tenant.objects.unfiltered().exists():
    print("Database already populated. Skipping mock data initialization.")
    sys.exit(0)

print("Empty database detected. Initializing mock data...")

# 2. Create Tenant
tenant = Tenant.objects.create(name="STORE-MO Cairo Group", subdomain="cairo")
print(f"Tenant created: {tenant.name}")

# Set current tenant context so BaseTenantModel doesn't throw TenantMissingError
TenantContext.set_current_tenant_id(tenant.id)

# 3. Create or update admin user
admin_user_qs = User.objects.unfiltered().filter(email="admin@example.com")
if admin_user_qs.exists():
    admin_user_qs.update(tenant=tenant, is_staff=True, is_superuser=True)
    admin_user = admin_user_qs.first()
    print("Admin user updated and linked to tenant")
else:
    admin_user = User.objects.create_superuser(
        email="admin@example.com",
        password="adminpassword123"
    )
    User.objects.unfiltered().filter(email="admin@example.com").update(tenant=tenant)
    admin_user = User.objects.unfiltered().get(email="admin@example.com")
    print("Admin user created and linked to tenant")

# 4. Create cashier user
cashier = User.objects.create_user(
    email="cashier@storemo.com",
    password="cashierpassword123",
    tenant=tenant,
    first_name="Mostafa",
    last_name="Kamal",
    is_staff=True
)
print("Cashier user created")

# 5. Create Subscription Plan
plan = SubscriptionPlan.objects.create(
    name="Enterprise Core Plan",
    price=Decimal("199.99"),
    billing_cycle="monthly",
    features={"max_stores": 5, "max_branches": 20, "analytics": True}
)
print(f"Subscription plan created: {plan.name}")

# 6. Create Tenant Subscription
subscription = TenantSubscription.objects.create(
    tenant=tenant,
    plan=plan,
    status="active",
    start_date=date.today(),
    end_date=date.today() + timedelta(days=365)
)
print("Subscription linked and active")

# 7. Create Store
store = Store.objects.create(
    tenant=tenant,
    name="STORE-MO Supermarket",
    slug="supermarket",
    is_active=True
)
print(f"Store created: {store.name}")

# 8. Create Branch
branch = Branch.objects.create(
    tenant=tenant,
    store=store,
    name="Nasr City Branch",
    phone="+201223456789",
    is_active=True
)
print(f"Branch created: {branch.name}")

# 9. Create Categories
cat_grocery = Category.objects.create(tenant=tenant, name="Grocery", slug="grocery")
cat_beverage = Category.objects.create(tenant=tenant, name="Beverages", slug="beverages", parent=cat_grocery)
cat_electronics = Category.objects.create(tenant=tenant, name="Electronics", slug="electronics")
print("Categories created")

# 10. Create Products & Variants
p_milk = Product.objects.create(tenant=tenant, category=cat_grocery, name="Almarai Fresh Milk 1L", sku="MILK-ALM-1L", is_active=True)
p_milk_var = ProductVariant.objects.create(
    tenant=tenant,
    product=p_milk,
    name="Full Cream",
    sku="MILK-ALM-1L-FC",
    price=Decimal("38.00"),
    cost=Decimal("30.00")
)

p_cola = Product.objects.create(tenant=tenant, category=cat_beverage, name="Coca Cola 330ml Can", sku="COLA-CAN-330", is_active=True)
p_cola_var = ProductVariant.objects.create(
    tenant=tenant,
    product=p_cola,
    name="Regular",
    sku="COLA-CAN-330-REG",
    price=Decimal("12.00"),
    cost=Decimal("9.50")
)

p_tv = Product.objects.create(tenant=tenant, category=cat_electronics, name="Samsung Smart TV 55 Inch", sku="SAMSUNG-TV-55", is_active=True)
p_tv_var = ProductVariant.objects.create(
    tenant=tenant,
    product=p_tv,
    name="UHD 4K Screen",
    sku="SAMSUNG-TV-55-UHD",
    price=Decimal("18500.00"),
    cost=Decimal("16000.00")
)
print("Products and variants created")

# 11. Create Warehouse
warehouse = Warehouse.objects.create(
    tenant=tenant,
    branch=branch,
    name="Main Retail Warehouse"
)
print(f"Warehouse created: {warehouse.name}")

# 12. Create Stock (with Stock Guard bypass)
def create_stock(product_variant, quantity):
    stock = Stock(
        tenant=tenant,
        warehouse=warehouse,
        product_variant=product_variant,
        quantity=quantity
    )
    stock._bypass_stock_guard = True
    stock.save()
    return stock

create_stock(p_milk_var, 150)
create_stock(p_cola_var, 500)
create_stock(p_tv_var, 12)
print("Stock levels initialized in warehouse")

# 13. Create Customer
customer = Customer.objects.create(
    tenant=tenant,
    first_name="Mohamed",
    last_name="Aly",
    phone="+201556677889",
    email="mohamed.aly@gmail.com",
    loyalty_points=350
)
print(f"Customer created: {customer}")

# 14. Create Shift
shift = Shift.objects.create(
    tenant=tenant,
    branch=branch,
    cashier=cashier,
    opening_cash=Decimal("1000.00"),
    status="open"
)
print(f"Shift opened: {shift}")

# 15. Create Sales
sale_1 = Sale.objects.create(
    tenant=tenant,
    branch=branch,
    shift=shift,
    cashier=cashier,
    customer=customer,
    subtotal=Decimal("18500.00"),
    discount_amount=Decimal("0.00"),
    tax_amount=Decimal("0.00"),
    total_amount=Decimal("18500.00"),
    payment_method="card",
    invoice_number="INV-2026-0001"
)

SaleItem.objects.create(
    tenant=tenant,
    sale=sale_1,
    product_variant=p_tv_var,
    quantity=1,
    unit_price=Decimal("18500.00"),
    total_price=Decimal("18500.00")
)

sale_2 = Sale.objects.create(
    tenant=tenant,
    branch=branch,
    shift=shift,
    cashier=cashier,
    customer=None,
    subtotal=Decimal("100.00"),
    discount_amount=Decimal("0.00"),
    tax_amount=Decimal("0.00"),
    total_amount=Decimal("100.00"),
    payment_method="cash",
    invoice_number="INV-2026-0002"
)

SaleItem.objects.create(
    tenant=tenant,
    sale=sale_2,
    product_variant=p_milk_var,
    quantity=2,
    unit_price=Decimal("38.00"),
    total_price=Decimal("76.00")
)
SaleItem.objects.create(
    tenant=tenant,
    sale=sale_2,
    product_variant=p_cola_var,
    quantity=2,
    unit_price=Decimal("12.00"),
    total_price=Decimal("24.00")
)

print("Sales and shift records successfully generated!")
