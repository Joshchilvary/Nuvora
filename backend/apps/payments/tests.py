"""
Comprehensive test suite for the NUVORA Payment system.
"""

import hashlib
import hmac
import json
import os
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


# --- Model Tests ---

class PaymentModelTests(TestCase):

    @classmethod
    def setUpTestData(cls):
        cls.user = _make_user()
        cls.seller = _make_seller()
        cls.category = Category.objects.create(name="X", slug="x", is_active=True)
        cls.product = _make_product(cls.seller, cls.category)
        cls.order = _make_order(cls.user, cls.product, 1)

    def test_payment_creation(self):
        payment = _make_payment(self.order)
        self.assertIsNotNone(payment.pk)
        self.assertEqual(payment.status, Payment.Status.PENDING)

    def test_payment_reference_unique(self):
        p1 = _make_payment(self.order)
        p2 = _make_payment(self.order)
        self.assertNotEqual(p1.payment_reference, p2.payment_reference)

    def test_payment_reference_format(self):
        ref = generate_payment_reference()
        self.assertTrue(ref.startswith("PAY-NUV-"))

    def test_payment_str(self):
        payment = _make_payment(self.order)
        self.assertIn(payment.payment_reference, str(payment))

    def test_order_relationship(self):
        payment = _make_payment(self.order)
        self.assertIn(payment, self.order.payments.all())

    def test_default_currency(self):
        payment = _make_payment(self.order)
        self.assertEqual(payment.currency, "NGN")

    def test_paid_at_null_by_default(self):
        payment = _make_payment(self.order)
        self.assertIsNone(payment.paid_at)


# --- Initialize Endpoint Tests ---

class PaymentInitializeTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = _make_user()
        self.seller = _make_seller()
        self.category = Category.objects.create(name="X", slug="x", is_active=True)
        self.product = _make_product(self.seller, self.category)
        self.order = _make_order(self.user, self.product, 2)
        self.url = reverse("payment-initialize")
        self.client.force_authenticate(self.user)

    @patch("apps.payments.services.get_paystack_provider")
    def test_creates_payment(self, mock_prov):
        mock_prov.return_value.initialize_transaction.return_value = {
            "authorization_url": "https://checkout.paystack.com/test",
            "access_code": "ac", "reference": "ref",
        }
        resp = self.client.post(self.url, {"order_number": self.order.order_number}, format="json")
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(Payment.objects.count(), 1)
        p = Payment.objects.first()
        self.assertEqual(p.amount, self.order.total)
        self.assertEqual(p.currency, "NGN")

    @patch("apps.payments.services.get_paystack_provider")
    def test_returns_auth_url(self, mock_prov):
        mock_prov.return_value.initialize_transaction.return_value = {
            "authorization_url": "https://checkout.paystack.com/test",
            "access_code": "ac", "reference": "ref",
        }
        resp = self.client.post(self.url, {"order_number": self.order.order_number}, format="json")
        data = resp.json()
        self.assertIn("authorization_url", data)
        self.assertIn("payment_reference", data)
        self.assertEqual(data["order_number"], self.order.order_number)

    def test_unauthenticated(self):
        self.client.force_authenticate(None)
        resp = self.client.post(self.url, {"order_number": self.order.order_number}, format="json")
        self.assertEqual(resp.status_code, 401)

    def test_other_user_order(self):
        other = _make_user(email="other@test.com")
        self.client.force_authenticate(other)
        resp = self.client.post(self.url, {"order_number": self.order.order_number}, format="json")
        self.assertEqual(resp.status_code, 404)

    def test_paid_order_rejected(self):
        self.order.is_paid = True
        self.order.save(update_fields=["is_paid"])
        resp = self.client.post(self.url, {"order_number": self.order.order_number}, format="json")
        self.assertEqual(resp.status_code, 400)
        self.assertEqual(resp.json()["code"], "order_already_paid")

    def test_cancelled_order_rejected(self):
        self.order.status = Order.Status.CANCELLED
        self.order.save(update_fields=["status"])
        resp = self.client.post(self.url, {"order_number": self.order.order_number}, format="json")
        self.assertEqual(resp.status_code, 400)
        self.assertEqual(resp.json()["code"], "order_cancelled")

    @patch("apps.payments.services.get_paystack_provider")
    def test_amount_from_order(self, mock_prov):
        mock_prov.return_value.initialize_transaction.return_value = {
            "authorization_url": "u", "access_code": "a", "reference": "r",
        }
        self.client.post(self.url, {"order_number": self.order.order_number}, format="json")
        p = Payment.objects.first()
        self.assertEqual(p.amount, self.order.total)

    @patch("apps.payments.services.get_paystack_provider")
    def test_kobo_conversion(self, mock_prov):
        mock_prov.return_value.initialize_transaction.return_value = {
            "authorization_url": "u", "access_code": "a", "reference": "r",
        }
        self.client.post(self.url, {"order_number": self.order.order_number}, format="json")
        call_args = mock_prov.return_value.initialize_transaction.call_args
        amount_kobo = call_args.kwargs.get("amount") or call_args[1].get("amount")
        expected = int(self.order.total * Decimal("100"))
        self.assertEqual(amount_kobo, expected)

    @patch("apps.payments.services.get_paystack_provider")
    def test_provider_failure(self, mock_prov):
        from .providers.base import PaymentInitializationError
        mock_prov.return_value.initialize_transaction.side_effect = PaymentInitializationError("down")
        resp = self.client.post(self.url, {"order_number": self.order.order_number}, format="json")
        self.assertEqual(resp.status_code, 502)
        self.assertEqual(Payment.objects.first().status, Payment.Status.FAILED)

    def test_missing_order_number(self):
        resp = self.client.post(self.url, {}, format="json")
        self.assertEqual(resp.status_code, 400)


# --- Detail Endpoint Tests ---

class PaymentDetailTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = _make_user()
        self.seller = _make_seller()
        self.category = Category.objects.create(name="X", slug="x", is_active=True)
        self.product = _make_product(self.seller, self.category)
        self.order = _make_order(self.user, self.product)
        self.payment = _make_payment(self.order)

    def test_owner_retrieve(self):
        self.client.force_authenticate(self.user)
        url = reverse("payment-detail", kwargs={"payment_reference": self.payment.payment_reference})
        self.assertEqual(self.client.get(url).status_code, 200)

    def test_other_user_404(self):
        other = _make_user(email="o@test.com")
        self.client.force_authenticate(other)
        url = reverse("payment-detail", kwargs={"payment_reference": self.payment.payment_reference})
        self.assertEqual(self.client.get(url).status_code, 404)

    def test_unauthenticated(self):
        url = reverse("payment-detail", kwargs={"payment_reference": self.payment.payment_reference})
        self.assertEqual(self.client.get(url).status_code, 401)


# --- Retry Endpoint Tests ---

class PaymentRetryTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = _make_user()
        self.seller = _make_seller()
        self.category = Category.objects.create(name="X", slug="x", is_active=True)
        self.product = _make_product(self.seller, self.category)
        self.order = _make_order(self.user, self.product)
        self.client.force_authenticate(self.user)

    @patch("apps.payments.services.get_paystack_provider")
    def test_retry_creates_new(self, mock_prov):
        mock_prov.return_value.initialize_transaction.return_value = {
            "authorization_url": "u", "access_code": "a", "reference": "r",
        }
        _make_payment(self.order, status=Payment.Status.FAILED)
        url = reverse("payment-retry", kwargs={"order_number": self.order.order_number})
        resp = self.client.post(url, {"provider": "paystack"}, format="json")
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(Payment.objects.filter(order=self.order).count(), 2)

    def test_retry_paid_rejected(self):
        self.order.is_paid = True
        self.order.save(update_fields=["is_paid"])
        url = reverse("payment-retry", kwargs={"order_number": self.order.order_number})
        resp = self.client.post(url, {"provider": "paystack"}, format="json")
        self.assertEqual(resp.status_code, 400)


# --- Webhook Tests ---

class PaystackWebhookTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        os.environ["PAYSTACK_SECRET_KEY"] = PAYSTACK_WEBHOOK_SECRET
        self.user = _make_user()
        self.seller = _make_seller()
        self.category = Category.objects.create(name="X", slug="x", is_active=True)
        self.product = _make_product(self.seller, self.category)
        self.order = _make_order(self.user, self.product)
        self.payment = _make_payment(self.order)
        self.url = reverse("paystack-webhook")

    def tearDown(self):
        os.environ.pop("PAYSTACK_SECRET_KEY", None)

    def _payload(self, ref=None, event="charge.success", amount=None):
        if amount is None:
            amount = int(self.payment.amount * Decimal("100"))
        return json.dumps({
            "event": event,
            "data": {"reference": ref or self.payment.payment_reference,
                     "amount": amount, "currency": "NGN", "status": "success", "id": 12345},
        }).encode()

    @patch("apps.payments.views.verify_and_confirm_payment")
    def test_valid_calls_verify(self, mock_v):
        mock_v.return_value = {"status": "successful"}
        payload = self._payload()
        resp = self.client.post(self.url, payload, content_type="application/json",
                                HTTP_X_PAYSTACK_SIGNATURE=_sign(payload))
        self.assertEqual(resp.status_code, 200)
        mock_v.assert_called_once_with(self.payment.payment_reference)

    def test_bad_sig(self):
        payload = self._payload()
        resp = self.client.post(self.url, payload, content_type="application/json",
                                HTTP_X_PAYSTACK_SIGNATURE="bad")
        self.assertEqual(resp.status_code, 400)

    def test_missing_sig(self):
        resp = self.client.post(self.url, self._payload(), content_type="application/json")
        self.assertEqual(resp.status_code, 400)

    @patch("apps.payments.views.verify_and_confirm_payment")
    def test_non_charge_event(self, mock_v):
        payload = self._payload(event="charge.failed")
        resp = self.client.post(self.url, payload, content_type="application/json",
                                HTTP_X_PAYSTACK_SIGNATURE=_sign(payload))
        self.assertEqual(resp.status_code, 200)
        mock_v.assert_not_called()

    @patch("apps.payments.views.verify_and_confirm_payment")
    def test_no_auth_required(self, mock_v):
        mock_v.return_value = {"status": "successful"}
        payload = self._payload()
        resp = self.client.post(self.url, payload, content_type="application/json",
                                HTTP_X_PAYSTACK_SIGNATURE=_sign(payload))
        self.assertEqual(resp.status_code, 200)


# --- Verify & Confirm Service Tests ---

class VerifyAndConfirmTests(TestCase):

    def setUp(self):
        self.user = _make_user()
        self.seller = _make_seller()
        self.category = Category.objects.create(name="X", slug="x", is_active=True)
        self.product = _make_product(self.seller, self.category)
        self.order = _make_order(self.user, self.product)
        self.payment = _make_payment(self.order)

    @patch("apps.payments.services.get_paystack_provider")
    def test_success(self, mock_prov):
        from .services import verify_and_confirm_payment
        mock_prov.return_value.verify_transaction.return_value = {
            "status": "success", "provider_transaction_id": "12345",
            "reference": self.payment.payment_reference,
            "amount": int(self.payment.amount * Decimal("100")), "currency": "NGN",
        }
        result = verify_and_confirm_payment(self.payment.payment_reference)
        self.assertEqual(result["status"], "successful")
        self.payment.refresh_from_db()
        self.order.refresh_from_db()
        self.assertEqual(self.payment.status, Payment.Status.SUCCESSFUL)
        self.assertTrue(self.order.is_paid)
        self.assertEqual(self.order.status, Order.Status.CONFIRMED)

    @patch("apps.payments.services.get_paystack_provider")
    def test_amount_mismatch(self, mock_prov):
        from .services import verify_and_confirm_payment
        mock_prov.return_value.verify_transaction.return_value = {
            "status": "success", "provider_transaction_id": "12345",
            "reference": self.payment.payment_reference,
            "amount": 999999, "currency": "NGN",
        }
        result = verify_and_confirm_payment(self.payment.payment_reference)
        self.assertEqual(result["status"], "amount_mismatch")
        self.payment.refresh_from_db()
        self.assertEqual(self.payment.status, Payment.Status.FAILED)
        self.assertFalse(self.order.is_paid)

    @patch("apps.payments.services.get_paystack_provider")
    def test_currency_mismatch(self, mock_prov):
        from .services import verify_and_confirm_payment
        mock_prov.return_value.verify_transaction.return_value = {
            "status": "success", "provider_transaction_id": "12345",
            "reference": self.payment.payment_reference,
            "amount": int(self.payment.amount * Decimal("100")), "currency": "USD",
        }
        result = verify_and_confirm_payment(self.payment.payment_reference)
        self.assertEqual(result["status"], "currency_mismatch")

    @patch("apps.payments.services.get_paystack_provider")
    def test_reference_mismatch(self, mock_prov):
        from .services import verify_and_confirm_payment
        mock_prov.return_value.verify_transaction.return_value = {
            "status": "success", "provider_transaction_id": "12345",
            "reference": "PAY-NUV-9999-ZZ",
            "amount": int(self.payment.amount * Decimal("100")), "currency": "NGN",
        }
        result = verify_and_confirm_payment(self.payment.payment_reference)
        self.assertEqual(result["status"], "reference_mismatch")

    @patch("apps.payments.services.get_paystack_provider")
    def test_provider_declined(self, mock_prov):
        from .services import verify_and_confirm_payment
        mock_prov.return_value.verify_transaction.return_value = {
            "status": "failed", "provider_transaction_id": "12345",
            "reference": self.payment.payment_reference,
            "amount": int(self.payment.amount * Decimal("100")), "currency": "NGN",
        }
        result = verify_and_confirm_payment(self.payment.payment_reference)
        self.assertEqual(result["status"], "provider_declined")
        self.assertEqual(Payment.objects.get(pk=self.payment.pk).status, Payment.Status.FAILED)

    @patch("apps.payments.services.get_paystack_provider")
    def test_already_successful_idempotent(self, mock_prov):
        from .services import verify_and_confirm_payment
        self.payment.status = Payment.Status.SUCCESSFUL
        self.payment.save(update_fields=["status"])
        result = verify_and_confirm_payment(self.payment.payment_reference)
        self.assertEqual(result["status"], "already_successful")
        mock_prov.return_value.verify_transaction.assert_not_called()

    @patch("apps.payments.services.get_paystack_provider")
    def test_order_already_paid_by_another(self, mock_prov):
        from .services import verify_and_confirm_payment
        p2 = _make_payment(self.order)
        self.order.is_paid = True
        self.order.status = Order.Status.CONFIRMED
        self.order.save(update_fields=["is_paid", "status"])
        mock_prov.return_value.verify_transaction.return_value = {
            "status": "success", "provider_transaction_id": "99999",
            "reference": p2.payment_reference,
            "amount": int(p2.amount * Decimal("100")), "currency": "NGN",
        }
        result = verify_and_confirm_payment(p2.payment_reference)
        self.assertEqual(result["status"], "order_already_paid")
        self.assertEqual(Payment.objects.get(pk=p2.pk).status, Payment.Status.FAILED)

    @patch("apps.payments.services.get_paystack_provider")
    def test_verification_error(self, mock_prov):
        from .services import verify_and_confirm_payment
        from .providers.base import PaymentVerificationError
        mock_prov.return_value.verify_transaction.side_effect = PaymentVerificationError("timeout")
        result = verify_and_confirm_payment(self.payment.payment_reference)
        self.assertEqual(result["status"], "verification_failed")


# --- Expiration Tests ---

class PaymentExpirationTests(TestCase):

    def setUp(self):
        self.user = _make_user()
        self.seller = _make_seller()
        self.category = Category.objects.create(name="X", slug="x", is_active=True)
        self.product = _make_product(self.seller, self.category)

    def _make_old_pending_order(self):
        order = _make_order(self.user, self.product, 2)
        payment = _make_payment(order)
        # Backdate the payment to simulate timeout
        Payment.objects.filter(pk=payment.pk).update(
            created_at=__import__("django.utils.timezone", fromlist=["now"]).now()
            - __import__("datetime", fromlist=["timedelta"]).timedelta(minutes=31)
        )
        return order, payment

    @patch("apps.payments.services._get_provider")
    def test_pending_order_expires(self, mock_prov):
        mock_prov.return_value.verify_transaction.return_value = {"status": "pending"}
        order, payment = self._make_old_pending_order()
        stock_before = self.product.stock_quantity

        from .services import expire_stale_payments
        expire_stale_payments()

        order.refresh_from_db()
        self.product.refresh_from_db()
        self.assertEqual(order.status, Order.Status.CANCELLED)
        self.assertEqual(self.product.stock_quantity, stock_before + 2)

    @patch("apps.payments.services._get_provider")
    def test_paid_order_not_cancelled(self, mock_prov):
        order, _ = self._make_old_pending_order()
        order.is_paid = True
        order.status = Order.Status.CONFIRMED
        order.save(update_fields=["is_paid", "status"])
        stock_before = self.product.stock_quantity

        from .services import expire_stale_payments
        expire_stale_payments()

        order.refresh_from_db()
        self.product.refresh_from_db()
        self.assertEqual(order.status, Order.Status.CONFIRMED)
        self.assertEqual(self.product.stock_quantity, stock_before)

    @patch("apps.payments.services._get_provider")
    def test_double_expiration_idempotent(self, mock_prov):
        mock_prov.return_value.verify_transaction.return_value = {"status": "pending"}
        order, payment = self._make_old_pending_order()
        stock_before = self.product.stock_quantity

        from .services import expire_stale_payments
        expire_stale_payments()
        expire_stale_payments()

        self.product.refresh_from_db()
        self.assertEqual(self.product.stock_quantity, stock_before + 2)

    @patch("apps.payments.services._get_provider")
    def test_late_webhook_confirms_instead(self, mock_prov):
        mock_prov.return_value.verify_transaction.return_value = {
            "status": "success",
        }
        order, payment = self._make_old_pending_order()
        # Set up the mock to return success for this payment's reference
        mock_prov.return_value.verify_transaction.return_value = {
            "status": "success", "provider_transaction_id": "9999",
            "reference": payment.payment_reference,
            "amount": int(payment.amount * Decimal("100")), "currency": "NGN",
        }

        from .services import expire_stale_payments
        expire_stale_payments()

        order.refresh_from_db()
        self.assertEqual(order.status, Order.Status.CONFIRMED)
        self.assertTrue(order.is_paid)


# --- Order is_paid Exposed ---

class OrderIsPaidExposedTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = _make_user()
        self.seller = _make_seller()
        self.category = Category.objects.create(name="X", slug="x", is_active=True)
        self.product = _make_product(self.seller, self.category)
        self.order = _make_order(self.user, self.product)

    def test_list_exposes_is_paid(self):
        self.client.force_authenticate(self.user)
        resp = self.client.get(reverse("order-list-create"))
        self.assertEqual(resp.status_code, 200)
        self.assertIn("is_paid", resp.json()[0])

    def test_detail_exposes_is_paid(self):
        self.client.force_authenticate(self.user)
        resp = self.client.get(reverse("order-detail", kwargs={"order_number": self.order.order_number}))
        self.assertIn("is_paid", resp.json())
