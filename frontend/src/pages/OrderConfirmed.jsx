import React, { useEffect, useState } from "react";
import { Link, useLocation, Navigate } from "react-router-dom";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import Badge from "../components/ui/Badge.jsx";
import { getLastOrder, formatDateRange, formatOrderDate } from "../lib/order.js";

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
        {order.items.map((item) => (
          <div key={item.id} className="flex items-start gap-4">
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-deep-surface">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-text-muted">
                  <span className="material-symbols text-4xl">image</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-label-sm text-label-sm text-text-primary">{item.name}</h3>
              <p className="mt-1 text-body-md text-text-muted">Qty: {item.quantity}</p>
              <p className="mt-1 font-semibold text-text-primary">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex justify-between text-body-md text-text-muted">
          <span>Subtotal</span>
          <span className="text-text-primary">${order.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-body-md text-text-muted">
          <span>Shipping</span>
          <span className="text-text-primary">
            {order.shipping === 0 ? "Complimentary" : `$${order.shipping.toFixed(2)}`}
          </span>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-outline-variant/20 pt-4">
        <span className="font-h4 text-h4 text-text-primary">Total</span>
        <span className="font-h3 text-h3 text-accent">${order.total.toFixed(2)}</span>
      </div>
    </Card>
  );
}

function ShippingCard({ order }) {
  const { shippingAddress, delivery, estimatedDelivery } = order;
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
          <p className="mt-2 font-semibold text-text-primary">{shippingAddress.fullName}</p>
          <p className="mt-1 text-body-md text-text-muted">{shippingAddress.address}</p>
          <p className="text-body-md text-text-muted">
            {shippingAddress.city}, {shippingAddress.region} {shippingAddress.postalCode}
          </p>
          <p className="text-body-md text-text-muted">{shippingAddress.country}</p>
        </div>
        <div>
          <p className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">
            Method
          </p>
          <p className="mt-2 font-semibold text-text-primary">{delivery.label}</p>
          <p className="mt-1 text-body-md text-text-muted">{delivery.description}</p>
          <p className="mt-3 flex items-center gap-2 text-body-md text-text-primary">
            <span className="material-symbols text-[18px] text-accent">event</span>
            {formatDateRange(estimatedDelivery.start, estimatedDelivery.end)}
          </p>
        </div>
      </div>
    </Card>
  );
}

export default function OrderConfirmed() {
  const location = useLocation();
  const [order] = useState(
    () => location.state?.order ?? getLastOrder()
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!order) {
    return <Navigate to="/marketplace" replace />;
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
            Your discovery is on its way.
          </h1>
          <p className="mx-auto max-w-xl font-body-lg text-body-lg text-text-muted">
            We've received your order and are preparing it for an atmospheric journey to
            your destination.
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
              value={`#${order.orderNumber}`}
              icon="receipt_long"
            />
            <OrderMeta
              label="Order Date"
              value={formatOrderDate(order.placedAt)}
              icon="calendar_month"
            />
            <OrderMeta
              label="Est. Arrival"
              value={formatDateRange(order.estimatedDelivery.start, order.estimatedDelivery.end)}
              icon="flight_land"
            />
          </div>
        </div>

        {/* Details */}
        <div className="mt-6 space-y-6 fade-rise" style={{ animationDelay: "0.45s" }}>
          <OrderSummary order={order} />
          <ShippingCard order={order} />

          <p className="flex items-center justify-center gap-2 text-body-md text-text-muted">
            <span className="material-symbols text-[18px] text-accent">lock</span>
            A confirmation has been sent to {order.shippingAddress.email || "your email"}.
          </p>
        </div>

        {/* Actions */}
        <div
          className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-center fade-rise"
          style={{ animationDelay: "0.6s" }}
        >
          <Link to="/track-order" className="w-full sm:w-auto">
            <Button size="lg" className="w-full px-8 py-4">
              <span className="material-symbols text-[18px]">track_changes</span>
              Track Order
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
