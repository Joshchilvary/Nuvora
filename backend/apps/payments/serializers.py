from rest_framework import serializers

from .models import Payment


class PaymentInitializeSerializer(serializers.Serializer):
    """Accepts only the order number for payment initialization."""

    order_number = serializers.CharField(max_length=20)


class PaymentRetrySerializer(serializers.Serializer):
    """Accepts only the provider for retrying payment."""

    provider = serializers.ChoiceField(
        choices=Payment.Provider.choices,
        default=Payment.Provider.PAYSTACK,
    )


class PaymentSerializer(serializers.ModelSerializer):
    """Read-only serializer for payment status/detail responses."""

    class Meta:
        model = Payment
        fields = [
            "id",
            "payment_reference",
            "order",
            "provider",
            "amount",
            "currency",
            "status",
            "provider_transaction_id",
            "paid_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields


class PaymentInitResponseSerializer(serializers.Serializer):
    """Serializer for the initialize/retry response."""

    payment_reference = serializers.CharField()
    provider = serializers.CharField()
    amount = serializers.CharField()
    currency = serializers.CharField()
    status = serializers.CharField()
    authorization_url = serializers.CharField()
    access_code = serializers.CharField()
    order_number = serializers.CharField()
