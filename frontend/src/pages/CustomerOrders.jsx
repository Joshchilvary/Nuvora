import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { CUSTOMER_ORDERS } from "../data/customerOrders.js";
import Button from "../components/ui/Button.jsx";

const STATUS_CONFIG = {
  processing: { label: "Processing", icon: "autorenew", className: "bg-blue-400/10 text-blue-400 border-blue-400/30" },
  shipped: { label: "Shipped", icon: "local_shipping", className: "bg-purple-400/10 text-purple-400 border-purple-400/30" },
  delivered: { label: "Delivered", icon: "check_circle", className: "bg-lime/10 text-accent border-lime/30" },
  cancelled: { label: "Cancelled", icon: "cancel", className: "bg-red-400/10 text-red-400 border-red-400/30" },
};

const STATUS_FILTERS = [
  { id: "all", label: "All" },
  { id: "processing", label: "Processing" },
  { id: "shipped", label: "Shipped" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
];

function formatPrice(price) {
  return `$${price.toFixed(2)}`;
}

function formatDate(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function OrderStatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.processing;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${cfg.className}`}>
      <span className="material-symbols text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
        {cfg.icon}
      </span>
      {cfg.label}
    </span>
  );
}

function SummaryCard({ label, value, icon }) {
  return (
    <div className="rounded-xl border border-outline-variant/20 bg-surface-container p-5 shadow-lg">
      <div className="flex items-center gap-2 mb-2">
        <span className="material-symbols text-sm text-text-muted" style={{ fontVariationSettings: "'FILL' 0" }}>
          {icon}
        </span>
        <p className="font-label-sm text-label-sm text-text-muted">{label}</p>
      </div>
      <p className="font-h3 text-h3 text-text-primary">{value}</p>
    </div>
  );
}

function OrderCard({ order }) {
  return (
    <div className="rounded-xl border border-outline-variant/20 bg-surface-container p-5 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <Link
            to={`/customer/orders/${order.id}`}
            className="font-label-sm text-label-sm text-accent hover:underline"
          >
            Order #{order.orderNumber}
          </Link>
          <p className="text-xs text-text-muted mt-0.5">{formatDate(order.date)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="space-y-3 mb-4">
        {order.items.map((item) => (
          <div key={`${order.id}-${item.productId}`} className="flex items-center gap-3">
            <Link to={`/product/${item.productId}`} className="shrink-0">
              <div className="h-12 w-12 rounded-lg overflow-hidden border border-outline-variant/30 bg-surface">
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
              </div>
            </Link>
            <div className="flex-1 min-w-0">
              <Link to={`/product/${item.productId}`} className="font-body-md text-body-md text-text-primary hover:text-accent truncate block">
                {item.name}
              </Link>
              <p className="text-xs text-text-muted">Qty: {item.quantity}</p>
            </div>
            <p className="font-body-md text-body-md text-text-primary shrink-0">
              {formatPrice(item.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-outline-variant/20 pt-4">
        <div>
          <span className="text-xs text-text-muted">{order.items.length} {order.items.length === 1 ? "item" : "items"}</span>
          <p className="font-h4 text-h4 text-text-primary">{formatPrice(order.total)}</p>
        </div>
        <div className="flex gap-2">
          <Link to={`/customer/orders/${order.id}`}>
            <Button type="button" variant="outline" size="sm">View Details</Button>
          </Link>
          {order.trackingAvailable ? (
            <Link to="/track-order">
              <Button type="button" size="sm">
                <span className="material-symbols text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
                Track
              </Button>
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function CustomerOrders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const stats = useMemo(() => ({
    total: CUSTOMER_ORDERS.length,
    processing: CUSTOMER_ORDERS.filter((o) => o.status === "processing").length,
    shipped: CUSTOMER_ORDERS.filter((o) => o.status === "shipped").length,
    delivered: CUSTOMER_ORDERS.filter((o) => o.status === "delivered").length,
  }), []);

  const filtered = useMemo(() => {
    let result = [...CUSTOMER_ORDERS];
    const query = searchQuery.toLowerCase().trim();
    if (query) {
      result = result.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(query) ||
          order.items.some((item) => item.name.toLowerCase().includes(query))
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((order) => order.status === statusFilter);
    }
    return result;
  }, [searchQuery, statusFilter]);

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-h2 text-text-primary">Your Orders</h1>
          <p className="font-body-md text-body-md text-text-muted mt-1">
            Track your purchases and revisit everything you've discovered on NUVORA.
          </p>
        </div>
        <Link to="/marketplace">
          <Button type="button">
            <span className="material-symbols text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>storefront</span>
            Continue Shopping
          </Button>
        </Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <SummaryCard label="Total Orders" value={stats.total} icon="receipt_long" />
        <SummaryCard label="Processing" value={stats.processing} icon="autorenew" />
        <SummaryCard label="Shipped" value={stats.shipped} icon="local_shipping" />
        <SummaryCard label="Delivered" value={stats.delivered} icon="check_circle" />
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <span
            className="material-symbols text-text-muted absolute left-3 top-1/2 -translate-y-1/2"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            search
          </span>
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-outline-variant/30 bg-surface-container px-10 py-2.5 font-body-md text-body-md text-text-primary placeholder-text-muted/60 focus:border-lime focus:outline-none"
            aria-label="Search orders"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setStatusFilter(filter.id)}
              className={`px-3 py-2 rounded-lg font-label-sm text-label-sm transition-all ${
                statusFilter === filter.id
                  ? "bg-lime text-obsidian"
                  : "bg-surface-high text-text-muted hover:text-text-primary"
              }`}
              aria-pressed={statusFilter === filter.id}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Order List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-surface-container">
            <span className="material-symbols text-4xl text-text-muted" style={{ fontVariationSettings: "'FILL' 0" }}>
              {searchQuery.trim() || statusFilter !== "all" ? "search_off" : "receipt_long"}
            </span>
          </div>
          <h3 className="font-display text-h3 text-text-primary mb-2">
            {searchQuery.trim() || statusFilter !== "all" ? "No orders found" : "No orders yet"}
          </h3>
          <p className="font-body-md text-body-md text-text-muted mb-6 max-w-md">
            {searchQuery.trim() || statusFilter !== "all"
              ? "Try another search or filter."
              : "Start discovering products and your purchases will appear here."}
          </p>
          {searchQuery.trim() || statusFilter !== "all" ? (
            <button
              type="button"
              onClick={clearFilters}
              className="font-label-sm text-label-sm text-accent hover:underline transition-colors"
            >
              Clear Filters
            </button>
          ) : (
            <Link to="/marketplace">
              <Button>Explore Marketplace</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
