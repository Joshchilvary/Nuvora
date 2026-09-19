"""Payment API views.

All authenticated endpoints derive the user from ``request.user`` and
never accept user identifiers from the client.
"""

import json
import logging

from django.db.models import Q
from django.http import HttpResponse
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.orders.models import Order

from .models import Payment
from .providers.base import PaymentInitializationError
from .serializers import (
    PaymentInitResponseSerializer,
    PaymentInitializeSerializer,
    PaymentRetrySerializer,
    PaymentSerializer,
)
from .services import initialize_payment, verify_and_confirm_payment

logger = logging.getLogger(__name__)


class PaymentInitializeView(APIView):
    """``POST /api/payments/initialize/`` — Initialize payment for an order."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PaymentInitializeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order_number = serializer.validated_data["order_number"]

        # Find the order — 404 if not found or not owned by user
        try:
            order = Order.objects.get(
                order_number=order_number,
                user=request.user,
            )
        except Order.DoesNotExist:
            return Response(
                {"detail": "Order not found.", "code": "order_not_found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Validate order state
        if order.is_paid:
            return Response(
                {"detail": "Order has already been paid.", "code": "order_already_paid"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if order.status == Order.Status.CANCELLED:
            return Response(
                {"detail": "This order has been cancelled.", "code": "order_cancelled"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            result = initialize_payment(order)
        except PaymentInitializationError as exc:
            logger.error(
                "Payment initialization failed for order %s: %s",
                order.order_number, exc,
            )
            return Response(
                {"detail": "Payment initialization failed. Please try again.",
                 "code": "payment_initialization_failed"},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        except ValueError as exc:
            code = str(exc)
            return Response(
                {"detail": code.replace("_", " ").title() + ".",
                 "code": code},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            PaymentInitResponseSerializer(result).data,
            status=status.HTTP_201_CREATED,
        )


class PaymentDetailView(APIView):
    """``GET /api/payments/<payment_reference>/`` — Retrieve payment status."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, payment_reference):
        try:
            payment = Payment.objects.select_related("order").get(
                payment_reference=payment_reference,
            )
        except Payment.DoesNotExist:
            return Response(
                {"detail": "Payment not found.", "code": "payment_not_found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Ownership check
        if payment.order.user != request.user:
            return Response(
                {"detail": "Payment not found.", "code": "payment_not_found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(PaymentSerializer(payment).data)


class PaymentRetryView(APIView):
    """``POST /api/payments/<order_number>/retry/`` — Retry payment for an order."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, order_number):
        serializer = PaymentRetrySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        provider_name = serializer.validated_data["provider"]

        try:
            order = Order.objects.get(
                order_number=order_number,
                user=request.user,
            )
        except Order.DoesNotExist:
            return Response(
                {"detail": "Order not found.", "code": "order_not_found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if order.is_paid:
            return Response(
                {"detail": "Order has already been paid.", "code": "order_already_paid"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if order.status == Order.Status.CANCELLED:
            return Response(
                {"detail": "This order has been cancelled.", "code": "order_cancelled"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            result = initialize_payment(order, provider_name=provider_name)
        except PaymentInitializationError as exc:
            logger.error(
                "Payment retry failed for order %s: %s",
                order.order_number, exc,
            )
            return Response(
                {"detail": "Payment initialization failed. Please try again.",
                 "code": "payment_initialization_failed"},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        except ValueError as exc:
            code = str(exc)
            return Response(
                {"detail": code.replace("_", " ").title() + ".",
                 "code": code},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            PaymentInitResponseSerializer(result).data,
            status=status.HTTP_201_CREATED,
        )


class PaystackWebhookView(APIView):
    """``POST /api/payments/webhook/paystack/`` — Paystack webhook receiver.

    This endpoint is PUBLIC and must NOT require JWT authentication.
    It verifies Paystack's HMAC-SHA512 webhook signature before processing.
    """

    permission_classes = []  # No auth — provider calls this
    authentication_classes = []  # Disable JWT for webhook

    def post(self, request):
        signature = request.META.get("HTTP_X_PAYSTACK_SIGNATURE", "")

        # Import here to avoid circular imports at module level
        from .providers.paystack import get_paystack_provider

        provider = get_paystack_provider()

        if not provider.verify_webhook_signature(request.body, signature):
            logger.warning("Invalid Paystack webhook signature")
            return HttpResponse(
                json.dumps({"detail": "Invalid signature"}),
                status=400,
                content_type="application/json",
            )

        try:
            payload = json.loads(request.body)
        except (json.JSONDecodeError, ValueError):
            return HttpResponse(
                json.dumps({"detail": "Invalid JSON"}),
                status=400,
                content_type="application/json",
            )

        event = payload.get("event", "")
        data = payload.get("data", {})

        # Only process successful payment events
        if event != "charge.success":
            return HttpResponse(
                json.dumps({"status": "ignored", "event": event}),
                status=200,
                content_type="application/json",
            )

        reference = data.get("reference", "")
        if not reference:
            logger.warning("Webhook received without reference")
            return HttpResponse(
                json.dumps({"detail": "Missing reference"}),
                status=400,
                content_type="application/json",
            )

        try:
            result = verify_and_confirm_payment(reference)
        except Payment.DoesNotExist:
            logger.warning("Webhook for unknown payment reference: %s", reference)
            return HttpResponse(
                json.dumps({"detail": "Unknown payment reference"}),
                status=400,
                content_type="application/json",
            )

        logger.info(
            "Webhook processed: reference=%s status=%s",
            reference, result.get("status"),
        )

        return HttpResponse(
            json.dumps(result),
            status=200,
            content_type="application/json",
        )
