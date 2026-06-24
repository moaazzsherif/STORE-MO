from django.db import models
from apps.core.models import BaseTenantModel
from apps.products.models import ProductVariant
from apps.customers.models import Customer


class OnlineStore(BaseTenantModel):
    name = models.CharField(max_length=255)
    domain = models.CharField(max_length=255, unique=True)
    is_active = models.BooleanField(default=True)
    currency = models.CharField(max_length=10, default='USD')
    theme_settings = models.JSONField(default=dict, blank=True)
    logo = models.ImageField(upload_to='ecommerce_logos/', null=True, blank=True)
    banner_image = models.ImageField(upload_to='ecommerce_banners/', null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.domain})"


class EcommerceCategory(BaseTenantModel):
    name = models.CharField(max_length=255)
    parent = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='ecommerce_children'
    )

    class Meta(BaseTenantModel.Meta):
        constraints = BaseTenantModel.Meta.constraints + [
            models.UniqueConstraint(
                fields=['tenant', 'name', 'parent'],
                name='ecommerce_category_name_parent_tenant_unique'
            )
        ]

    def __str__(self):
        return self.name


class EcommerceProduct(BaseTenantModel):
    """
    Presentation layer model for the Online Store.
    Refers to a ProductVariant (does NOT duplicate product data).
    """
    product_variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.CASCADE,
        related_name='ecommerce_products'
    )
    is_visible = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    online_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    stock_status = models.CharField(
        max_length=20,
        choices=[('in_stock', 'In Stock'), ('out_of_stock', 'Out of Stock')],
        default='in_stock'
    )

    def __str__(self):
        return f"{self.product_variant.sku} - Online Presentation"


class Cart(BaseTenantModel):
    """
    Shopping cart model. customer is optional (guest checkouts allowed).
    """
    customer = models.ForeignKey(
        Customer,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='carts'
    )
    session_id = models.CharField(max_length=255, db_index=True)

    def __str__(self):
        return f"Cart {self.id} - Session {self.session_id}"


class CartItem(BaseTenantModel):
    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name='items'
    )
    product_variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.CASCADE,
        related_name='cart_items'
    )
    quantity = models.IntegerField(default=1)
    price_snapshot = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"{self.product_variant.sku} x {self.quantity} (Cart: {self.cart.id})"


class Order(BaseTenantModel):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]

    PAYMENT_METHODS = [
        ('cod', 'Cash on Delivery'),
        ('card', 'Card'),
        ('wallet', 'Wallet'),
    ]

    customer = models.ForeignKey(
        Customer,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='ecommerce_orders'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    discount = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    tax = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHODS)
    order_number = models.CharField(max_length=100)

    class Meta(BaseTenantModel.Meta):
        constraints = BaseTenantModel.Meta.constraints + [
            models.UniqueConstraint(
                fields=['tenant', 'order_number'],
                name='ecommerce_order_number_tenant_uniq'
            )
        ]

    def __str__(self):
        return f"Order {self.order_number} - Total {self.total}"


class OrderItem(BaseTenantModel):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items'
    )
    product_variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.PROTECT,
        related_name='order_items'
    )
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=12, decimal_places=2)
    total = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"{self.product_variant.sku} x {self.quantity} (Order: {self.order.id})"
