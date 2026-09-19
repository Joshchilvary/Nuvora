"""Paystack payment provider integration."""

import hashlib
import hmac
import logging
import os

import requests
from requests.exceptions import RequestException

from .base import PaymentInitializationError, PaymentProvider, PaymentVerificationError

logger = logging.getLogger(__name__)

PAYSTACK_BASE_URL = "https://api.paystack.co"


class PaystackProvider(PaymentProvider):
    """Paystack transaction provider.

    All Paystack-specific HTTP logic is isolated here so that the rest of
    the application never imports requests or knows about Paystack's API.
    """

    def __init__(self):
        self._secret_key = os.environ.get("PAYSTACK_SECRET_KEY", "")
        self._callback_url = os.environ.get("PAYSTACK_CALLBACK_URL", "")

    @property
    def _headers(self):
        return {
            "Authorization": f"Bearer {self._secret_key}",
            "Content-Type": "application/json",
        }

    def initialize_transaction(self, amount, email, reference, callback_url=None, metadata=None):
        """Initialize a Paystack transaction.

        ``amount`` must already be converted to the currency's subunit
        (e.g. kobo for NGN).
        """
        payload = {
            "email": email,
            "amount": str(int(amount)),
            "reference": reference,
        }

        cb = callback_url or self._callback_url
        if cb:
            payload["callback_url"] = cb

        if metadata:
            payload["metadata"] = metadata

        try:
            resp = requests.post(
                f"{PAYSTACK_BASE_URL}/transaction/initialize",
                json=payload,
                headers=self._headers,
                timeout=15,
            )
            resp.raise_for_status()
        except RequestException as exc:
            logger.error("Paystack initialization request failed: %s", exc)
            raise PaymentInitializationError(
                f"Failed to initialize Paystack transaction: {exc}"
            ) from exc

        body = resp.json()

        if not body.get("status"):
            message = body.get("message", "Unknown Paystack error")
            logger.error("Paystack initialization rejected: %s", message)
            raise PaymentInitializationError(message)

        data = body.get("data", {})
        return {
            "authorization_url": data.get("authorization_url", ""),
            "access_code": data.get("access_code", ""),
            "reference": data.get("reference", reference),
        }

    def verify_transaction(self, reference):
        """Verify a Paystack transaction by reference."""
        try:
            resp = requests.get(
                f"{PAYSTACK_BASE_URL}/transaction/verify/{reference}",
                headers=self._headers,
                timeout=15,
            )
            resp.raise_for_status()
        except RequestException as exc:
            logger.error("Paystack verification request failed for %s: %s", reference, exc)
            raise PaymentVerificationError(
                f"Failed to verify Paystack transaction: {exc}"
            ) from exc

        body = resp.json()

        if not body.get("status"):
            message = body.get("message", "Verification failed")
            raise PaymentVerificationError(message)

        data = body.get("data", {})
        return {
            "status": data.get("status", ""),
            "provider_transaction_id": str(data.get("id", "")),
            "reference": data.get("reference", ""),
            "amount": data.get("amount", 0),
            "currency": data.get("currency", ""),
        }

    def verify_webhook_signature(self, raw_body, signature):
        """Verify Paystack's HMAC-SHA512 webhook signature."""
        if not self._secret_key:
            logger.warning("PAYSTACK_SECRET_KEY not set — webhook verification skipped")
            return False

        expected = hmac.new(
            self._secret_key.encode("utf-8"),
            raw_body,
            hashlib.sha512,
        ).hexdigest()

        return hmac.compare_digest(expected, signature or "")


def get_paystack_provider():
    """Return a configured PaystackProvider instance."""
    return PaystackProvider()
