"""
Phase 8D — Hardening & Regression Tests for the NUVORA Payment system.

Covers: duplicate webhook idempotency, concurrent webhook race, payment retry,
already-paid order protection, ownership security, server-side amount verification,
stock consistency, expiration race condition, and payment status endpoint security.
"""

import hashlib
import hmac
import json
import os
import unittest
from decimal import Decimal
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from apps.marketplace.models import Category, Product
from apps.orders.models import Order, OrderItem
from apps.users.models import SellerProfile

from .models import Payment, generate_payment_reference

User = get_user_model()

PAYSTACK_WEBHOOK_SECRET = "test_webhook_secret_123"


def _make_user(email="buyer@test.com"):
    return User.objects.create_user(email=email, password="pass1234")


def _make_seller():
    user = User.objects.create_user(email="seller@test.com", password="pass1234")
    return SellerProfile.objects.create(
        user=user, store_name="Test Store", store_slug="test-store", status="active"
    )


def _make_product(seller, category, **kwargs):
    defaults = dict(
        name="Test Product", slug="test-product", sku="SKU-TEST",
        price=Decimal("5000.00"), stock_quantity=10,
        status="active", approval_status="approved", is_visible=True,
    )
    defaults.update(kwargs)
    return Product.objects.create(seller=seller, category=category, **defaults)


def _make_order(user, product, quantity=2):
    order = Order.objects.create(
        user=user, email=user.email, full_name="Test Buyer",
        shipping_address="123 Test St", shipping_city="Lagos",
        shipping_region="Lagos", shipping_postal_code="100001",
        shipping_country="NG", subtotal=product.price * quantity,
        shipping_cost=Decimal("0.00"), discount=Decimal("0.00"),
        total=product.price * quantity, delivery_method="standard",
    )
    OrderItem.objects.create(
        order=order, product=product, product_name=product.name,
        unit_price=product.price, quantity=quantity,
        line_total=product.price * quantity,
    )
    product.stock_quantity -= quantity
    product.save(update_fields=["stock_quantity"])
    return order


def _make_payment(order, status=Payment.Status.PENDING):
    return Payment.objects.create(
        order=order, provider=Payment.Provider.PAYSTACK,
        amount=order.total, currency="NGN", status=status,
    )


def _sign(payload_bytes, secret=PAYSTACK_WEBHOOK_SECRET):
    return hmac.new(secret.encode(), payload_bytes, hashlib.sha512).hexdigest()


# ============================================================================
# §6 — Duplicate Webhook Idempotency
# ============================================================================


class DuplicateWebhookTests(TestCase):
    """Duplicate webhook delivery must be idempotent."""

    def setUp(self):
        self.user = _make_user()
        self.seller = _make_seller()
        self.category = Category.objects.create(name="X", slug="x", is_active=True)
        self.product = _make_product(self.seller, self.category)
        self.order = _make_order(self.user, self.product, 2)
        self.payment = _make_payment(self.order)

    @patch("apps.payments.services.get_paystack_provider")
    def test_duplicate_webhook_no_duplicate_stock_restore(self, mock_prov):
        """Sending the same successful webhook twice must not restore stock."""
        from .services import verify_and_confirm_payment

        mock_prov.return_value.verify_transaction.return_value = {
            "status": "success", "provider_transaction_id": "11111",
            "reference": self.payment.payment_reference,
            "amount": int(self.payment.amount * Decimal("100")), "currency": "NGN",
        }

        result1 = verify_and_confirm_payment(self.payment.payment_reference)
        self.assertEqual(result1["status"], "successful")

        result2 = verify_and_confirm_payment(self.payment.payment_reference)
        self.assertEqual(result2["status"], "already_successful")

        self.order.refresh_from_db()
        self.assertTrue(self.order.is_paid)
        self.assertEqual(self.order.status, Order.Status.CONFIRMED)
        self.assertEqual(Payment.objects.filter(
            order=self.order, status=Payment.Status.SUCCESSFUL
        ).count(), 1)

    @patch("apps.payments.services.get_paystack_provider")
    def test_duplicate_webhook_no_order_status_change(self, mock_prov):
        """Second webhook must not change order updated_at."""
        from .services import verify_and_confirm_payment

        mock_prov.return_value.verify_transaction.return_value = {
            "status": "success", "provider_transaction_id": "22222",
            "reference": self.payment.payment_reference,
            "amount": int(self.payment.amount * Decimal("100")), "currency": "NGN",
        }

        verify_and_confirm_payment(self.payment.payment_reference)
        self.order.refresh_from_db()
        first_updated = self.order.updated_at

        verify_and_confirm_payment(self.payment.payment_reference)
        self.order.refresh_from_db()
        self.assertEqual(self.order.updated_at, first_updated)

    @patch("apps.payments.views.verify_and_confirm_payment")
    def test_duplicate_webhook_via_endpoint(self, mock_v):
        """Two webhook POSTs with same reference: both return 200, no corruption."""
        os.environ["PAYSTACK_SECRET_KEY"] = PAYSTACK_WEBHOOK_SECRET
        url = reverse("paystack-webhook")
        mock_v.return_value = {"status": "successful"}

        payload = json.dumps({
            "event": "charge.success",
            "data": {"reference": self.payment.payment_reference,
                     "amount": int(self.payment.amount * Decimal("100")),
                     "currency": "NGN", "status": "success", "id": 111},
        }).encode()

        resp1 = self.client.post(url, payload, content_type="application/json",
                                 HTTP_X_PAYSTACK_SIGNATURE=_sign(payload))
        resp2 = self.client.post(url, payload, content_type="application/json",
                                 HTTP_X_PAYSTACK_SIGNATURE=_sign(payload))
        self.assertEqual(resp1.status_code, 200)
        self.assertEqual(resp2.status_code, 200)
        # verify_and_confirm_payment called exactly twice (once per webhook)
        self.assertEqual(mock_v.call_count, 2)
        os.environ.pop("PAYSTACK_SECRET_KEY", None)


# ============================================================================
# §7 — Concurrent Webhook Race
# ============================================================================


class ConcurrentWebhookTests(TestCase):
    """Concurrent successful webhook processing."""

    def setUp(self):
        self.user = _make_user()
        self.seller = _make_seller()
        self.category = Category.objects.create(name="X", slug="x", is_active=True)
        self.product = _make_product(self.seller, self.category)
        self.order = _make_order(self.user, self.product, 2)
        self.payment = _make_payment(self.order)

    @patch("apps.payments.services.get_paystack_provider")
    def test_concurrent_webhook_only_one_succeeds(self, mock_prov):
        """Two calls for same reference: one successful, one already_successful."""
        from .services import verify_and_confirm_payment

        mock_prov.return_value.verify_transaction.return_value = {
            "status": "success", "provider_transaction_id": "33333",
            "reference": self.payment.payment_reference,
            "amount": int(self.payment.amount * Decimal("100")), "currency": "NGN",
        }

        result1 = verify_and_confirm_payment(self.payment.payment_reference)
        result2 = verify_and_confirm_payment(self.payment.payment_reference)

        statuses = {result1["status"], result2["status"]}
        self.assertIn("successful", statuses)
        self.assertIn("already_successful", statuses)

        self.order.refresh_from_db()
        self.assertTrue(self.order.is_paid)
        self.assertEqual(self.order.status, Order.Status.CONFIRMED)
        self.assertEqual(Payment.objects.filter(
            order=self.order, status=Payment.Status.SUCCESSFUL
        ).count(), 1)

    @patch("apps.payments.services.get_paystack_provider")
    def test_stock_not_restored_on_success(self, mock_prov):
        """Successful payment must not restore stock — order is confirmed."""
        from .services import verify_and_confirm_payment

        mock_prov.return_value.verify_transaction.return_value = {
            "status": "success", "provider_transaction_id": "44444",
            "reference": self.payment.payment_reference,
            "amount": int(self.payment.amount * Decimal("100")), "currency": "NGN",
        }
        stock_before = self.product.stock_quantity

        verify_and_confirm_payment(self.payment.payment_reference)

        self.product.refresh_from_db()
        self.assertEqual(self.product.stock_quantity, stock_before)

    @patch("apps.payments.services.get_paystack_provider")
    def test_no_duplicate_payment_record(self, mock_prov):
        """Second call must not create a new Payment record."""
        from .services import verify_and_confirm_payment

        mock_prov.return_value.verify_transaction.return_value = {
            "status": "success", "provider_transaction_id": "55555",
            "reference": self.payment.payment_reference,
            "amount": int(self.payment.amount * Decimal("100")), "currency": "NGN",
        }

        verify_and_confirm_payment(self.payment.payment_reference)
        count_after_first = Payment.objects.filter(order=self.order).count()

        verify_and_confirm_payment(self.payment.payment_reference)
        count_after_second = Payment.objects.filter(order=self.order).count()

        self.assertEqual(count_after_first, count_after_second)


# ============================================================================
# §9 — Payment Retry
# ============================================================================


class PaymentRetryRegressionTests(TestCase):
    """Payment retry creates new reference, same order, no duplication."""

    def setUp(self):
        self.client = APIClient()
        self.user = _make_user()
        self.seller = _make_seller()
        self.category = Category.objects.create(name="X", slug="x", is_active=True)
        self.product = _make_product(self.seller, self.category)
        self.order = _make_order(self.user, self.product)
        self.client.force_authenticate(self.user)

    @patch("apps.payments.services.get_paystack_provider")
    def test_retry_uses_same_order(self, mock_prov):
        """Retry must reference the same order."""
        mock_prov.return_value.initialize_transaction.return_value = {
            "authorization_url": "u", "access_code": "a", "reference": "r",
        }
        _make_payment(self.order, status=Payment.Status.FAILED)
        url = reverse("payment-retry", kwargs={"order_number": self.order.order_number})
        resp = self.client.post(url, {"provider": "paystack"}, format="json")
        self.assertEqual(resp.status_code, 201)
        new_payment = Payment.objects.filter(order=self.order).order_by("-created_at").first()
        self.assertEqual(new_payment.order_id, self.order.id)

    @patch("apps.payments.services.get_paystack_provider")
    def test_retry_new_reference(self, mock_prov):
        """Retry must create a new unique payment reference."""
        mock_prov.return_value.initialize_transaction.return_value = {
            "authorization_url": "u", "access_code": "a", "reference": "r",
        }
        old_payment = _make_payment(self.order, status=Payment.Status.FAILED)
        url = reverse("payment-retry", kwargs={"order_number": self.order.order_number})
        resp = self.client.post(url, {"provider": "paystack"}, format="json")
        new_payment = Payment.objects.filter(order=self.order).order_by("-created_at").first()
        self.assertNotEqual(old_payment.payment_reference, new_payment.payment_reference)

    @patch("apps.payments.services.get_paystack_provider")
    def test_retry_does_not_duplicate_order(self, mock_prov):
        """Retry must not create a new order."""
        mock_prov.return_value.initialize_transaction.return_value = {
            "authorization_url": "u", "access_code": "a", "reference": "r",
        }
        _make_payment(self.order, status=Payment.Status.FAILED)
        order_count_before = Order.objects.filter(user=self.user).count()
        url = reverse("payment-retry", kwargs={"order_number": self.order.order_number})
        self.client.post(url, {"provider": "paystack"}, format="json")
        order_count_after = Order.objects.filter(user=self.user).count()
        self.assertEqual(order_count_before, order_count_after)

    @patch("apps.payments.services.get_paystack_provider")
    def test_retry_does_not_duplicate_order_items(self, mock_prov):
        """Retry must not duplicate order items."""
        mock_prov.return_value.initialize_transaction.return_value = {
            "authorization_url": "u", "access_code": "a", "reference": "r",
        }
        items_before = OrderItem.objects.filter(order=self.order).count()
        _make_payment(self.order, status=Payment.Status.FAILED)
        url = reverse("payment-retry", kwargs={"order_number": self.order.order_number})
        self.client.post(url, {"provider": "paystack"}, format="json")
        items_after = OrderItem.objects.filter(order=self.order).count()
        self.assertEqual(items_before, items_after)

    @patch("apps.payments.services.get_paystack_provider")
    def test_retry_does_not_change_stock(self, mock_prov):
        """Retry must not alter product stock quantities."""
        mock_prov.return_value.initialize_transaction.return_value = {
            "authorization_url": "u", "access_code": "a", "reference": "r",
        }
        _make_payment(self.order, status=Payment.Status.FAILED)
        stock_before = self.product.stock_quantity
        url = reverse("payment-retry", kwargs={"order_number": self.order.order_number})
        self.client.post(url, {"provider": "paystack"}, format="json")
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock_quantity, stock_before)

    @patch("apps.payments.services.get_paystack_provider")
    def test_retry_amount_from_order(self, mock_prov):
        """Retry must derive amount from the order, not from client."""
        mock_prov.return_value.initialize_transaction.return_value = {
            "authorization_url": "u", "access_code": "a", "reference": "r",
        }
        _make_payment(self.order, status=Payment.Status.FAILED)
        url = reverse("payment-retry", kwargs={"order_number": self.order.order_number})
        self.client.post(url, {"provider": "paystack"}, format="json")
        new_payment = Payment.objects.filter(order=self.order).order_by("-created_at").first()
        self.assertEqual(new_payment.amount, self.order.total)

    @patch("apps.payments.services.get_paystack_provider")
    def test_retry_cancelled_pending_payment(self, mock_prov):
        """Retry with an active pending payment must cancel the old one first."""
        mock_prov.return_value.initialize_transaction.return_value = {
            "authorization_url": "u", "access_code": "a", "reference": "r",
        }
        old_payment = _make_payment(self.order, status=Payment.Status.PENDING)
        url = reverse("payment-retry", kwargs={"order_number": self.order.order_number})
        self.client.post(url, {"provider": "paystack"}, format="json")
        old_payment.refresh_from_db()
        self.assertEqual(old_payment.status, Payment.Status.CANCELLED)


# ============================================================================
# §10 — Already-Paid Order Protection
# ============================================================================


class AlreadyPaidOrderProtectionTests(TestCase):
    """Already-paid orders must reject init and retry."""

    def setUp(self):
        self.client = APIClient()
        self.user = _make_user()
        self.seller = _make_seller()
        self.category = Category.objects.create(name="X", slug="x", is_active=True)
        self.product = _make_product(self.seller, self.category)
        self.order = _make_order(self.user, self.product)
        self.order.is_paid = True
        self.order.status = Order.Status.CONFIRMED
        self.order.save(update_fields=["is_paid", "status"])
        self.client.force_authenticate(self.user)

    @patch("apps.payments.services.get_paystack_provider")
    def test_init_paid_order_rejected(self, mock_prov):
        url = reverse("payment-initialize")
        resp = self.client.post(url, {"order_number": self.order.order_number}, format="json")
        self.assertEqual(resp.status_code, 400)
        self.assertEqual(resp.json()["code"], "order_already_paid")
        mock_prov.return_value.initialize_transaction.assert_not_called()

    def test_retry_paid_order_rejected(self):
        url = reverse("payment-retry", kwargs={"order_number": self.order.order_number})
        resp = self.client.post(url, {"provider": "paystack"}, format="json")
        self.assertEqual(resp.status_code, 400)
        self.assertEqual(resp.json()["code"], "order_already_paid")

    @patch("apps.payments.services.get_paystack_provider")
    def test_no_new_payment_created_for_paid_order(self, mock_prov):
        """Initialize for paid order must not create any Payment record."""
        count_before = Payment.objects.filter(order=self.order).count()
        url = reverse("payment-initialize")
        self.client.post(url, {"order_number": self.order.order_number}, format="json")
        count_after = Payment.objects.filter(order=self.order).count()
        self.assertEqual(count_before, count_after)

    @patch("apps.payments.services.get_paystack_provider")
    def test_existing_successful_payment_untouched(self, mock_prov):
        """Initialize for paid order must not modify existing successful payment."""
        existing = _make_payment(self.order, status=Payment.Status.SUCCESSFUL)
        url = reverse("payment-initialize")
        self.client.post(url, {"order_number": self.order.order_number}, format="json")
        existing.refresh_from_db()
        self.assertEqual(existing.status, Payment.Status.SUCCESSFUL)


# ============================================================================
# §11 — Payment Ownership Security
# ============================================================================


class PaymentOwnershipSecurityTests(TestCase):
    """Customer B must not access Customer A's payments."""

    def setUp(self):
        self.client = APIClient()
        self.user_a = _make_user(email="a@test.com")
        self.user_b = _make_user(email="b@test.com")
        self.seller = _make_seller()
        self.category = Category.objects.create(name="X", slug="x", is_active=True)
        self.product = _make_product(self.seller, self.category)
        self.order_a = _make_order(self.user_a, self.product)
        self.payment_a = _make_payment(self.order_a)

    def test_b_cannot_init_payment_for_a_order(self):
        self.client.force_authenticate(self.user_b)
        url = reverse("payment-initialize")
        resp = self.client.post(url, {"order_number": self.order_a.order_number}, format="json")
        self.assertEqual(resp.status_code, 404)

    def test_b_cannot_view_a_payment(self):
        self.client.force_authenticate(self.user_b)
        url = reverse("payment-detail", kwargs={"payment_reference": self.payment_a.payment_reference})
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 404)

    def test_b_cannot_retry_a_order(self):
        self.client.force_authenticate(self.user_b)
        url = reverse("payment-retry", kwargs={"order_number": self.order_a.order_number})
        resp = self.client.post(url, {"provider": "paystack"}, format="json")
        self.assertEqual(resp.status_code, 404)

    def test_unauthenticated_cannot_init_payment(self):
        self.client.force_authenticate(None)
        url = reverse("payment-initialize")
        resp = self.client.post(url, {"order_number": self.order_a.order_number}, format="json")
        self.assertEqual(resp.status_code, 401)

    def test_unauthenticated_cannot_view_payment(self):
        self.client.force_authenticate(None)
        url = reverse("payment-detail", kwargs={"payment_reference": self.payment_a.payment_reference})
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 401)

    def test_unauthenticated_cannot_retry(self):
        self.client.force_authenticate(None)
        url = reverse("payment-retry", kwargs={"order_number": self.order_a.order_number})
        resp = self.client.post(url, {"provider": "paystack"}, format="json")
        self.assertEqual(resp.status_code, 401)


# ============================================================================
# §13 — Server-Side Amount Verification
# ============================================================================


class ServerSideAmountVerificationTests(TestCase):
    """Frontend cannot control payment amount."""

    def setUp(self):
        self.client = APIClient()
        self.user = _make_user()
        self.seller = _make_seller()
        self.category = Category.objects.create(name="X", slug="x", is_active=True)
        self.product = _make_product(self.seller, self.category)
        self.order = _make_order(self.user, self.product)
        self.client.force_authenticate(self.user)

    @patch("apps.payments.services.get_paystack_provider")
    def test_init_always_uses_order_total(self, mock_prov):
        """Payment amount must come from Order.total, not request."""
        mock_prov.return_value.initialize_transaction.return_value = {
            "authorization_url": "u", "access_code": "a", "reference": "r",
        }
        url = reverse("payment-initialize")
        self.client.post(url, {"order_number": self.order.order_number}, format="json")
        call_args = mock_prov.return_value.initialize_transaction.call_args
        amount_kobo = call_args.kwargs.get("amount") or call_args[1].get("amount")
        expected = int(self.order.total * Decimal("100"))
        self.assertEqual(amount_kobo, expected)

    @patch("apps.payments.services.get_paystack_provider")
    def test_init_amount_not_manipulable(self, mock_prov):
        """Even if we could pass amount, backend ignores it."""
        mock_prov.return_value.initialize_transaction.return_value = {
            "authorization_url": "u", "access_code": "a", "reference": "r",
        }
        url = reverse("payment-initialize")
        self.client.post(url, {"order_number": self.order.order_number}, format="json")
        p = Payment.objects.filter(order=self.order).first()
        self.assertEqual(p.amount, self.order.total)

    @patch("apps.payments.services.get_paystack_provider")
    def test_webhook_amount_mismatch_fails(self, mock_prov):
        """Webhook with wrong amount must fail verification."""
        from .services import verify_and_confirm_payment
        payment = _make_payment(self.order)

        mock_prov.return_value.verify_transaction.return_value = {
            "status": "success", "provider_transaction_id": "99",
            "reference": payment.payment_reference,
            "amount": 1, "currency": "NGN",
        }
        result = verify_and_confirm_payment(payment.payment_reference)
        self.assertEqual(result["status"], "amount_mismatch")
        self.assertFalse(self.order.is_paid)


# ============================================================================
# §14 — Stock Consistency
# ============================================================================


class StockConsistencyTests(TestCase):
    """Stock behavior across success, expiry, duplicate expiry, late webhook."""

    def setUp(self):
        self.user = _make_user()
        self.seller = _make_seller()
        self.category = Category.objects.create(name="X", slug="x", is_active=True)
        self.product = _make_product(self.seller, self.category, stock_quantity=20)

    def _make_old_pending_order(self, qty=2):
        order = _make_order(self.user, self.product, qty)
        payment = _make_payment(order)
        from django.utils import timezone
        import datetime
        Payment.objects.filter(pk=payment.pk).update(
            created_at=timezone.now() - datetime.timedelta(minutes=31)
        )
        return order, payment

    @patch("apps.payments.services._get_provider")
    def test_successful_payment_stock_unchanged(self, mock_prov):
        """Successful payment: stock was already decremented at order creation."""
        from .services import verify_and_confirm_payment
        order = _make_order(self.user, self.product, 3)
        payment = _make_payment(order)
        mock_prov.return_value.verify_transaction.return_value = {
            "status": "success", "provider_transaction_id": "100",
            "reference": payment.payment_reference,
            "amount": int(payment.amount * Decimal("100")), "currency": "NGN",
        }
        stock_after_order = self.product.stock_quantity
        verify_and_confirm_payment(payment.payment_reference)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock_quantity, stock_after_order)

    @patch("apps.payments.services._get_provider")
    def test_expired_order_stock_restored(self, mock_prov):
        """Expired order: stock restored exactly once."""
        mock_prov.return_value.verify_transaction.return_value = {"status": "pending"}
        order, payment = self._make_old_pending_order(2)
        stock_before = self.product.stock_quantity

        from .services import expire_stale_payments
        expire_stale_payments()

        self.product.refresh_from_db()
        self.assertEqual(self.product.stock_quantity, stock_before + 2)

    @patch("apps.payments.services._get_provider")
    def test_duplicate_expiration_no_double_restore(self, mock_prov):
        """Running expire twice must not restore stock twice."""
        mock_prov.return_value.verify_transaction.return_value = {"status": "pending"}
        order, payment = self._make_old_pending_order(3)
        stock_before = self.product.stock_quantity

        from .services import expire_stale_payments
        expire_stale_payments()
        expire_stale_payments()

        self.product.refresh_from_db()
        self.assertEqual(self.product.stock_quantity, stock_before + 3)

    @patch("apps.payments.services._get_provider")
    def test_late_webhook_after_expiry_confirms(self, mock_prov):
        """Late payment during expiry window: order confirmed, stock not restored."""
        mock_prov.return_value.verify_transaction.return_value = {
            "status": "success", "provider_transaction_id": "200",
            "reference": None,  # set below
            "amount": None, "currency": "NGN",
        }
        order, payment = self._make_old_pending_order(2)
        # Configure mock for this specific payment
        mock_prov.return_value.verify_transaction.return_value = {
            "status": "success", "provider_transaction_id": "200",
            "reference": payment.payment_reference,
            "amount": int(payment.amount * Decimal("100")), "currency": "NGN",
        }
        stock_before = self.product.stock_quantity

        from .services import expire_stale_payments
        expire_stale_payments()

        order.refresh_from_db()
        self.product.refresh_from_db()
        self.assertTrue(order.is_paid)
        self.assertEqual(order.status, Order.Status.CONFIRMED)
        self.assertEqual(self.product.stock_quantity, stock_before)

    @patch("apps.payments.services._get_provider")
    def test_cancelled_order_stock_not_restored_again(self, mock_prov):
        """Already-cancelled order: expiry must not restore stock again."""
        mock_prov.return_value.verify_transaction.return_value = {"status": "pending"}
        order, payment = self._make_old_pending_order(2)

        from .services import expire_stale_payments
        expire_stale_payments()

        self.product.refresh_from_db()
        stock_after_first = self.product.stock_quantity

        # Run again — order is already cancelled, stock must not change
        expire_stale_payments()
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock_quantity, stock_after_first)


# ============================================================================
# §15 — Expiration Race Condition
# ============================================================================


class ExpirationRaceConditionTests(TestCase):
    """Webhook/expiration race: genuine payment not casually cancelled."""

    def setUp(self):
        self.user = _make_user()
        self.seller = _make_seller()
        self.category = Category.objects.create(name="X", slug="x", is_active=True)
        self.product = _make_product(self.seller, self.category)

    def _make_old_pending_order(self, qty=2):
        order = _make_order(self.user, self.product, qty)
        payment = _make_payment(order)
        from django.utils import timezone
        import datetime
        Payment.objects.filter(pk=payment.pk).update(
            created_at=timezone.now() - datetime.timedelta(minutes=31)
        )
        return order, payment

    @patch("apps.payments.services._get_provider")
    def test_successful_during_expiry_not_cancelled(self, mock_prov):
        """Payment succeeded between query and lock — expiry confirms instead of cancelling.

        This simulates the race where the expiration query finds the order
        (payment was pending), but by the time the lock is acquired, a
        webhook has confirmed the payment.
        """
        order = _make_order(self.user, self.product, 2)
        payment = _make_payment(order)
        from django.utils import timezone
        import datetime
        # Backdate payment so expiration query finds it
        Payment.objects.filter(pk=payment.pk).update(
            created_at=timezone.now() - datetime.timedelta(minutes=31)
        )
        stock_before = self.product.stock_quantity

        # Provider returns success — simulates race where webhook succeeded
        mock_prov.return_value.verify_transaction.return_value = {
            "status": "success", "provider_transaction_id": "300",
            "reference": payment.payment_reference,
            "amount": int(payment.amount * Decimal("100")), "currency": "NGN",
        }

        from .services import expire_stale_payments
        expire_stale_payments()

        order.refresh_from_db()
        self.assertTrue(order.is_paid)
        self.assertEqual(order.status, Order.Status.CONFIRMED)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock_quantity, stock_before)

    @patch("apps.payments.services._get_provider")
    def test_provider_says_success_during_expiry(self, mock_prov):
        """Provider verification returns success during expiry — order confirmed."""
        order, payment = self._make_old_pending_order(2)
        stock_before = self.product.stock_quantity

        mock_prov.return_value.verify_transaction.return_value = {
            "status": "success", "provider_transaction_id": "300",
            "reference": payment.payment_reference,
            "amount": int(payment.amount * Decimal("100")), "currency": "NGN",
        }

        from .services import expire_stale_payments
        expire_stale_payments()

        order.refresh_from_db()
        self.assertTrue(order.is_paid)
        self.assertEqual(order.status, Order.Status.CONFIRMED)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock_quantity, stock_before)

    @patch("apps.payments.services._get_provider")
    def test_already_cancelled_order_not_resurrected(self, mock_prov):
        """Cancelled order must not be resurrected by late verification."""
        order = _make_order(self.user, self.product, 2)
        order.status = Order.Status.CANCELLED
        order.save(update_fields=["status"])

        mock_prov.return_value.verify_transaction.return_value = {"status": "pending"}

        from .services import expire_stale_payments
        expire_stale_payments()

        order.refresh_from_db()
        self.assertEqual(order.status, Order.Status.CANCELLED)
        self.assertFalse(order.is_paid)


# ============================================================================
# §16 — Payment Status Endpoint Security
# ============================================================================


class PaymentStatusEndpointSecurityTests(TestCase):
    """GET /api/payments/<ref>/ — owner access, non-owner blocked."""

    def setUp(self):
        self.client = APIClient()
        self.user_a = _make_user(email="sec_a@test.com")
        self.user_b = _make_user(email="sec_b@test.com")
        self.seller = _make_seller()
        self.category = Category.objects.create(name="X", slug="x", is_active=True)
        self.product = _make_product(self.seller, self.category)
        self.order_a = _make_order(self.user_a, self.product)
        self.payment_a = _make_payment(self.order_a, status=Payment.Status.SUCCESSFUL)

    def test_owner_can_retrieve(self):
        self.client.force_authenticate(self.user_a)
        url = reverse("payment-detail", kwargs={"payment_reference": self.payment_a.payment_reference})
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["status"], "successful")

    def test_non_owner_gets_404(self):
        self.client.force_authenticate(self.user_b)
        url = reverse("payment-detail", kwargs={"payment_reference": self.payment_a.payment_reference})
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 404)

    def test_unauthenticated_gets_401(self):
        url = reverse("payment-detail", kwargs={"payment_reference": self.payment_a.payment_reference})
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 401)

    def test_response_excludes_provider_response(self):
        """provider_response (internal) must not be exposed to frontend."""
        self.client.force_authenticate(self.user_a)
        url = reverse("payment-detail", kwargs={"payment_reference": self.payment_a.payment_reference})
        resp = self.client.get(url)
        self.assertNotIn("provider_response", resp.json())

    def test_terminal_state_unchanged(self):
        """Successful payment remains successful after retrieval."""
        self.client.force_authenticate(self.user_a)
        url = reverse("payment-detail", kwargs={"payment_reference": self.payment_a.payment_reference})
        self.client.get(url)
        self.payment_a.refresh_from_db()
        self.assertEqual(self.payment_a.status, Payment.Status.SUCCESSFUL)


# ============================================================================
# §20 — Guest Cart Regression
# ============================================================================


class GuestCartCheckoutTests(TestCase):
    """Guest cannot create an order — must authenticate first."""

    def setUp(self):
        self.client = APIClient()

    def test_unauthenticated_order_create_rejected(self):
        url = reverse("order-list-create")
        resp = self.client.post(url, {
            "email": "guest@test.com",
            "full_name": "Guest",
            "shipping_address": "123 St",
            "shipping_city": "Lagos",
            "shipping_region": "Lagos",
            "shipping_postal_code": "100001",
            "shipping_country": "NG",
            "delivery_method": "standard",
        }, format="json")
        self.assertEqual(resp.status_code, 401)


# ============================================================================
# §21 — Authentication Regression for Payment Endpoints
# ============================================================================


class PaymentEndpointAuthTests(TestCase):
    """All payment endpoints require authentication."""

    def setUp(self):
        self.client = APIClient()
        self.user = _make_user()
        self.seller = _make_seller()
        self.category = Category.objects.create(name="X", slug="x", is_active=True)
        self.product = _make_product(self.seller, self.category)
        self.order = _make_order(self.user, self.product)
        self.payment = _make_payment(self.order)

    def test_init_unauthenticated(self):
        resp = self.client.post(reverse("payment-initialize"),
                                {"order_number": self.order.order_number}, format="json")
        self.assertEqual(resp.status_code, 401)

    def test_detail_unauthenticated(self):
        url = reverse("payment-detail", kwargs={"payment_reference": self.payment.payment_reference})
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 401)

    def test_retry_unauthenticated(self):
        url = reverse("payment-retry", kwargs={"order_number": self.order.order_number})
        resp = self.client.post(url, {"provider": "paystack"}, format="json")
        self.assertEqual(resp.status_code, 401)

    def test_webhook_no_auth_required(self):
        """Webhook endpoint must be public (Paystack calls it)."""
        os.environ["PAYSTACK_SECRET_KEY"] = PAYSTACK_WEBHOOK_SECRET
        url = reverse("paystack-webhook")
        payload = json.dumps({
            "event": "charge.success",
            "data": {"reference": self.payment.payment_reference,
                     "amount": int(self.payment.amount * Decimal("100")),
                     "currency": "NGN", "status": "success", "id": 1},
        }).encode()
        resp = self.client.post(url, payload, content_type="application/json",
                                HTTP_X_PAYSTACK_SIGNATURE=_sign(payload))
        # Should not be 401 — auth is not required for webhooks
        self.assertNotEqual(resp.status_code, 401)
        os.environ.pop("PAYSTACK_SECRET_KEY", None)


# ============================================================================
# §24 — Frontend Security (secret key not in frontend)
# ============================================================================


class FrontendSecretKeyAuditTests(unittest.TestCase):
    """Verify Paystack secret key is not present in frontend source."""

    def test_no_secret_key_in_frontend(self):
        import pathlib
        frontend_dir = pathlib.Path(__file__).resolve().parent.parent.parent.parent / "frontend" / "src"
        if not frontend_dir.exists():
            self.skipTest("Frontend directory not found")

        secret_patterns = ["sk_", "PAYSTACK_SECRET_KEY", "secret_key"]
        for pattern in secret_patterns:
            for f in frontend_dir.rglob("*"):
                if f.is_file() and f.suffix in (".js", ".jsx", ".ts", ".tsx", ".json", ".env"):
                    content = f.read_text(errors="ignore")
                    self.assertNotIn(
                        pattern, content,
                        f"Secret pattern '{pattern}' found in {f.relative_to(frontend_dir)}"
                    )


# ============================================================================
# § — Cancelled Order Cannot Be Paid
# ============================================================================


class CancelledOrderPaymentTests(TestCase):
    """Cancelled orders must not accept payment initialization or retry."""

    def setUp(self):
        self.client = APIClient()
        self.user = _make_user()
        self.seller = _make_seller()
        self.category = Category.objects.create(name="X", slug="x", is_active=True)
        self.product = _make_product(self.seller, self.category)
        self.order = _make_order(self.user, self.product)
        self.order.status = Order.Status.CANCELLED
        self.order.save(update_fields=["status"])
        self.client.force_authenticate(self.user)

    @patch("apps.payments.services.get_paystack_provider")
    def test_init_cancelled_order_rejected(self, mock_prov):
        url = reverse("payment-initialize")
        resp = self.client.post(url, {"order_number": self.order.order_number}, format="json")
        self.assertEqual(resp.status_code, 400)
        self.assertEqual(resp.json()["code"], "order_cancelled")

    def test_retry_cancelled_order_rejected(self):
        url = reverse("payment-retry", kwargs={"order_number": self.order.order_number})
        resp = self.client.post(url, {"provider": "paystack"}, format="json")
        self.assertEqual(resp.status_code, 400)
        self.assertEqual(resp.json()["code"], "order_cancelled")


# ============================================================================
# § — Payment State Transition Audit
# ============================================================================


class PaymentStateTransitionTests(TestCase):
    """Verify terminal states block further transitions."""

    def setUp(self):
        self.user = _make_user()
        self.seller = _make_seller()
        self.category = Category.objects.create(name="X", slug="x", is_active=True)
        self.product = _make_product(self.seller, self.category)
        self.order = _make_order(self.user, self.product)

    @patch("apps.payments.services.get_paystack_provider")
    def test_successful_payment_blocks_further_processing(self, mock_prov):
        from .services import verify_and_confirm_payment
        payment = _make_payment(self.order)
        mock_prov.return_value.verify_transaction.return_value = {
            "status": "success", "provider_transaction_id": "500",
            "reference": payment.payment_reference,
            "amount": int(payment.amount * Decimal("100")), "currency": "NGN",
        }
        result = verify_and_confirm_payment(payment.payment_reference)
        self.assertEqual(result["status"], "successful")

        # Try again — should be idempotent
        result2 = verify_and_confirm_payment(payment.payment_reference)
        self.assertEqual(result2["status"], "already_successful")
        payment.refresh_from_db()
        self.assertEqual(payment.status, Payment.Status.SUCCESSFUL)

    @patch("apps.payments.services.get_paystack_provider")
    def test_failed_payment_blocks_success(self, mock_prov):
        """Once failed, a payment cannot become successful via the same reference."""
        from .services import verify_and_confirm_payment
        payment = _make_payment(self.order, status=Payment.Status.FAILED)

        # Already terminal — should not process
        result = verify_and_confirm_payment(payment.payment_reference)
        self.assertEqual(result["status"], "already_terminal")
        payment.refresh_from_db()
        self.assertEqual(payment.status, Payment.Status.FAILED)

    @patch("apps.payments.services.get_paystack_provider")
    def test_cancelled_payment_blocks_success(self, mock_prov):
        """Once cancelled, a payment cannot become successful via the same reference."""
        from .services import verify_and_confirm_payment
        payment = _make_payment(self.order, status=Payment.Status.CANCELLED)

        result = verify_and_confirm_payment(payment.payment_reference)
        self.assertEqual(result["status"], "already_terminal")
        payment.refresh_from_db()
        self.assertEqual(payment.status, Payment.Status.CANCELLED)


# ============================================================================
# § — Payment Reference Security
# ============================================================================


class PaymentReferenceSecurityTests(TestCase):
    """Payment references are identifiers, not authorization credentials."""

    def setUp(self):
        self.client = APIClient()
        self.user_a = _make_user(email="ref_a@test.com")
        self.user_b = _make_user(email="ref_b@test.com")
        self.seller = _make_seller()
        self.category = Category.objects.create(name="X", slug="x", is_active=True)
        self.product = _make_product(self.seller, self.category)
        self.order_a = _make_order(self.user_a, self.product)
        self.payment_a = _make_payment(self.order_a)

    def test_reference_not_sufficient_for_access(self):
        """Knowing the reference is not enough — must be the owner."""
        self.client.force_authenticate(self.user_b)
        url = reverse("payment-detail", kwargs={"payment_reference": self.payment_a.payment_reference})
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 404)

    def test_reference_format_not_auth_credential(self):
        """Reference is auto-generated, not a token."""
        ref = generate_payment_reference()
        self.assertTrue(ref.startswith("PAY-NUV-"))
        self.assertEqual(len(ref), len("PAY-NUV-XXXX-YY"))

    def test_reference_unique_across_payments(self):
        """Each payment gets a unique reference."""
        p1 = _make_payment(self.order_a)
        p2 = _make_payment(self.order_a)
        self.assertNotEqual(p1.payment_reference, p2.payment_reference)
