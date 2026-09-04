from django.db import models
from django.utils import timezone


class Notification(models.Model):
    TYPE_CHOICES = [
        ("order", "Order"),
        ("seller", "Seller"),
        ("security", "Security"),
        ("system", "System"),
        ("marketplace", "Marketplace"),
    ]

    user = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "is_read"]),
            models.Index(fields=["notification_type"]),
        ]

    def __str__(self):
        return f"{self.title} - {self.user.email}"
