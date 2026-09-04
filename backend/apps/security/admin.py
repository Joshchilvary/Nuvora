from django.contrib import admin
from .models import AuditLog, SecurityEvent


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("action", "resource_type", "resource_id", "actor", "result", "timestamp")
    search_fields = ("action", "resource_type", "resource_id", "description", "actor__email")
    list_filter = ("result", "resource_type", "timestamp")
    readonly_fields = ("timestamp",)


@admin.register(SecurityEvent)
class SecurityEventAdmin(admin.ModelAdmin):
    list_display = ("event_type", "user", "ip_address", "timestamp")
    search_fields = ("event_type", "description", "user__email", "ip_address")
    list_filter = ("event_type", "timestamp")
    readonly_fields = ("timestamp",)
