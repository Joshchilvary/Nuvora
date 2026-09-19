import uuid

from django.db import models
from django.utils import timezone


class Cart(models.Model):
    user = models.OneToOneField(
        "users.User",
        on_delete=models.CASCADE,
        related_name="cart",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["user"]),
        ]

    def __str__(self):
        return f"Cart for {self.user.email}"


class CartItem(models.Model):
    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name="items",
    )
    product = models.ForeignKey(
        "marketplace.Product",
        on_delete=models.CASCADE,
        related_name="cart_items",
    )
    quantity = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["cart", "product"]),
        ]
        constraints = [
            models.UniqueConstraint(fields=["cart", "product"], name="unique_cart_product"),
        ]

    def __str__(self):
        return f"{self.product.name} x {self.quantity}"


# ---------------------------------------------------------------------------
# Order
# ---------------------------------------------------------------------------


def generate_order_number():
    """Generate a unique, collision-safe order number.

    Format: NUV-XXXX-YY where XXXX is a 4-digit random segment and YY is a
    2-character random segment.  UUID4 uniqueness guarantees no collisions
    under normal concurrency.
    """
    raw = uuid.uuid4().hex[:6].upper()
    digits = "".join(c for c in raw if c.isdigit())
    letters = "".join(c for c in raw if c.isalpha())
    # Ensure we have at least 4 digits and 2 letters
    while len(digits) < 4:
        digits += uuid.uuid4().hex[:1].upper()
    while len(letters) < 2:
        letters += uuid.uuid4().hex[:1].upper()
    return f"NUV-{digits[:4]}-{letters[:2]}"


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        CONFIRMED = "confirmed", "Confirmed"
        PROCESSING = "processing", "Processing"
        SHIPPED = "shipped", "Shipped"
        DELIVERED = "delivered", "Delivered"
        CANCELLED = "cancelled", "Cancelled"

    # --- Relationships -------------------------------------------------------
    user = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        related_name="orders",
    )

    # --- Reference -----------------------------------------------------------
    order_number = models.CharField(max_length=20, unique=True, default=generate_order_number)

    # --- Status --------------------------------------------------------------
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    # --- Customer information snapshot ----------------------------------------
    email = models.EmailField(max_length=255)
    full_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=30, blank=True)

    # --- Shipping address snapshot --------------------------------------------
    shipping_address = models.TextField()
    shipping_city = models.CharField(max_length=255)
    shipping_region = models.CharField(max_length=255)
    shipping_postal_code = models.CharField(max_length=20)
    shipping_country = models.CharField(max_length=255)

    # --- Financials (server-calculated) --------------------------------------
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    shipping_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2)

    # --- Delivery ------------------------------------------------------------
    delivery_method = models.CharField(max_length=50)
    delivery_description = models.CharField(max_length=255, blank=True)

    # --- Timestamps ----------------------------------------------------------
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "status"]),
            models.Index(fields=["order_number"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return f"Order {self.order_number}"


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items",
    )
    product = models.ForeignKey(
        "marketplace.Product",
        on_delete=models.SET_NULL,
        null=True,
        related_name="order_items",
    )

    # --- Historical snapshots (immutable after creation) ---------------------
    product_name = models.CharField(max_length=255)
    product_image = models.URLField(max_length=500, blank=True)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    quantity = models.IntegerField()
    line_total = models.DecimalField(max_digits=12, decimal_places=2)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]
        indexes = [
            models.Index(fields=["order", "product"]),
        ]

    def __str__(self):
        return f"{self.product_name} x {self.quantity}"
