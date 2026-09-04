from django.db import models
from django.utils import timezone


class Review(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("published", "Published"),
        ("hidden", "Hidden"),
        ("removed", "Removed"),
    ]

    customer = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        related_name="reviews",
    )
    product = models.ForeignKey(
        "marketplace.Product",
        on_delete=models.CASCADE,
        related_name="reviews",
    )
    rating = models.IntegerField()
    title = models.CharField(max_length=255, blank=True)
    body = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["customer", "product"]),
            models.Index(fields=["status", "created_at"]),
        ]
        constraints = [
            models.UniqueConstraint(fields=["customer", "product"], name="unique_customer_product_review"),
        ]

    def __str__(self):
        return f"{self.customer.email} - {self.product.name} ({self.rating})"
