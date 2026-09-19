import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import Badge from "../components/ui/Badge.jsx";
import { getOrder } from "../services/api/order.js";
import { retryPayment, pollPaymentUntilTerminal } from "../services/api/payment.js";
import { openPaystackPopup } from "../services/paystack.js";

const STATUS_CONFIG = {
  pending: { label: "Pending", icon: "schedule", className: "bg-yellow-400/10 text-yellow-400 border-yellow-400/30" },
  confirmed: { label: "Confirmed", icon: "check_circle", className: "bg-blue-400/10 text-blue-400 border-blue-400/30" },
  processing: { label: "Processing", icon: "autorenew", className: "bg-blue-400/10 text-blue-400 border-blue-400/30" },
  shipped: { label: "Shipped", icon: "local_shipping", className: "bg-purple-400/10 text-purple-400 border-purple-400/30" },
  delivered: { label: "Delivered", icon: "check_circle", className: "bg-lime/10 text-accent border-lime/30" },
  cancelled: { label: "Cancelled", icon: "cancel", className: "bg-red-400/10 text-red-400 border-red-400/30" },
};

function formatMoney(value) {
  const num = Number(value);
  if (isNaN(num)) return "$0.00";
  return `$${num.toFixed(2)}`;
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function OrderStatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${cfg.className}`}>
      <span className="material-symbols text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
        {cfg.icon}
      </span>
      {cfg.label}
    </span>
  );
}

export default function OrderDetail() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    let cancelled = false;
    getOrder(orderNumber)
      .then((data) => {
        if (!cancelled) {
          setOrder(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message || "Failed to load order details.");
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [orderNumber]);

  const handleRetryPayment = async () => {
    setRetrying(true);
    setRetryError(null);
    try {
      const payment = await retryPayment(orderNumber);
      await openPaystackPopup({
        accessCode: payment.access_code,
        email: order.email,
      });
      const paymentStatus = await pollPaymentUntilTerminal(payment.payment_reference);
      if (paymentStatus?.status === "successful" || paymentStatus?.status === "completed") {
        setOrder((prev) => ({ ...prev, is_paid: true }));
      } else {
        setRetryError("Payment was not completed. Please try again.");
      }
    } catch (err) {
      if (err?.message !== "cancelled") {
        setRetryError(err?.message || "Payment failed. Please try again.");
      }
    } finally {
      setRetrying(false);
    }
  };

  const showPayButton = order && order.status === "pending" && !order.is_paid;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-lime border-t-transparent" />
        <p className="text-body-lg text-text-muted">Loading order details...</p>
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
        <div className="flex gap-3">
          <Link to="/customer/orders">
            <Button>Back to Orders</Button>
          </Link>
          <Link to="/marketplace">
            <Button variant="secondary">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full max-w-3xl mx-auto">
      {/* Back link */}
      <div className="mb-6">
        <Link
          to="/customer/orders"
          className="inline-flex items-center gap-1 font-label-sm text-label-sm text-text-muted hover:text-accent transition-colors"
        >
          <span className="material-symbols text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>
            arrow_back
          </span>
          Back to Orders
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-display text-h2 text-text-primary">#{order.order_number}</h1>
            <OrderStatusBadge status={order.status} />
            {order.is_paid === false && order.status === "pending" && (
              <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold bg-yellow-400/10 text-yellow-400 border-yellow-400/30">
                <span className="material-symbols text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>pending</span>
                Payment Pending
              </span>
            )}
          </div>
          <p className="text-sm text-text-muted mt-1">
            Placed on {formatDate(order.created_at)}
          </p>
        </div>
      </div>

      {/* Retry payment banner */}
      {showPayButton && (
        <div className="mb-6 rounded-2xl border border-yellow-400/30 bg-yellow-400/5 p-6">
          <div className="flex items-start gap-4">
            <span className="material-symbols mt-0.5 text-[22px] text-yellow-400">pending</span>
            <div className="flex-1">
              <h3 className="font-h4 text-h4 text-yellow-400">Payment Pending</h3>
              <p className="mt-1 text-body-md text-text-muted">
                Complete your payment to confirm this order. The order will be cancelled after 30 minutes.
              </p>
              {retryError && (
                <p className="mt-2 text-body-sm text-red-400">{retryError}</p>
              )}
            </div>
            <Button
              onClick={handleRetryPayment}
              disabled={retrying}
              className="px-6 py-3 shrink-0"
            >
              {retrying ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-obsidian border-t-transparent" />
                  Opening payment...
                </>
              ) : (
                <>
                  <span className="material-symbols text-[18px]">payment</span>
                  Complete Payment
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Items */}
      <Card className="p-6 mb-6">
        <h2 className="font-h3 text-h3 text-text-primary border-b border-outline-variant/20 pb-4 mb-4">
          Order Items
        </h2>
        <div className="space-y-4">
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
              <div className="flex-1 min-w-0">
                <h3 className="font-label-sm text-label-sm text-text-primary truncate">
                  {item.product_name}
                </h3>
                <p className="mt-1 text-body-md text-text-muted">
                  Qty: {item.quantity}
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  {formatMoney(item.unit_price)} each
                </p>
              </div>
              <p className="font-semibold text-text-primary shrink-0">
                {formatMoney(item.line_total)}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Financial Summary */}
      <Card className="p-6 mb-6">
        <h2 className="font-h3 text-h3 text-text-primary border-b border-outline-variant/20 pb-4 mb-4">
          Order Summary
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between text-body-md text-text-muted">
            <span>Subtotal</span>
            <span className="text-text-primary">{formatMoney(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-body-md text-text-muted">
            <span>Shipping</span>
            <span className="text-text-primary">
              {Number(order.shipping_cost) === 0 ? "Complimentary" : formatMoney(order.shipping_cost)}
            </span>
          </div>
          {Number(order.discount) > 0 && (
            <div className="flex justify-between text-body-md text-text-muted">
              <span>Discount</span>
              <span className="text-accent">-{formatMoney(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between items-center border-t border-outline-variant/20 pt-3">
            <span className="font-h4 text-h4 text-text-primary">Total</span>
            <span className="font-h3 text-h3 text-accent">{formatMoney(order.total)}</span>
          </div>
        </div>
      </Card>

      {/* Delivery & Shipping */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-4 mb-4">
            <span className="material-symbols text-accent">local_shipping</span>
            <h2 className="font-h3 text-h3 text-text-primary">Delivery</h2>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider">Method</p>
              <p className="font-semibold text-text-primary mt-1">
                {order.delivery_method === "express" ? "Express Delivery" : "Standard Delivery"}
              </p>
            </div>
            {order.delivery_description && (
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider">Description</p>
                <p className="text-body-md text-text-muted mt-1">{order.delivery_description}</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-4 mb-4">
            <span className="material-symbols text-accent">location_on</span>
            <h2 className="font-h3 text-h3 text-text-primary">Shipping</h2>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-text-primary">{order.full_name}</p>
            <p className="text-body-md text-text-muted">{order.shipping_address}</p>
            <p className="text-body-md text-text-muted">
              {order.shipping_city}, {order.shipping_region} {order.shipping_postal_code}
            </p>
            <p className="text-body-md text-text-muted">{order.shipping_country}</p>
            {order.email && (
              <p className="text-body-md text-text-muted mt-2">{order.email}</p>
            )}
            {order.phone_number && (
              <p className="text-body-md text-text-muted">{order.phone_number}</p>
            )}
          </div>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center mt-4 mb-8">
        <Link to="/marketplace" className="w-full sm:w-auto">
          <Button size="lg" className="w-full px-8 py-4">
            <span className="material-symbols text-[18px]">storefront</span>
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
}
