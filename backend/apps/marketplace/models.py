from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone
from PIL import Image


ALLOWED_IMAGE_FORMATS = {"JPEG", "JPG", "PNG", "WEBP"}
MAX_IMAGE_FILE_SIZE = 8 * 1024 * 1024  # 8 MB
MAX_IMAGE_DIMENSION = 6000  # pixels


def validate_product_image(file):
    """Validate an uploaded product image.

    Server-side validation ensures uploaded files are genuine images, are
    within reasonable size/dimension limits, and use supported formats.
    This protects against malformed uploads, storage abuse, and accidental
    non-image uploads.
    """
    if file is None:
        return

    if file.size and file.size > MAX_IMAGE_FILE_SIZE:
        raise ValidationError(
            f"Image file is too large. Maximum size is {MAX_IMAGE_FILE_SIZE // (1024 * 1024)} MB."
        )

    try:
        file.seek(0)
        with Image.open(file) as img:
            img.verify()
        file.seek(0)
        with Image.open(file) as img:
            format_name = (img.format or "").upper()
            if format_name not in ALLOWED_IMAGE_FORMATS:
                raise ValidationError(
                    f"Unsupported image format '{format_name}'. "
                    f"Allowed formats: {', '.join(sorted(ALLOWED_IMAGE_FORMATS))}."
                )
            width, height = img.size
            if max(width, height) > MAX_IMAGE_DIMENSION:
                raise ValidationError(
                    f"Image dimensions too large ({width}x{height}). "
                    f"Maximum dimension is {MAX_IMAGE_DIMENSION}px."
                )
    except ValidationError:
        raise
    except Exception:
        raise ValidationError("Uploaded file is not a valid image.")
    finally:
        try:
            file.seek(0)
        except Exception:
            pass


class Category(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to="categories/", blank=True, null=True, validators=[validate_product_image])
    parent = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="children",
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        indexes = [
            models.Index(fields=["slug"]),
            models.Index(fields=["parent", "is_active"]),
        ]

    def __str__(self):
        return self.name

    def clean(self):
        if self.parent and self.parent == self:
            raise ValidationError("A category cannot be its own parent.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


class Product(models.Model):
    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("active", "Active"),
        ("inactive", "Inactive"),
        ("out_of_stock", "Out of Stock"),
        ("archived", "Archived"),
    ]

    APPROVAL_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]

    seller = models.ForeignKey(
        "users.SellerProfile",
        on_delete=models.CASCADE,
        related_name="products",
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        related_name="products",
    )
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    compare_at_price = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    stock_quantity = models.IntegerField(default=0)
    sku = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    approval_status = models.CharField(max_length=20, choices=APPROVAL_CHOICES, default="pending")
    is_visible = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["slug", "seller"]),
            models.Index(fields=["status", "approval_status", "is_visible"]),
            models.Index(fields=["category", "status"]),
        ]
        constraints = [
            models.UniqueConstraint(fields=["seller", "sku"], name="unique_seller_sku"),
            models.UniqueConstraint(fields=["seller", "slug"], name="unique_seller_product_slug"),
        ]

    def __str__(self):
        return self.name


class ProductImage(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="images",
    )
    image = models.ImageField(upload_to="products/", validators=[validate_product_image])
    alt_text = models.CharField(max_length=255, blank=True)
    display_order = models.IntegerField(default=0)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["display_order", "id"]
        indexes = [
            models.Index(fields=["product", "display_order"]),
        ]

    def __str__(self):
        return f"{self.product.name} - Image {self.id}"

    def clean(self):
        super().clean()
        if self.image:
            validate_product_image(self.image)


class Wishlist(models.Model):
    user = models.OneToOneField(
        "users.User",
        on_delete=models.CASCADE,
        related_name="wishlist",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["user"]),
        ]

    def __str__(self):
        return f"Wishlist for {self.user.email}"


class WishlistItem(models.Model):
    wishlist = models.ForeignKey(
        Wishlist,
        on_delete=models.CASCADE,
        related_name="items",
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="wishlist_items",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["wishlist", "product"]),
        ]
        constraints = [
            models.UniqueConstraint(fields=["wishlist", "product"], name="unique_wishlist_product"),
        ]

    def __str__(self):
        return f"{self.product.name} in {self.wishlist.user.email}'s wishlist"
