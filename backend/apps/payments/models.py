import uuid

from django.db import models


def generate_payment_reference():
    """Generate a unique, collision-safe payment reference.

    Format: PAY-NUV-XXXX-YY where XXXX is 4 random hex digits and YY is
    2 random hex letters.  UUID4 uniqueness guarantees no collisions.
    """
    raw = uuid.uuid4().hex[:6].upper()
    digits = "".join(c for c in raw if c.isdigit())
    letters = "".join(c for c in raw if c.isalpha())
    while len(digits) < 4:
        digits += uuid.uuid4().hex[:1].upper()
    while len(letters) < 2:
        letters += uuid.uuid4().hex[:1].upper()
    return f"PAY-NUV-{digits[:4]}-{letters[:2]}"


class Payment(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PROCESSING = "processing", "Processing"
        SUCCESSFUL = "successful", "Successful"
        FAILED = "failed", "Failed"
        CANCELLED = "cancelled", "Cancelled"
        REFUNDED = "refunded", "Refunded"

    class Provider(models.TextChoices):
        PAYSTACK = "paystack", "Paystack"

    # --- Relationships ---
    order = models.ForeignKey(
        "orders.Order",
        on_delete=models.CASCADE,
        related_name="payments",
    )

    # --- Identity ---
    provider = models.CharField(max_length=20, choices=Provider.choices)
    payment_reference = models.CharField(
        max_length=100,
        unique=True,
        default=generate_payment_reference,
    )

    # --- Money ---
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default="NGN")

    # --- State ---
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    # --- Provider data (provider-agnostic storage) ---
    provider_transaction_id = models.CharField(max_length=255, blank=True, default="")
    provider_response = models.JSONField(default=dict, blank=True)

    # --- Timestamps ---
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["order", "status"]),
            models.Index(fields=["payment_reference"]),
            models.Index(fields=["provider_transaction_id"]),
        ]

    def __str__(self):
        return f"Payment {self.payment_reference} — {self.status}"
