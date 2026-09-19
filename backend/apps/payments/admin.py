from django.contrib import admin

from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        "payment_reference", "order", "provider", "amount",
        "currency", "status", "provider_transaction_id",
        "paid_at", "created_at", "updated_at",
    )
    search_fields = (
        "payment_reference", "order__order_number",
        "provider_transaction_id",
    )
    list_filter = ("status", "provider", "currency", "created_at")
    readonly_fields = (
        "order", "provider", "payment_reference", "amount", "currency",
        "status", "provider_transaction_id", "provider_response",
        "paid_at", "created_at", "updated_at",
    )

    def has_add_permission(self, request):
        return False
