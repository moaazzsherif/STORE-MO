---
title: Store Mo Backend
emoji: 📦
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 8000
pinned: false
---

# STORE-MO SaaS ERP Backend System

STORE-MO is a production-ready, multi-tenant enterprise ERP backend system designed to manage inventory, POS shifts, e-commerce stores, supplier relationships, subscription billing, and analytical reports across thousands of isolated businesses.

## Key Architectural Decisions

1. **Multi-Tenant Isolation Strategy (Shared DB, Shared Schema):**
   - Every tenant table contains a `tenant_id` column.
   - Isolation is enforced at the database level by overriding the default Model Manager (`TenantManager`).
   - A thread-local request context (`TenantContext`) captures and binds the active tenant's UUID during each request.
   - Queries automatically append `tenant_id` filtering. Attempting to run queries without an active tenant context returns empty querysets (or raises errors in strict mode) to eliminate data leakages.

2. **Tenant Safety Layer (Guard Rails):**
   - All tenant models inherit from `BaseTenantModel`, which enforces dynamic `UNIQUE(tenant_id, id)` constraints in PostgreSQL.
   - `TenantResolutionMiddleware` checks the custom header `X-Tenant-ID` or parses host subdomains to bind the active tenant.
   - It performs strict cross-tenant access checks: users cannot query data of a tenant that doesn't match their own profile.

3. **Critical Stock Control (No Direct Stock Updates):**
   - Stock counts are treated as a read-only cache.
   - Direct saves or bulk DB updates targeting `Stock.quantity` throw a `PermissionError`.
   - Modifying stock levels is **exclusively** permitted via the `InventoryService.create_movement()` service call, which runs inside an atomic transaction, locks the stock record using `select_for_update()`, writes an `InventoryMovement` entry, updates the stock cache, and logs the change to the `AuditLog`.

4. **Service & Selectors Separation (Clean Architecture):**
   - Views do not contain business logic.
   - Writable actions (creates, updates, state changes) reside inside `services.py` modules.
   - Read operations (reporting aggregates, lists) are contained inside `selectors.py` modules.

5. **Entity-Level Audit Logging:**
   - Every write operation is recorded. The base service layer automatically captures request metadata (client IP, request UUID, session ID) injected by `AuditLogMiddleware` and writes it to the `AuditLog` table.

---

## Technical Stack
- **Python 3.12+**
- **Django 5+**
- **Django REST Framework (DRF)**
- **PostgreSQL**
- **Redis** (Caching & Celery Broker)
- **Celery** (Asynchronous task worker and scheduler)
- **SimpleJWT** (JWT Authentication & token blacklisting)
- **Docker & docker-compose**

---

## Directory Structure

```
d:\antigavity projects\system\
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── manage.py
├── README.md
├── store_mo/
│   ├── settings.py
│   ├── urls.py
│   └── celery.py
└── apps/
    ├── core/               # BaseTenantModel, TenantContext, TenantManager, Middlewares, Unit Tests
    ├── tenants/            # Tenant, SubscriptionPlan, TenantSubscription, Billing
    ├── accounts/           # Custom User, LoginHistory, DeviceTracking, JWT Auth
    ├── permissions/        # RBAC permissions (Role, Permission, RolePermission, UserRole)
    ├── stores/             # Brand stores
    ├── branches/           # Store branches
    ├── employees/          # Employee profiles
    ├── shifts/             # Cashier shifts (Open/Close sessions)
    ├── products/           # Categories, Product, ProductVariant, Barcode, ProductImage
    ├── inventory/          # Warehouse, Stock, InventoryMovement
    ├── sales/              # Sale, SaleItem, POS checkout
    ├── purchases/          # PurchaseOrder, PurchaseOrderItem, PO receiving
    ├── customers/          # Customers registry, loyalty
    ├── suppliers/          # Suppliers accounts & supplier products
    ├── ecommerce/          # OnlineStore domain config, EcommerceOrder
    ├── billing/            # Invoices
    ├── reports/            # Analytical reports (Sales aggregates, COGS profit/loss)
    ├── notifications/      # low stock alerts, subscription expiration alerts
    ├── audit/              # Write Audit Logs database
    └── ai/                 # Structure placeholders for demand forecast / suggestions
```

---

## Setup & Running the Backend

### Method 1: Local Development

1. **Clone and Navigate:**
   Ensure your shell is open inside the project directory: `d:\antigavity projects\system\`.

2. **Create and Activate Virtual Environment:**
   ```bash
   python -m venv venv
   .\venv\Scripts\activate
   ```

3. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Database Configuration:**
   Create a local PostgreSQL database matching the settings (User: `store_mo_user`, DB Name: `store_mo_db`, Password: `store_mo_secret`).

5. **Run Migrations & Start Server:**
   ```bash
   python manage.py migrate
   python manage.py runserver
   ```

### Method 2: Docker Setup (Recommended)

To launch the complete infrastructure (Django Web, PostgreSQL DB, Redis cache, Celery workers, and Celery beat scheduler) with a single command:

1. **Build and Run:**
   ```bash
   docker-compose up --build
   ```

2. **Automatic Migrations:**
   The `web` container automatically runs migrations on startup before binding.

3. **Access API:**
   - Web Server: `http://localhost:8000/`
   - API Router Root: `http://localhost:8000/api/v1/`

---

## Running Automated Verification (Unit Tests)

We have implemented a comprehensive unit test suite covering:
1. **Tenant Isolation:** Enforcing boundaries between different businesses.
2. **Stock Constraints:** Verifying direct write protections on `Stock` cache and checking correct `InventoryService` execution.
3. **RBAC Validation:** Dynamic mapping of permission scopes.
4. **Audit Trails:** Automatic logging of transaction changes.

To execute the unit tests:

```bash
python manage.py test apps.core
```

Using Docker:
```bash
docker-compose exec web python manage.py test apps.core
```
