from django.contrib import admin
from .models import EmailVerificationToken, PasswordResetToken


@admin.register(EmailVerificationToken)
class EmailVerificationTokenAdmin(admin.ModelAdmin):
    list_display = ("user", "token", "is_used", "created_at", "expires_at")
    search_fields = ("user__email", "token")
    list_filter = ("is_used", "created_at", "expires_at")
    readonly_fields = ("created_at", "expires_at")


@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    list_display = ("user", "token", "is_used", "created_at", "expires_at")
    search_fields = ("user__email", "token")
    list_filter = ("is_used", "created_at", "expires_at")
    readonly_fields = ("created_at", "expires_at")
