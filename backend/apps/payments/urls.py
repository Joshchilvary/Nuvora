from django.urls import path

from .views import (
    PaymentDetailView,
    PaymentInitializeView,
    PaymentRetryView,
    PaystackWebhookView,
)

urlpatterns = [
    path(
        "payments/initialize/",
        PaymentInitializeView.as_view(),
        name="payment-initialize",
    ),
    path(
        "payments/<str:payment_reference>/",
        PaymentDetailView.as_view(),
        name="payment-detail",
    ),
    path(
        "payments/<str:order_number>/retry/",
        PaymentRetryView.as_view(),
        name="payment-retry",
    ),
    path(
        "payments/webhook/paystack/",
        PaystackWebhookView.as_view(),
        name="paystack-webhook",
    ),
]
