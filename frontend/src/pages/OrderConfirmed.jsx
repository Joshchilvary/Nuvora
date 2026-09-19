import React, { useEffect, useState } from "react";
import { Link, useParams, Navigate, useLocation, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import Badge from "../components/ui/Badge.jsx";
import { getOrder } from "../services/api/order.js";
import { retryPayment, pollPaymentUntilTerminal } from "../services/api/payment.js";
import { openPaystackPopup } from "../services/paystack.js";

function formatOrderDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatMoney(value) {
  const num = Number(value);
  if (isNaN(num)) return "$0.00";
  return `$${num.toFixed(2)}`;
}

function SuccessIcon() {
  return (
    <div className="relative mx-auto mb-10 flex h-32 w-32 items-center justify-center fade-rise">
      <div className="absolute inset-0 rounded-full bg-lime/20 blur-2xl animate-pulse" />
      <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-lime/30 bg-surface-high shadow-[0_0_40px_rgba(184,243,74,0.18)]">
        <svg
          className="h-12 w-12 text-accent"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path
            className="confirm-check"
            d="M5 13l4 4L19 7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

function OrderMeta({ label, value, icon }) {
  return (
    <div className="flex items-start gap-3 text-left">
      <span className="material-symbols mt-0.5 text-[22px] text-accent">{icon}</span>
      <div>
        <p className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">
          {label}
        </p>
        <p className="mt-1 font-h4 text-h4 text-text-primary">{value}</p>
      </div>
    </div>
  );
}

function OrderSummary({ order }) {
  return (
    <Card className="p-6 lg:p-8">
      <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
        <h2 className="font-h3 text-h3 text-text-primary">Order Summary</h2>
        <Badge variant="lime">{order.items.length} items</Badge>
      </div>

      <div className="mt-6 space-y-4">
        {order.items.map((item, index) => (
          <div key={item.id || index} className="flex items-start gap-4">
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-deep-surface">
              {item.product_image ? (
                <img
                  src={item.product_image}
                  alt={item.product_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-text-muted">
                  <span className="material-symbols text-4xl">image</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-label-sm text-label-sm text-text-primary">
                {item.product_name}
              </h3>
              <p className="mt-1 text-body-md text-text-muted">
                Qty: {item.quantity}
              </p>
              <p className="mt-1 font-semibold text-text-primary">
                {formatMoney(item.line_total)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex justify-between text-body-md text-text-muted">
          <span>Subtotal</span>
          <span className="text-text-primary">{formatMoney(order.subtotal)}</span>
        </div>
        <div className="flex justify-between text-body-md text-text-muted">
          <span>Shipping</span>
          <span className="text-text-primary">
            {Number(order.shipping_cost) === 0
              ? "Complimentary"
              : formatMoney(order.shipping_cost)}
          </span>
        </div>
        {Number(order.discount) > 0 && (
          <div className="flex justify-between text-body-md text-text-muted">
            <span>Discount</span>
            <span className="text-accent">-{formatMoney(order.discount)}</span>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-outline-variant/20 pt-4">
        <span className="font-h4 text-h4 text-text-primary">Total</span>
        <span className="font-h3 text-h3 text-accent">{formatMoney(order.total)}</span>
      </div>
    </Card>
  );
}

function ShippingCard({ order }) {
  return (
    <Card className="p-6 lg:p-8">
      <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-4">
        <span className="material-symbols text-accent">local_shipping</span>
        <h2 className="font-h3 text-h3 text-text-primary">Delivery</h2>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <p className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">
            Ship To
          </p>
          <p className="mt-2 font-semibold text-text-primary">{order.full_name}</p>
          <p className="mt-1 text-body-md text-text-muted">{order.shipping_address}</p>
          <p className="text-body-md text-text-muted">
            {order.shipping_city}, {order.shipping_region} {order.shipping_postal_code}
          </p>
          <p className="text-body-md text-text-muted">{order.shipping_country}</p>
        </div>
        <div>
          <p className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">
            Method
          </p>
          <p className="mt-2 font-semibold text-text-primary">
            {order.delivery_method === "express" ? "Express Delivery" : "Standard Delivery"}
          </p>
          <p className="mt-1 text-body-md text-text-muted">
            {order.delivery_description || "5-7 business days"}
          </p>
        </div>
      </div>
    </Card>
  );
}

export default function OrderConfirmed() {
  const { orderNumber } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentPending, setPaymentPending] = useState(
    location.state?.paymentPending || false
  );
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    if (!orderNumber) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    getOrder(orderNumber)
      .then((data) => {
        if (!cancelled) {
          setOrder(data);
          if (data.is_paid === false) setPaymentPending(true);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message || "Failed to load order details.");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [orderNumber]);

  const handleRetryPayment = async () => {
    setRetrying(true);
    try {
      const payment = await retryPayment(orderNumber);
      await openPaystackPopup({
        accessCode: payment.access_code,
        email: order.email,
      });
      const paymentStatus = await pollPaymentUntilTerminal(payment.payment_reference);
      if (paymentStatus?.status === "successful" || paymentStatus?.status === "completed") {
        setPaymentPending(false);
        setOrder((prev) => ({ ...prev, is_paid: true }));
      }
    } catch (err) {
      if (err?.message !== "cancelled") {
        navigate(`/customer/orders/${orderNumber}`, {
          state: { retryError: err?.message || "Payment failed." },
        });
      }
    } finally {
      setRetrying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-lime border-t-transparent" />
        <p className="text-body-lg text-text-muted">Loading your order...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
        <span className="material-symbols text-5xl text-text-muted">receipt_long</span>
        <p className="text-body-lg text-text-muted">
          {error || "Order not found."}
        </p>
        <Link to="/marketplace">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      {/* Atmospheric background */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-lime/15 blur-3xl orb-float" />
        <div className="absolute bottom-1/4 right-1/4 h-[420px] w-[420px] rounded-full bg-sky-500/10 blur-3xl orb-float-slow" />
      </div>

      <div className="mx-auto w-full max-w-3xl px-6 py-16 md:px-8 md:py-24">
        {/* Success indicator */}
        <SuccessIcon />

        {/* Headline */}
        <div className="space-y-4 text-center fade-rise" style={{ animationDelay: "0.15s" }}>
          <h1 className="text-[40px] font-semibold leading-[48px] tracking-tight text-accent md:text-h1 md:leading-[64px]">
            {paymentPending
              ? "Your order is pending payment."
              : "Your discovery is on its way."}
          </h1>
          <p className="mx-auto max-w-xl font-body-lg text-body-lg text-text-muted">
            {paymentPending
              ? "Your order has been placed. Complete payment to confirm it."
              : "We've received your order and are preparing it for an atmospheric journey to your destination."}
          </p>
        </div>

        {/* Order meta glass panel */}
        <div
          className="relative mt-12 overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface/70 p-6 shadow-2xl backdrop-blur-xl fade-rise md:p-8"
          style={{ animationDelay: "0.3s" }}
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-lime/50 to-transparent" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <OrderMeta
              label="Order Reference"
              value={`#${order.order_number}`}
              icon="receipt_long"
            />
            <OrderMeta
              label="Order Date"
              value={formatOrderDate(order.created_at)}
              icon="calendar_month"
            />
            <OrderMeta
              label="Status"
              value={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              icon="info"
            />
          </div>
        </div>

        {/* Details */}
        <div className="mt-6 space-y-6 fade-rise" style={{ animationDelay: "0.45s" }}>
          <OrderSummary order={order} />
          <ShippingCard order={order} />

          <p className="flex items-center justify-center gap-2 text-body-md text-text-muted">
            <span className="material-symbols text-[18px] text-accent">lock</span>
            A confirmation has been sent to {order.email || "your email"}.
          </p>
        </div>

        {/* Payment pending banner */}
        {paymentPending && (
          <div className="mt-8 rounded-2xl border border-yellow-400/30 bg-yellow-400/5 p-6 text-center fade-rise" style={{ animationDelay: "0.45s" }}>
            <span className="material-symbols mb-2 text-4xl text-yellow-400">pending</span>
            <p className="text-body-lg font-semibold text-yellow-400">Payment Pending</p>
            <p className="mt-1 text-body-md text-text-muted">
              Your order has been reserved. Complete payment within 30 minutes or it may be automatically cancelled.
            </p>
            <Button
              onClick={handleRetryPayment}
              disabled={retrying}
              className="mt-4 px-8 py-3"
            >
              {retrying ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-obsidian border-t-transparent" />
                  Opening payment...
                </>
              ) : (
                <>
                  <span className="material-symbols text-[18px]">payment</span>
                  Complete Payment Now
                </>
              )}
            </Button>
          </div>
        )}

        {/* Actions */}
        <div
          className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-center fade-rise"
          style={{ animationDelay: "0.6s" }}
        >
          <Link to={`/customer/orders/${order.order_number}`} className="w-full sm:w-auto">
            <Button size="lg" className="w-full px-8 py-4">
              <span className="material-symbols text-[18px]">receipt_long</span>
              View Order Details
            </Button>
          </Link>
          <Link to="/marketplace" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full px-8 py-4">
              <span className="material-symbols text-[18px]">storefront</span>
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
