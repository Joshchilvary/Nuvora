import React, { useState, useMemo, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import {
  SELLER_ORDERS,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
} from "../data/sellerOrders.js";
import { PRODUCTS } from "../data/products.js";
import Button from "../components/ui/Button.jsx";

const TIMELINE_STAGES = [
  { key: "placed", label: "Order Placed", icon: "receipt" },
  { key: "payment", label: "Payment Confirmed", icon: "payments" },
  { key: "processing", label: "Processing", icon: "inventory_2" },
  { key: "shipped", label: "Shipped", icon: "local_shipping" },
  { key: "delivered", label: "Delivered", icon: "check_circle" },
];

const STATUS_FLOW = ["pending", "processing", "shipped", "delivered"];

function formatPrice(price) {
  return `$${price.toFixed(2)}`;
}

function formatDate(dateStr) {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(dateStr, hours) {
  const date = new Date(dateStr + "T00:00:00");
  const label = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${label} · ${hours}`;
}

function OrderStatusBadge({ status }) {
  const cfg = ORDER_STATUSES[status] ?? ORDER_STATUSES.pending;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${cfg.className}`}
    >
      <span
        className="material-symbols text-xs"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        {cfg.icon}
      </span>
      {cfg.label}
    </span>
  );
}

function PaymentStatusBadge({ status }) {
  const cfg = PAYMENT_STATUSES[status] ?? PAYMENT_STATUSES.pending;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${cfg.className}`}
    >
      <span
        className="material-symbols text-xs"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        {cfg.icon}
      </span>
      {cfg.label}
    </span>
  );
}

function getProductImage(productId) {
  const product = PRODUCTS.find((p) => p.id === productId);
  return product?.image ?? null;
}

function getTimelineTimestamp(order, stageKey) {
  const base = new Date(order.date + "T00:00:00");
  const offsets = { placed: 0, payment: 1, processing: 26, shipped: 52, delivered: 120 };
  const hours = (offsets[stageKey] ?? 0);
  const date = new Date(base.getTime() + hours * 3600000);
  const dateLabel = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const hourLabel = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${dateLabel} · ${hourLabel}`;
}

function ConfirmModal({ open, title, message, confirmLabel, onConfirm, onCancel, variant = "primary" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-obsidian/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-xl border border-outline-variant/20 bg-surface-container p-6 shadow-2xl">
        <h3 className="font-h4 text-h4 text-text-primary mb-2">{title}</h3>
        <p className="font-body-md text-body-md text-text-muted mb-6">{message}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" variant={variant} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function SellerOrderDetails() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(() =>
    SELLER_ORDERS.find((o) => o.id === orderId) ?? null
  );
  const [modalAction, setModalAction] = useState(null);

  const isNotFound = order === null;

  const subtotal = useMemo(
    () => order ? order.items.reduce((sum, item) => sum + item.price * item.quantity, 0) : 0,
    [order]
  );
  const shipping = useMemo(() => {
    if (!order) return 0;
    if (order.orderStatus === "cancelled") return 0;
    return order.total - subtotal;
  }, [order, subtotal]);

  const timelineStatus = order?.orderStatus === "cancelled" ? "cancelled" : order?.orderStatus;

  const getStageState = useCallback(
    (stageKey) => {
      if (order?.orderStatus === "cancelled") {
        return stageKey === "placed" ? "completed" : "cancelled";
      }
      const currentIndex = STATUS_FLOW.indexOf(order?.orderStatus ?? "pending");
      const stageIndex = STATUS_FLOW.indexOf(stageKey === "placed" || stageKey === "payment" ? "processing" : stageKey);
      const mappedStage = stageKey === "placed" || stageKey === "payment" ? currentIndex >= 1 : currentIndex >= stageIndex;
      if (stageKey === "payment") return currentIndex >= 1 ? "completed" : "upcoming";
      if (stageKey === "placed") return "completed";
      return mappedStage ? "completed" : "upcoming";
    },
    [order]
  );

  const handleStatusChange = (newStatus) => {
    setOrder((prev) => (prev ? { ...prev, orderStatus: newStatus } : prev));
    setModalAction(null);
  };

  const handleCancelOrder = () => {
    setOrder((prev) =>
      prev ? { ...prev, orderStatus: "cancelled", paymentStatus: prev.paymentStatus === "paid" ? "refunded" : prev.paymentStatus } : prev
    );
    setModalAction(null);
  };

  const availableActions = useMemo(() => {
    if (!order) return [];
    const actions = [];
    if (order.orderStatus === "pending") {
      actions.push({ key: "process", label: "Process Order", icon: "play_arrow", variant: "primary", next: "processing", confirm: false });
    }
    if (order.orderStatus === "processing") {
      actions.push({ key: "ship", label: "Mark as Shipped", icon: "local_shipping", variant: "primary", next: "shipped", confirm: true });
    }
    if (order.orderStatus === "shipped") {
      actions.push({ key: "deliver", label: "Mark as Delivered", icon: "check_circle", variant: "primary", next: "delivered", confirm: true });
    }
    if (["pending", "processing"].includes(order.orderStatus)) {
      actions.push({ key: "cancel", label: "Cancel Order", icon: "cancel", variant: "outline", next: "cancelled", confirm: true, destructive: true });
    }
    return actions;
  }, [order]);

  if (isNotFound) {
    return (
      <div className="flex flex-col min-h-full">
        <div className="mx-auto w-full max-w-2xl text-center py-16">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-surface-container mx-auto">
            <span
              className="material-symbols text-4xl text-text-muted"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              search_off
            </span>
          </div>
          <h1 className="font-display text-h2 text-text-primary mb-4">
            Order Not Found
          </h1>
          <p className="font-body-lg text-body-lg text-text-muted mb-8">
            The order you're looking for doesn't exist or may have been removed.
          </p>
          <Link to="/seller/orders">
            <Button>Back to Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Page Header */}
      <div className="mb-8">
        <Link
          to="/seller/orders"
          className="inline-flex items-center gap-2 text-text-muted hover:text-accent transition-colors mb-4"
        >
          <span
            className="material-symbols text-sm"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            arrow_back
          </span>
          <span className="font-label-sm text-label-sm">Back to Orders</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="font-display text-h2 text-text-primary">
              Order #{order.id}
            </h1>
            <p className="font-body-md text-body-md text-text-muted mt-1">
              Placed on {formatDate(order.date)}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <PaymentStatusBadge status={order.paymentStatus} />
            <OrderStatusBadge status={order.orderStatus} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Timeline */}
          <section className="glass-panel rounded-xl p-6 md:p-8 shadow-lg relative overflow-hidden">
            <div
              className="absolute top-0 right-0 h-64 w-64 bg-lime/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"
              aria-hidden="true"
            />
            <h2 className="font-h3 text-h3 text-text-primary mb-6 relative z-10">
              Order Timeline
            </h2>
            {order.orderStatus === "cancelled" ? (
              <div className="relative z-10 rounded-lg border border-red-400/30 bg-red-400/5 p-4 flex items-center gap-3">
                <span
                  className="material-symbols text-red-400"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  cancel
                </span>
                <div>
                  <p className="font-label-sm text-label-sm text-text-primary">Order Cancelled</p>
                  <p className="text-xs text-text-muted">This order has been cancelled and will not be fulfilled.</p>
                </div>
              </div>
            ) : (
              <div className="relative z-10">
                {/* Desktop: horizontal timeline */}
                <div className="hidden md:flex items-start justify-between">
                  {TIMELINE_STAGES.map((stage, idx) => {
                    const state = getStageState(stage.key);
                    const isActive = STATUS_FLOW[idx] === timelineStatus || (idx === 0 && timelineStatus) || (idx === 1 && STATUS_FLOW.indexOf(timelineStatus) >= 1);
                    return (
                      <div key={stage.key} className="flex flex-col items-center text-center flex-1 relative">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                            state === "completed"
                              ? "border-lime bg-lime/10 text-accent"
                              : "border-outline-variant/40 bg-surface-container text-text-muted"
                          }`}
                        >
                          <span
                            className="material-symbols text-[20px]"
                            style={{ fontVariationSettings: state === "completed" ? "'FILL' 1" : "'FILL' 0" }}
                          >
                            {stage.icon}
                          </span>
                        </div>
                        <p className={`mt-2 text-xs font-semibold ${state === "completed" ? "text-text-primary" : "text-text-muted"}`}>
                          {stage.label}
                        </p>
                        {state === "completed" && (
                          <p className="text-[10px] text-text-muted mt-0.5">
                            {getTimelineTimestamp(order, stage.key)}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
                {/* Mobile: vertical timeline */}
                <div className="md:hidden space-y-4">
                  {TIMELINE_STAGES.map((stage, idx) => {
                    const state = getStageState(stage.key);
                    const isLast = idx === TIMELINE_STAGES.length - 1;
                    return (
                      <div key={stage.key} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                              state === "completed"
                                ? "border-lime bg-lime/10 text-accent"
                                : "border-outline-variant/40 bg-surface-container text-text-muted"
                            }`}
                          >
                            <span
                              className="material-symbols text-[16px]"
                              style={{ fontVariationSettings: state === "completed" ? "'FILL' 1" : "'FILL' 0" }}
                            >
                              {stage.icon}
                            </span>
                          </div>
                          {!isLast ? (
                            <div className={`w-0.5 flex-1 mt-1 ${state === "completed" ? "bg-lime/40" : "bg-outline-variant/30"}`} />
                          ) : null}
                        </div>
                        <div className="pb-4">
                          <p className={`text-sm font-semibold ${state === "completed" ? "text-text-primary" : "text-text-muted"}`}>
                            {stage.label}
                          </p>
                          {state === "completed" && (
                            <p className="text-xs text-text-muted mt-0.5">
                              {getTimelineTimestamp(order, stage.key)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* Ordered Products */}
          <section className="glass-panel rounded-xl p-6 md:p-8 shadow-lg relative overflow-hidden">
            <div
              className="absolute top-0 right-0 h-64 w-64 bg-lime/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"
              aria-hidden="true"
            />
            <h2 className="font-h3 text-h3 text-text-primary mb-6 relative z-10">
              Ordered Products
            </h2>
            <div className="space-y-4 relative z-10">
              {order.items.map((item, idx) => {
                const image = getProductImage(item.productId);
                return (
                  <div
                    key={`${item.productId}-${idx}`}
                    className="flex gap-4 rounded-lg border border-outline-variant/20 bg-surface-container-low p-3"
                  >
                    <div className="h-16 w-16 shrink-0 rounded-md overflow-hidden border border-outline-variant/30 bg-surface">
                      {image ? (
                        <img src={image} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-text-muted">
                          <span className="material-symbols text-2xl">image</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-label-sm text-label-sm text-text-primary truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-label-sm text-label-sm text-text-primary">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">
                        {formatPrice(item.price)} each
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Customer & Shipping Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="glass-panel rounded-xl p-6 shadow-lg">
              <h2 className="font-h4 text-h4 text-text-primary mb-4">
                Customer Information
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="font-label-sm text-label-sm text-text-muted">Name</p>
                  <p className="font-body-md text-body-md text-text-primary">{order.customer.name}</p>
                </div>
                <div>
                  <p className="font-label-sm text-label-sm text-text-muted">Email</p>
                  <p className="font-body-md text-body-md text-text-primary">{order.customer.email}</p>
                </div>
              </div>
            </section>
            <section className="glass-panel rounded-xl p-6 shadow-lg">
              <h2 className="font-h4 text-h4 text-text-primary mb-4">
                Shipping Information
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="font-label-sm text-label-sm text-text-muted">Recipient</p>
                  <p className="font-body-md text-body-md text-text-primary">{order.customer.name}</p>
                </div>
                <div>
                  <p className="font-label-sm text-label-sm text-text-muted">Delivery Method</p>
                  <p className="font-body-md text-body-md text-text-primary">Standard Shipping</p>
                </div>
                {order.orderStatus === "shipped" || order.orderStatus === "delivered" ? (
                  <div>
                    <p className="font-label-sm text-label-sm text-text-muted">Tracking Number</p>
                    <p className="font-body-md text-body-md text-accent font-mono text-sm">
                      NV-{order.id.replace("NV-", "")}-TRK-{Math.floor(100000 + Math.random() * 900000)}
                    </p>
                  </div>
                ) : null}
              </div>
            </section>
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
          {/* Order Summary */}
          <section className="glass-panel rounded-xl p-6 shadow-lg lg:sticky lg:top-6">
            <h2 className="font-h4 text-h4 text-text-primary mb-4">
              Order Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-body-md text-body-md text-text-muted">Subtotal</span>
                <span className="font-body-md text-body-md text-text-primary">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-body-md text-body-md text-text-muted">Shipping</span>
                <span className="font-body-md text-body-md text-text-primary">
                  {shipping > 0 ? formatPrice(shipping) : order.orderStatus === "cancelled" ? "$0.00" : "Free"}
                </span>
              </div>
              {order.orderStatus === "cancelled" ? (
                <div className="flex justify-between text-red-400">
                  <span className="font-body-md text-body-md">Cancelled</span>
                  <span className="font-body-md text-body-md">—</span>
                </div>
              ) : null}
              <div className="border-t border-outline-variant/20 pt-3 flex justify-between">
                <span className="font-label-sm text-label-sm text-text-primary font-semibold">Total</span>
                <span className="font-h4 text-h4 text-text-primary">{formatPrice(order.total)}</span>
              </div>
            </div>
          </section>

          {/* Payment Info */}
          <section className="glass-panel rounded-xl p-6 shadow-lg">
            <h2 className="font-h4 text-h4 text-text-primary mb-4">
              Payment
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-label-sm text-label-sm text-text-muted">Status</span>
                <PaymentStatusBadge status={order.paymentStatus} />
              </div>
              <div>
                <p className="font-label-sm text-label-sm text-text-muted">Method</p>
                <p className="font-body-md text-body-md text-text-primary">Card ending in •••• 4242</p>
              </div>
            </div>
          </section>

          {/* Seller Actions */}
          {availableActions.length > 0 ? (
            <section className="glass-panel rounded-xl p-6 shadow-lg">
              <h2 className="font-h4 text-h4 text-text-primary mb-4">
                Actions
              </h2>
              <div className="space-y-3">
                {availableActions.map((action) => (
                  <Button
                    key={action.key}
                    type="button"
                    variant={action.variant}
                    className="w-full"
                    onClick={() => {
                      if (action.confirm) {
                        setModalAction(action);
                      } else {
                        handleStatusChange(action.next);
                      }
                    }}
                  >
                    <span
                      className="material-symbols text-sm"
                      style={{ fontVariationSettings: action.destructive ? "'FILL' 0" : "'FILL' 1" }}
                    >
                      {action.icon}
                    </span>
                    {action.label}
                  </Button>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        open={!!modalAction}
        title={
          modalAction?.key === "cancel"
            ? "Cancel Order"
            : modalAction?.key === "ship"
            ? "Mark as Shipped"
            : modalAction?.key === "deliver"
            ? "Mark as Delivered"
            : "Confirm Action"
        }
        message={
          modalAction?.key === "cancel"
            ? "Are you sure you want to cancel this order? This action cannot be undone."
            : modalAction?.key === "ship"
            ? "Mark this order as shipped? The customer will be notified."
            : modalAction?.key === "deliver"
            ? "Mark this order as delivered? This will complete the order."
            : "Are you sure you want to proceed?"
        }
        confirmLabel={modalAction?.label ?? "Confirm"}
        variant={modalAction?.destructive ? "outline" : "primary"}
        onConfirm={() => {
          if (modalAction?.key === "cancel") {
            handleCancelOrder();
          } else if (modalAction) {
            handleStatusChange(modalAction.next);
          }
        }}
        onCancel={() => setModalAction(null)}
      />
    </div>
  );
}
