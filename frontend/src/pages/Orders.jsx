import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button.jsx";
import { getOrders } from "../services/api/order.js";

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
    month: "short",
    day: "numeric",
    year: "numeric",
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

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getOrders()
      .then((data) => {
        if (!cancelled) {
          setOrders(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message || "Failed to load orders.");
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-lime border-t-transparent" />
        <p className="text-body-lg text-text-muted">Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
        <span className="material-symbols text-5xl text-text-muted">error_outline</span>
        <p className="text-body-lg text-text-muted">{error}</p>
        <div className="flex gap-3">
          <Button onClick={() => window.location.reload()}>Retry</Button>
          <Link to="/marketplace">
            <Button variant="secondary">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-h2 text-text-primary">My Orders</h1>
          <p className="font-body-md text-body-md text-text-muted mt-1">
            Track your purchases and revisit everything you've discovered on NUVORA.
          </p>
        </div>
        <Link to="/marketplace">
          <Button>
            <span className="material-symbols text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>storefront</span>
            Continue Shopping
          </Button>
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-surface-container">
            <span className="material-symbols text-4xl text-text-muted" style={{ fontVariationSettings: "'FILL' 0" }}>
              receipt_long
            </span>
          </div>
          <h3 className="font-display text-h3 text-text-primary mb-2">No orders yet</h3>
          <p className="font-body-md text-body-md text-text-muted mb-6 max-w-md">
            Your purchases will appear here once you place your first order.
          </p>
          <Link to="/marketplace">
            <Button>Start Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/customer/orders/${order.order_number}`}
              className="block rounded-xl border border-outline-variant/20 bg-surface p-5 shadow-sm transition-all hover:border-outline-variant/40 hover:shadow-md group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-label-sm text-label-sm text-accent font-semibold">
                      #{order.order_number}
                    </span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="text-xs text-text-muted mt-1">
                    {formatDate(order.created_at)}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-right">
                    <p className="text-xs text-text-muted">{order.item_count} {order.item_count === 1 ? "item" : "items"}</p>
                    <p className="font-h4 text-h4 text-text-primary">{formatMoney(order.total)}</p>
                  </div>
                  <span className="material-symbols text-text-muted group-hover:text-accent transition-colors">
                    arrow_forward
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
