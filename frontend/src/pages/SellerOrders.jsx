import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  SELLER_ORDERS,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
} from "../data/sellerOrders.js";
import Button from "../components/ui/Button.jsx";

const STATUS_FILTERS = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "processing", label: "Processing" },
  { id: "shipped", label: "Shipped" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "total-desc", label: "Total (High to Low)" },
  { value: "total-asc", label: "Total (Low to High)" },
];

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

function SummaryCard({ label, value, icon }) {
  return (
    <div className="rounded-xl border border-outline-variant/20 bg-surface-container p-5 shadow-lg">
      <div className="flex items-center gap-2 mb-2">
        <span
          className="material-symbols text-sm text-text-muted"
          style={{ fontVariationSettings: "'FILL' 0" }}
        >
          {icon}
        </span>
        <p className="font-label-sm text-label-sm text-text-muted">{label}</p>
      </div>
      <p className="font-h3 text-h3 text-text-primary">{value}</p>
    </div>
  );
}

function OrderTableRow({ order }) {
  return (
    <tr className="border-b border-outline-variant/10 hover:bg-surface-container-low/50 transition-colors">
      <td className="py-4">
        <Link
          to={`/seller/orders/${order.id}`}
          className="font-label-sm text-label-sm text-accent hover:underline"
        >
          #{order.id}
        </Link>
      </td>
      <td className="py-4">
        <p className="font-body-md text-body-md text-text-primary">{order.customer.name}</p>
        <p className="text-xs text-text-muted">{order.customer.email}</p>
      </td>
      <td className="py-4">
        <span className="font-body-md text-body-md text-text-muted">
          {order.items.length} {order.items.length === 1 ? "item" : "items"}
        </span>
      </td>
      <td className="py-4">
        <span className="font-body-md text-body-md text-text-primary">
          {formatPrice(order.total)}
        </span>
      </td>
      <td className="py-4">
        <span className="font-body-md text-body-md text-text-muted">
          {formatDate(order.date)}
        </span>
      </td>
      <td className="py-4">
        <OrderStatusBadge status={order.orderStatus} />
      </td>
      <td className="py-4 hidden lg:table-cell">
        <PaymentStatusBadge status={order.paymentStatus} />
      </td>
      <td className="py-4 whitespace-nowrap">
        <Link
          to={`/seller/orders/${order.id}`}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-outline-variant/30 bg-surface-high px-3 py-1.5 font-label-sm text-label-sm text-text-primary transition-colors hover:text-accent"
          aria-label={`View order ${order.id}`}
        >
          <span
            className="material-symbols text-sm"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            visibility
          </span>
          View
        </Link>
      </td>
    </tr>
  );
}

function OrderCard({ order }) {
  return (
    <div className="rounded-xl border border-outline-variant/20 bg-surface-container p-4 shadow-lg">
      <div className="flex justify-between items-start mb-3">
        <Link
          to={`/seller/orders/${order.id}`}
          className="font-label-sm text-label-sm text-accent hover:underline"
        >
          #{order.id}
        </Link>
        <OrderStatusBadge status={order.orderStatus} />
      </div>
      <p className="font-body-md text-body-md text-text-primary mb-1">{order.customer.name}</p>
      <p className="text-xs text-text-muted mb-3">{order.customer.email}</p>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <p className="font-label-sm text-label-sm text-text-muted">Items</p>
          <p className="font-body-md text-body-md text-text-primary">
            {order.items.length} {order.items.length === 1 ? "item" : "items"}
          </p>
        </div>
        <div>
          <p className="font-label-sm text-label-sm text-text-muted">Total</p>
          <p className="font-body-md text-body-md text-text-primary">{formatPrice(order.total)}</p>
        </div>
        <div>
          <p className="font-label-sm text-label-sm text-text-muted">Date</p>
          <p className="font-body-md text-body-md text-text-primary">{formatDate(order.date)}</p>
        </div>
        <div>
          <p className="font-label-sm text-label-sm text-text-muted">Payment</p>
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
      </div>
      <Link
        to={`/seller/orders/${order.id}`}
        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-outline-variant/30 bg-surface-high px-3 py-1.5 font-label-sm text-label-sm text-text-primary transition-colors hover:text-accent w-full"
        aria-label={`View order ${order.id}`}
      >
        <span
          className="material-symbols text-sm"
          style={{ fontVariationSettings: "'FILL' 0" }}
        >
          visibility
        </span>
        View Order
      </Link>
    </div>
  );
}

export default function SellerOrders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const stats = useMemo(() => {
    return {
      total: SELLER_ORDERS.length,
      pending: SELLER_ORDERS.filter((o) => o.orderStatus === "pending").length,
      processing: SELLER_ORDERS.filter((o) => o.orderStatus === "processing").length,
      shipped: SELLER_ORDERS.filter((o) => o.orderStatus === "shipped").length,
      delivered: SELLER_ORDERS.filter((o) => o.orderStatus === "delivered").length,
      cancelled: SELLER_ORDERS.filter((o) => o.orderStatus === "cancelled").length,
    };
  }, []);

  const filteredAndSorted = useMemo(() => {
    let result = [...SELLER_ORDERS];

    const query = searchQuery.toLowerCase().trim();
    if (query) {
      result = result.filter(
        (order) =>
          order.id.toLowerCase().includes(query) ||
          order.customer.name.toLowerCase().includes(query) ||
          order.items.some((item) => item.name.toLowerCase().includes(query))
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((order) => order.orderStatus === statusFilter);
    }

    const sortFns = {
      newest: (a, b) => new Date(b.date) - new Date(a.date),
      oldest: (a, b) => new Date(a.date) - new Date(b.date),
      "total-desc": (a, b) => b.total - a.total,
      "total-asc": (a, b) => a.total - b.total,
    };
    result.sort(sortFns[sortBy] || sortFns.newest);

    return result;
  }, [searchQuery, statusFilter, sortBy]);

  const hasActiveFilters = searchQuery.trim() || statusFilter !== "all";

  const clearAllFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setSortBy("newest");
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-h2 text-text-primary">Orders</h1>
          <p className="font-body-md text-body-md text-text-muted mt-1">
            Manage customer orders and track fulfillment.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mb-8">
        <SummaryCard label="Total Orders" value={stats.total} icon="receipt_long" />
        <SummaryCard label="Pending" value={stats.pending} icon="schedule" />
        <SummaryCard label="Processing" value={stats.processing} icon="autorenew" />
        <SummaryCard label="Shipped" value={stats.shipped} icon="local_shipping" />
        <SummaryCard label="Delivered" value={stats.delivered} icon="check_circle" />
        <SummaryCard label="Cancelled" value={stats.cancelled} icon="cancel" />
      </div>

      {/* Search + Filters + Sort */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch">
        <div className="relative flex-1">
          <span
            className="material-symbols text-text-muted absolute left-3 top-1/2 -translate-y-1/2"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            search
          </span>
          <input
            type="text"
            placeholder="Search by order ID, customer, or product..."
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
              className={`px-4 py-2 rounded-lg font-label-sm text-label-sm transition-all ${
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

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="rounded-lg border border-outline-variant/30 bg-surface-container px-3 py-2 font-body-md text-body-md text-text-primary focus:border-lime focus:outline-none"
          aria-label="Sort by"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Empty State */}
      {SELLER_ORDERS.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-surface-container">
            <span
              className="material-symbols text-4xl text-text-muted"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              receipt_long
            </span>
          </div>
          <h3 className="font-display text-h3 text-text-primary mb-2">No orders yet</h3>
          <p className="font-body-md text-body-md text-text-muted mb-6 max-w-md">
            When customers purchase products from your store, orders will appear here.
          </p>
          <Link to="/seller/inventory">
            <Button>Go to Inventory</Button>
          </Link>
        </div>
      ) : filteredAndSorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span
            className="material-symbols text-5xl text-text-muted mb-4"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            search_off
          </span>
          <h3 className="font-display text-h3 text-text-primary mb-2">No matching orders</h3>
          <p className="font-body-md text-body-md text-text-muted mb-6 max-w-md">
            Try adjusting your search or filter criteria.
          </p>
          <button
            type="button"
            onClick={clearAllFilters}
            className="font-label-sm text-label-sm text-accent hover:underline transition-colors"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-outline-variant/20">
                  <th className="text-left py-3 font-label-sm text-label-sm text-text-muted">
                    Order
                  </th>
                  <th className="text-left py-3 font-label-sm text-label-sm text-text-muted">
                    Customer
                  </th>
                  <th className="text-left py-3 font-label-sm text-label-sm text-text-muted">
                    Items
                  </th>
                  <th className="text-left py-3 font-label-sm text-label-sm text-text-muted">
                    Total
                  </th>
                  <th className="text-left py-3 font-label-sm text-label-sm text-text-muted">
                    Date
                  </th>
                  <th className="text-left py-3 font-label-sm text-label-sm text-text-muted">
                    Status
                  </th>
                  <th className="text-left py-3 font-label-sm text-label-sm text-text-muted hidden lg:table-cell">
                    Payment
                  </th>
                  <th className="text-left py-3 font-label-sm text-label-sm text-text-muted">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSorted.map((order) => (
                  <OrderTableRow key={order.id} order={order} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {filteredAndSorted.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
