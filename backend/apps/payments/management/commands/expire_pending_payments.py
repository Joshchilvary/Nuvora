"""Expire pending payments and cancel unpaid orders.

Usage:
    python manage.py expire_pending_payments

Finds orders that are unpaid, in pending status, and whose oldest payment
attempt is older than PAYMENT_TIMEOUT_MINUTES (default 30).  For each:
verifies with the provider, restores stock if safe, and cancels the order.
"""

import logging

from django.core.management.base import BaseCommand

from apps.payments.services import expire_stale_payments

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Expire pending payments and cancel unpaid orders, restoring stock."

    def handle(self, *args, **options):
        cancelled = expire_stale_payments()
        if cancelled:
            self.stdout.write(
                self.style.SUCCESS(f"Expired {len(cancelled)} order(s): {', '.join(cancelled)}")
            )
        else:
            self.stdout.write("No orders to expire.")
