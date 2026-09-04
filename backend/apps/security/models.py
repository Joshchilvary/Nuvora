from django.db import models
from django.utils import timezone


class AuditLog(models.Model):
    actor = models.ForeignKey(
        "users.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="audit_logs",
    )
    action = models.CharField(max_length=255)
    resource_type = models.CharField(max_length=100)
    resource_id = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    result = models.CharField(max_length=20, default="success")
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    timestamp = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["-timestamp"]
        indexes = [
            models.Index(fields=["actor", "timestamp"]),
            models.Index(fields=["resource_type", "resource_id"]),
            models.Index(fields=["timestamp"]),
        ]

    def __str__(self):
        return f"{self.action} - {self.resource_type} - {self.timestamp}"


class SecurityEvent(models.Model):
    EVENT_CHOICES = [
        ("failed_login", "Failed Login"),
        ("successful_login", "Successful Login"),
        ("mfa_verification", "MFA Verification"),
        ("suspicious_session", "Suspicious Session"),
        ("session_revoked", "Session Revoked"),
        ("account_locked", "Account Locked"),
        ("password_reset_requested", "Password Reset Requested"),
        ("security_alert_resolved", "Security Alert Resolved"),
    ]

    user = models.ForeignKey(
        "users.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="security_events",
    )
    event_type = models.CharField(max_length=50, choices=EVENT_CHOICES)
    description = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    timestamp = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["-timestamp"]
        indexes = [
            models.Index(fields=["user", "event_type", "timestamp"]),
            models.Index(fields=["event_type", "timestamp"]),
        ]

    def __str__(self):
        return f"{self.get_event_type_display()} - {self.user} - {self.timestamp}"
