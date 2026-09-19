"""Payment orchestration service.

This module contains the business logic for payment initialization,
webhook processing, verification, retry, and expiration.  Provider-specific
HTTP calls are delegated to the provider classes in ``providers/``.
"""

import logging
import os
from decimal import Decimal

from django.db import transaction
from django.db.models import Q
from django.utils import timezone

from apps.marketplace.models import Product
from apps.orders.models import Order

from .models import Payment, generate_payment_reference
from .providers.base import PaymentInitializationError, PaymentVerificationError
from .providers.paystack import get_paystack_provider

logger = logging.getLogger(__name__)

PAYMENT_TIMEOUT_MINUTES = int(os.environ.get("PAYMENT_TIMEOUT_MINUTES", "30"))
PAYMENT_CURRENCY = os.environ.get("PAYMENT_CURRENCY", "NGN")


def _get_provider(provider_name):
    """Return the appropriate provider instance."""
    if provider_name == Payment.Provider.PAYSTACK:
        return get_paystack_provider()
    raise ValueError(f"Unsupported payment provider: {provider_name}")


def initialize_payment(order, provider_name=Payment.Provider.PAYSTACK):
    """Initialize a payment for an existing order.

    Validates the order state, creates a Payment record, calls the provider
    initialization API, and returns the authorization URL.

    Returns:
        dict with payment_reference, authorization_url, access_code, etc.

    Raises:
        ValueError: If the order is invalid for payment.
        PaymentInitializationError: If the provider call fails.
    """
    if order.is_paid:
        raise ValueError("order_already_paid")
    if order.status == Order.Status.CANCELLED:
        raise ValueError("order_cancelled")

    # Check for an existing active payment (pending/processing)
    active_payment = order.payments.filter(
        status__in=[Payment.Status.PENDING, Payment.Status.PROCESSING]
    ).first()

    # Allow retry: if there's an active pending payment, fail it first
    if active_payment and active_payment.status == Payment.Status.PENDING:
        active_payment.status = Payment.Status.CANCELLED
        active_payment.save(update_fields=["status", "updated_at"])

    provider = _get_provider(provider_name)

    amount_kobo = int(order.total * Decimal("100"))

    payment = Payment.objects.create(
        order=order,
        provider=provider_name,
        amount=order.total,
        currency=PAYMENT_CURRENCY,
        status=Payment.Status.PENDING,
    )

    try:
        result = provider.initialize_transaction(
            amount=amount_kobo,
            email=order.email,
            reference=payment.payment_reference,
            metadata={
                "order_number": order.order_number,
                "payment_reference": payment.payment_reference,
            },
        )
    except PaymentInitializationError:
        payment.status = Payment.Status.FAILED
        payment.save(update_fields=["status", "updated_at"])
        raise

    payment.provider_response = {
        "authorization_url": result["authorization_url"],
        "access_code": result["access_code"],
    }
    payment.status = Payment.Status.PENDING
    payment.save(update_fields=["provider_response", "status", "updated_at"])

    return {
        "payment_reference": payment.payment_reference,
        "provider": payment.provider,
        "amount": str(payment.amount),
        "currency": payment.currency,
        "status": payment.status,
        "authorization_url": result["authorization_url"],
        "access_code": result["access_code"],
        "order_number": order.order_number,
    }


def verify_and_confirm_payment(payment_reference, provider_name=Payment.Provider.PAYSTACK):
    """Verify a payment with the provider and mark it successful if valid.

    Called by the webhook handler and can also be called by a verification
    endpoint.  Uses database-level locking to ensure exactly-once processing.

    Returns:
        dict with status and details.

    Raises:
        Payment.DoesNotExist: If the reference is not found.
    """
    provider = _get_provider(provider_name)

    with transaction.atomic():
        payment = (
            Payment.objects.select_for_update()
            .get(payment_reference=payment_reference)
        )

        # Idempotency: already processed
        if payment.status == Payment.Status.SUCCESSFUL:
            return {
                "status": "already_successful",
                "payment_reference": payment.payment_reference,
                "order_number": payment.order.order_number,
            }

        if payment.status in (Payment.Status.FAILED, Payment.Status.CANCELLED):
            return {
                "status": "already_terminal",
                "payment_status": payment.status,
                "payment_reference": payment.payment_reference,
            }

        order = Order.objects.select_for_update().get(pk=payment.order_id)

        # Verify with provider
        try:
            verification = provider.verify_transaction(payment.payment_reference)
        except PaymentVerificationError as exc:
            payment.status = Payment.Status.FAILED
            payment.provider_response["verification_error"] = str(exc)
            payment.save(update_fields=["status", "provider_response", "updated_at"])
            return {
                "status": "verification_failed",
                "error": str(exc),
                "payment_reference": payment.payment_reference,
            }

        # Validate reference
        if verification["reference"] != payment.payment_reference:
            payment.status = Payment.Status.FAILED
            payment.provider_response["mismatch"] = "reference"
            payment.save(update_fields=["status", "provider_response", "updated_at"])
            return {
                "status": "reference_mismatch",
                "payment_reference": payment.payment_reference,
            }

        # Validate amount (Paystack returns amount in subunit)
        amount_kobo = int(payment.amount * Decimal("100"))
        if int(verification["amount"]) != amount_kobo:
            payment.status = Payment.Status.FAILED
            payment.provider_response["mismatch"] = "amount"
            payment.save(update_fields=["status", "provider_response", "updated_at"])
            return {
                "status": "amount_mismatch",
                "payment_reference": payment.payment_reference,
            }

        # Validate currency
        if verification["currency"].upper() != payment.currency.upper():
            payment.status = Payment.Status.FAILED
            payment.provider_response["mismatch"] = "currency"
            payment.save(update_fields=["status", "provider_response", "updated_at"])
            return {
                "status": "currency_mismatch",
                "payment_reference": payment.payment_reference,
            }

        # Check provider status
        if verification["status"] != "success":
            payment.status = Payment.Status.FAILED
            payment.provider_response["provider_status"] = verification["status"]
            payment.save(update_fields=["status", "provider_response", "updated_at"])
            return {
                "status": "provider_declined",
                "provider_status": verification["status"],
                "payment_reference": payment.payment_reference,
            }

        # Check if order already paid (concurrent payment protection)
        if order.is_paid:
            payment.status = Payment.Status.FAILED
            payment.provider_response["reason"] = "order_already_paid"
            payment.save(update_fields=["status", "provider_response", "updated_at"])
            return {
                "status": "order_already_paid",
                "payment_reference": payment.payment_reference,
            }

        # All checks passed — mark successful
        payment.status = Payment.Status.SUCCESSFUL
        payment.provider_transaction_id = verification["provider_transaction_id"]
        payment.paid_at = timezone.now()
        payment.provider_response["provider_status"] = "success"
        payment.save(update_fields=[
            "status", "provider_transaction_id", "paid_at",
            "provider_response", "updated_at",
        ])

        # Confirm the order
        order.is_paid = True
        order.status = Order.Status.CONFIRMED
        order.save(update_fields=["is_paid", "status", "updated_at"])

        return {
            "status": "successful",
            "payment_reference": payment.payment_reference,
            "order_number": order.order_number,
        }


def expire_stale_payments():
    """Cancel unpaid orders whose payment window has expired and restore stock.

    This is designed to be called by the ``expire_pending_payments``
    management command.  Each cancellation + stock restoration happens
    atomically.  The state transition (pending→cancelled) serves as the
    idempotency guard.

    Returns:
        List of order numbers that were cancelled.
    """
    expired_orders = Order.objects.filter(
        is_paid=False,
        status=Order.Status.PENDING,
    ).filter(
        payments__status__in=[Payment.Status.PENDING, Payment.Status.FAILED],
        payments__created_at__lt=timezone.now() - timezone.timedelta(minutes=PAYMENT_TIMEOUT_MINUTES),
    ).distinct()

    cancelled_orders = []

    for order in expired_orders:
        _expire_single_order(order)
        cancelled_orders.append(order.order_number)

    return cancelled_orders


def _expire_single_order(order):
    """Expire a single unpaid order inside an atomic transaction.

    Before cancelling, verifies with the provider that the payment is
    genuinely not successful (to handle the webhook/expiration race).
    """
    with transaction.atomic():
        order = Order.objects.select_for_update().get(pk=order.pk)

        # Double-check: if order was paid between query and lock, skip
        if order.is_paid or order.status != Order.Status.PENDING:
            return

        # Check if any payment became successful between query and lock
        successful_payment = order.payments.filter(
            status=Payment.Status.SUCCESSFUL
        ).exists()

        if successful_payment:
            # Payment succeeded — confirm order instead of cancelling
            order.is_paid = True
            order.status = Order.Status.CONFIRMED
            order.save(update_fields=["is_paid", "status", "updated_at"])
            logger.info(
                "Order %s was paid during expiration window — confirmed instead of cancelled",
                order.order_number,
            )
            return

        # Perform server-side verification for pending payments before expiry
        pending_payments = order.payments.filter(
            status__in=[Payment.Status.PENDING, Payment.Status.PROCESSING]
        )
        for payment in pending_payments:
            try:
                provider = _get_provider(payment.provider)
                verification = provider.verify_transaction(payment.payment_reference)
                if verification["status"] == "success":
                    # Payment genuinely succeeded — confirm instead of cancelling
                    amount_kobo = int(payment.amount * Decimal("100"))
                    if (
                        int(verification["amount"]) == amount_kobo
                        and verification["currency"].upper() == payment.currency.upper()
                    ):
                        payment.status = Payment.Status.SUCCESSFUL
                        payment.provider_transaction_id = verification["provider_transaction_id"]
                        payment.paid_at = timezone.now()
                        payment.save(update_fields=[
                            "status", "provider_transaction_id", "paid_at", "updated_at",
                        ])
                        order.is_paid = True
                        order.status = Order.Status.CONFIRMED
                        order.save(update_fields=["is_paid", "status", "updated_at"])
                        logger.info(
                            "Order %s confirmed via provider verification during expiration",
                            order.order_number,
                        )
                        return
            except PaymentVerificationError:
                # Verification failed — safe to proceed with expiration
                pass

        # Restore stock for each order item
        order_items = order.items.select_related("product").all()
        for item in order_items:
            if item.product is not None:
                product = Product.objects.select_for_update().get(pk=item.product_id)
                product.stock_quantity += item.quantity
                product.save(update_fields=["stock_quantity"])

        # Cancel the order
        order.status = Order.Status.CANCELLED
        order.save(update_fields=["status", "updated_at"])

        # Cancel all pending/processing payments
        pending_payments.update(status=Payment.Status.CANCELLED)

        logger.info("Order %s expired — stock restored, order cancelled", order.order_number)
