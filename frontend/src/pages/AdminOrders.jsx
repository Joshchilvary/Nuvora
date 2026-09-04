import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button.jsx";
import Badge from "../components/ui/Badge.jsx";
import {
  ADMIN_ORDERS,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  FULFILLMENT_STATUSES,
  ORDER_DATE_FILTERS,
  ORDER_PAGE_SIZE,
} from "../data/adminDashboard.js";

const ITEMS_PER_PAGE = ORDER_PAGE_SIZE;

function StatCard({ title, value, icon }) {
  return (
    <div className="glass-panel rounded-xl p-4 shadow-lg relative overflow-hidden">
      <div
        className="absolute top-0 right-0 h-40 w-40 bg-lime/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"
        aria-hidden="true"
      />
      <div className="relative z-10 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-high">
          <span className="material-symbols text-accent" style={{ fontVariationSettings: "'FILL' 0" }}>
            {icon}
          </span>
        </div>
        <div>
          <p className="font-label-sm text-label-sm text-text-muted">{title}</p>
          <p className="font-h3 text-h3 text-text-primary">{value}</p>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ open, title, message, confirmLabel, onConfirm, onCancel, danger = false, children }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="absolute inset-0 bg-obsidian/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-xl border border-outline-variant/20 bg-surface-container p-6 shadow-2xl">
        <h3 className="font-h4 text-h4 text-text-primary mb-2">{title}</h3>
        <p className="font-body-md text-body-md text-text-muted mb-4">{message}</p>
        {children}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" variant={danger ? "primary" : "primary"} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

function OrderDetailsModal({ order, onClose, onUpdateStatus, onCancelOrder, onRefundOrder }) {
  if (!order) return null;
  const [actionType, setActionType] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  const nextStatuses = {
    Pending: ["Processing"],
    Processing: ["Shipped"],
    Shipped: ["Delivered"],
    Delivered: [],
    Cancelled: [],
    Refunded: [],
  };

  const availableNext = nextStatuses[order.status] || [];

  const handleStatusUpdate = () => {
    if (!newStatus) return;
    onUpdateStatus(order, newStatus);
    setNewStatus("");
    setActionType(null);
  };

  const timelineLabels = ["Order Placed", "Payment Confirmed", "Processing", "Shipped", "Delivered"];
  const currentStep = timelineLabels.findIndex((label) => order.timeline.find((t) => t.label === label && !t.done));
  const effectiveStep = currentStep === -1 ? timelineLabels.length : currentStep;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Order Details"
    >
      <div className="absolute inset-0 bg-obsidian/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-xl border border-outline-variant/20 bg-surface-container p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-h4 text-h4 text-text-primary">Order {order.id}</h3>
            <p className="font-body-md text-sm text-text-muted">
              {new Date(order.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:text-text-primary transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols" style={{ fontVariationSettings: "'FILL' 0" }}>close</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <Badge variant={order.status === "Delivered" ? "success" : order.status === "Shipped" ? "lime" : order.status === "Processing" ? "neutral" : order.status === "Cancelled" || order.status === "Refunded" ? "default" : "neutral"}>{order.status}</Badge>
          <Badge variant={order.paymentStatus === "Paid" ? "success" : order.paymentStatus === "Pending" ? "neutral" : "default"}>{order.paymentStatus}</Badge>
        </div>

        <div className="mb-6">
          <h4 className="font-label-sm text-label-sm text-text-primary mb-3">Customer</h4>
          <div className="flex items-center gap-3 rounded-lg border border-outline-variant/20 bg-surface-container-high p-3">
            <div className="h-10 w-10 shrink-0 rounded-full overflow-hidden border border-outline-variant/30">
              <img src={order.customer.avatar} alt={order.customer.name} className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="font-label-sm text-label-sm text-text-primary">{order.customer.name}</p>
              <p className="font-body-md text-xs text-text-muted">{order.customer.email}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="font-label-sm text-label-sm text-text-primary mb-3">Seller</h4>
          <div className="rounded-lg border border-outline-variant/20 bg-surface-container-high p-3">
            <p className="font-label-sm text-label-sm text-text-primary">{order.seller.name}</p>
            <p className="font-body-md text-xs text-text-muted">{order.seller.owner} · {order.seller.status}</p>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="font-label-sm text-label-sm text-text-primary mb-3">Order Items</h4>
          <div className="space-y-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 rounded-lg border border-outline-variant/20 bg-surface-container-high p-3">
                <div className="h-12 w-12 shrink-0 rounded-lg overflow-hidden border border-outline-variant/20">
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-label-sm text-label-sm text-text-primary truncate">{item.name}</p>
                  <p className="font-body-md text-xs text-text-muted">Qty: {item.qty}</p>
                </div>
                <p className="font-body-md text-sm text-text-primary">₦{item.total.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h4 className="font-label-sm text-label-sm text-text-primary mb-3">Payment Summary</h4>
          <div className="rounded-lg border border-outline-variant/20 bg-surface-container-high p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-body-md text-sm text-text-muted">Subtotal</span>
              <span className="font-body-md text-sm text-text-primary">₦{order.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-body-md text-sm text-text-muted">Shipping</span>
              <span className="font-body-md text-sm text-text-primary">₦{order.shipping.toLocaleString()}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex items-center justify-between">
                <span className="font-body-md text-sm text-text-muted">Discount</span>
                <span className="font-body-md text-sm text-accent">-₦{order.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="font-body-md text-sm text-text-muted">Tax</span>
              <span className="font-body-md text-sm text-text-primary">₦{order.tax.toLocaleString()}</span>
            </div>
            <div className="border-t border-outline-variant/20 pt-2 flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-text-primary">Total</span>
              <span className="font-h4 text-h4 text-text-primary">₦{order.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="font-label-sm text-label-sm text-text-primary mb-3">Shipping</h4>
          <div className="rounded-lg border border-outline-variant/20 bg-surface-container-high p-3 space-y-1">
            <p className="font-body-md text-sm text-text-primary">{order.shippingAddress.recipient}</p>
            <p className="font-body-md text-xs text-text-muted">{order.shippingAddress.address}</p>
            <p className="font-body-md text-xs text-text-muted">{order.shippingAddress.city}, {order.shippingAddress.region} {order.shippingAddress.postalCode}</p>
            <p className="font-body-md text-xs text-text-muted">{order.shippingAddress.method}</p>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="font-label-sm text-label-sm text-text-primary mb-3">Order Timeline</h4>
          <div className="space-y-3">
            {order.timeline.map((step, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${step.done ? "border-lime bg-lime/10" : "border-outline-variant/30 bg-surface-high"}`}>
                  <span className={`material-symbols text-sm ${step.done ? "text-accent" : "text-text-muted"}`} style={{ fontVariationSettings: step.done ? "'FILL' 1" : "'FILL' 0" }}>
                    {step.done ? "check" : "circle"}
                  </span>
                </div>
                <div className="flex-1">
                  <p className={`font-label-sm text-label-sm ${step.done ? "text-text-primary" : "text-text-muted"}`}>{step.label}</p>
                  {step.date && <p className="font-body-md text-xs text-text-muted">{step.date}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {availableNext.length > 0 && (
            <div className="flex-1 space-y-2">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="block w-full rounded-lg bg-surface-container-high border border-outline-variant/30 px-4 py-2.5 font-body-md text-text-primary outline-none transition-all focus:border-lime"
              >
                <option value="">Update Status...</option>
                {availableNext.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <Button type="button" onClick={handleStatusUpdate} disabled={!newStatus} className="w-full">Update Order Status</Button>
            </div>
          )}
          {order.status !== "Cancelled" && order.status !== "Refunded" && (
            <Button type="button" variant="outline" onClick={() => { setActionType("cancel"); }} className="flex-1 text-red-400 border-red-400/30 hover:bg-red-400/10">
              Cancel Order
            </Button>
          )}
          {order.paymentStatus === "Paid" && order.status !== "Refunded" && (
            <Button type="button" variant="outline" onClick={() => { setActionType("refund"); }} className="flex-1">
              Refund Order
            </Button>
          )}
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Close</Button>
        </div>

        <ConfirmModal
          open={actionType === "cancel"}
          title="Cancel this order?"
          message={`Are you sure you want to cancel order ${order.id}? This action cannot be undone.`}
          confirmLabel="Cancel Order"
          danger
          onConfirm={() => { onCancelOrder(order); setActionType(null); }}
          onCancel={() => setActionType(null)}
        />
        <ConfirmModal
          open={actionType === "refund"}
          title="Refund this order?"
          message={`Are you sure you want to mark order ${order.id} as refunded? This is a mock frontend action only.`}
          confirmLabel="Refund Order"
          onConfirm={() => { onRefundOrder(order); setActionType(null); }}
          onCancel={() => setActionType(null)}
        />
      </div>
    </div>
  );
}

function MobileOrderCard({ order, isSelected, onToggleSelect, onViewDetails, onCancelOrder, onRefundOrder }) {
  return (
    <div className="rounded-xl border border-outline-variant/20 bg-surface-container p-4 shadow-lg mb-4">
      <div className="flex items-start gap-3 mb-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="mt-1 h-4 w-4 rounded border-outline-variant/30 bg-surface-container-high text-lime focus:ring-lime"
          aria-label={`Select order ${order.id}`}
        />
        <div className="flex-1 min-w-0">
          <p className="font-label-sm text-label-sm text-text-primary">{order.id}</p>
          <p className="font-body-md text-xs text-text-muted">{order.customer.name}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        <Badge variant={order.status === "Delivered" ? "success" : order.status === "Shipped" ? "lime" : order.status === "Cancelled" || order.status === "Refunded" ? "default" : "neutral"}>{order.status}</Badge>
        <Badge variant={order.paymentStatus === "Paid" ? "success" : order.paymentStatus === "Pending" ? "neutral" : "default"}>{order.paymentStatus}</Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => onViewDetails(order)} className="font-label-sm text-label-sm text-accent hover:text-accent/80 transition-colors">View</button>
        {order.status !== "Cancelled" && order.status !== "Refunded" && order.status !== "Delivered" && (
          <button type="button" onClick={() => onViewDetails(order)} className="font-label-sm text-label-sm text-red-400 hover:text-red-300 transition-colors">Cancel</button>
        )}
        {order.paymentStatus === "Paid" && order.status !== "Refunded" && (
          <button type="button" onClick={() => onViewDetails(order)} className="font-label-sm text-label-sm text-text-muted hover:text-text-primary transition-colors">Refund</button>
        )}
      </div>
    </div>
  );
}

export default function AdminOrders() {
  const [orders, setOrders] = useState(ADMIN_ORDERS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [fulfillmentFilter, setFulfillmentFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [detailsOrder, setDetailsOrder] = useState(null);
  const [bulkAction, setBulkAction] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const term = search.trim().toLowerCase();
      if (term) {
        const match =
          order.id.toLowerCase().includes(term) ||
          order.customer.name.toLowerCase().includes(term) ||
          order.customer.email.toLowerCase().includes(term) ||
          order.seller.name.toLowerCase().includes(term);
        if (!match) return false;
      }
      if (statusFilter !== "all") {
        const statusMap = { pending: "Pending", processing: "Processing", shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled", refunded: "Refunded" };
        if (order.status !== statusMap[statusFilter]) return false;
      }
      if (paymentFilter !== "all") {
        const paymentMap = { paid: "Paid", pending: "Pending", failed: "Failed", refunded: "Refunded" };
        if (order.paymentStatus !== paymentMap[paymentFilter]) return false;
      }
      if (fulfillmentFilter !== "all") {
        const fulfillmentMap = { unfulfilled: "Unfulfilled", processing: "Processing", shipped: "Shipped", delivered: "Delivered" };
        if (order.fulfillment !== fulfillmentMap[fulfillmentFilter]) return false;
      }
      if (dateFilter !== "all") {
        const orderDate = new Date(order.date);
        const now = new Date();
        if (dateFilter === "today") {
          if (orderDate.toDateString() !== now.toDateString()) return false;
        } else if (dateFilter === "7d") {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          if (orderDate < weekAgo) return false;
        } else if (dateFilter === "30d") {
          const monthAgo = new Date();
          monthAgo.setDate(monthAgo.getDate() - 30);
          if (orderDate < monthAgo) return false;
        }
      }
      return true;
    });
  }, [orders, search, statusFilter, paymentFilter, fulfillmentFilter, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedOrders = filteredOrders.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const allSelected = paginatedOrders.length > 0 && paginatedOrders.every((o) => selectedIds.includes(o.id));
  const someSelected = paginatedOrders.some((o) => selectedIds.includes(o.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !paginatedOrders.some((o) => o.id === id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...paginatedOrders.map((o) => o.id)])]);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleUpdateStatus = (order, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== order.id) return o;
        const timeline = o.timeline.map((t) => {
          if (t.label === newStatus && !t.done) {
            return { ...t, done: true, date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) };
          }
          return t;
        });
        return { ...o, status: newStatus, fulfillment: newStatus === "Delivered" ? "Delivered" : newStatus === "Shipped" ? "Shipped" : newStatus === "Processing" ? "Processing" : o.fulfillment, timeline };
      })
    );
    setDetailsOrder(null);
    showToast(`Order ${order.id} updated to ${newStatus}.`);
  };

  const handleCancelOrder = (order) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== order.id) return o;
        return { ...o, status: "Cancelled", fulfillment: "Unfulfilled", paymentStatus: "Refunded" };
      })
    );
    setDetailsOrder(null);
    showToast(`Order ${order.id} cancelled.`);
  };

  const handleRefundOrder = (order) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== order.id) return o;
        return { ...o, status: "Refunded", paymentStatus: "Refunded" };
      })
    );
    setDetailsOrder(null);
    showToast(`Order ${order.id} refunded.`);
  };

  const handleBulkMarkProcessing = () => {
    setBulkAction({ type: "processing" });
  };

  const handleBulkMarkShipped = () => {
    setBulkAction({ type: "shipped" });
  };

  const confirmBulkAction = () => {
    if (!bulkAction) return;
    setOrders((prev) =>
      prev.map((o) => {
        if (!selectedIds.includes(o.id)) return o;
        const status = bulkAction.type === "processing" ? "Processing" : "Shipped";
        const timeline = o.timeline.map((t) => {
          if (t.label === status && !t.done) {
            return { ...t, done: true, date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) };
          }
          return t;
        });
        return { ...o, status, fulfillment: status, timeline };
      })
    );
    const label = bulkAction.type === "processing" ? "marked as Processing" : "marked as Shipped";
    showToast(`${selectedIds.length} order(s) ${label}.`);
    setSelectedIds([]);
    setBulkAction(null);
  };

  const exportCSV = () => {
    const dataToExport = selectedIds.length > 0 ? orders.filter((o) => selectedIds.includes(o.id)) : filteredOrders;
    if (!dataToExport.length) return;
    const header = "Order ID,Customer,Email,Seller,Items,Amount,Payment,Status,Date\n";
    const rows = dataToExport
      .map((o) => `${o.id},"${o.customer.name}",${o.customer.email},${o.seller.name},${o.items.length},${o.total},${o.paymentStatus},${o.status},${o.date}`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nuvora-orders.csv";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Orders exported successfully.");
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setPaymentFilter("all");
    setFulfillmentFilter("all");
    setDateFilter("all");
    setCurrentPage(1);
  };

  const overview = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "Pending").length,
    processing: orders.filter((o) => o.status === "Processing").length,
    shipped: orders.filter((o) => o.status === "Shipped").length,
    delivered: orders.filter((o) => o.status === "Delivered").length,
    cancelled: orders.filter((o) => o.status === "Cancelled" || o.status === "Refunded").length,
  };

  const statusBadgeVariant = (status) => {
    switch (status) {
      case "Delivered": return "success";
      case "Shipped": return "lime";
      case "Processing": return "neutral";
      case "Pending": return "neutral";
      case "Cancelled": return "default";
      case "Refunded": return "default";
      default: return "default";
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      {toast && (
        <div className="mb-6 rounded-lg border border-lime/30 bg-lime/5 p-4 flex items-center gap-3 animate-fade-rise">
          <span className="material-symbols text-accent" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
          <p className="text-sm text-text-primary">{toast}</p>
        </div>
      )}

      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-h2 text-text-primary">Order Management</h1>
          <p className="font-body-md text-body-md text-text-muted mt-1">
            Monitor marketplace orders, fulfillment, payments, and order activity.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={exportCSV}>Export Orders</Button>
          <Button type="button" variant="ghost" onClick={() => showToast("Orders refreshed.")}>
            <span className="material-symbols text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>refresh</span>
            Refresh
          </Button>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Total Orders" value={overview.total} icon="shopping_cart" />
        <StatCard title="Pending" value={overview.pending} icon="schedule" />
        <StatCard title="Processing" value={overview.processing} icon="pending" />
        <StatCard title="Shipped" value={overview.shipped} icon="local_shipping" />
        <StatCard title="Delivered" value={overview.delivered} icon="check_circle" />
        <StatCard title="Cancelled/Refunded" value={overview.cancelled} icon="cancel" />
      </div>

      <div className="glass-panel rounded-xl p-4 md:p-6 shadow-lg relative overflow-hidden mb-6">
        <div
          className="absolute top-0 right-0 h-64 w-64 bg-lime/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Search by order ID, customer, email, or seller..."
                className="block w-full rounded-lg bg-surface-container-high border border-outline-variant/30 px-4 py-2.5 font-body-md text-text-primary outline-none transition-all placeholder:text-text-muted/60 focus:border-lime"
              />
            </div>
            <Button type="button" variant="outline" onClick={resetFilters}>Clear Filters</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="rounded-lg bg-surface-container-high border border-outline-variant/30 px-3 py-2 font-label-sm text-label-sm text-text-primary outline-none transition-all focus:border-lime"
            >
              <option value="all">All Statuses</option>
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s.toLowerCase()}>{s}</option>
              ))}
            </select>
            <select
              value={paymentFilter}
              onChange={(e) => { setPaymentFilter(e.target.value); setCurrentPage(1); }}
              className="rounded-lg bg-surface-container-high border border-outline-variant/30 px-3 py-2 font-label-sm text-label-sm text-text-primary outline-none transition-all focus:border-lime"
            >
              <option value="all">All Payments</option>
              {PAYMENT_STATUSES.map((s) => (
                <option key={s} value={s.toLowerCase()}>{s}</option>
              ))}
            </select>
            <select
              value={fulfillmentFilter}
              onChange={(e) => { setFulfillmentFilter(e.target.value); setCurrentPage(1); }}
              className="rounded-lg bg-surface-container-high border border-outline-variant/30 px-3 py-2 font-label-sm text-label-sm text-text-primary outline-none transition-all focus:border-lime"
            >
              <option value="all">All Fulfillment</option>
              {FULFILLMENT_STATUSES.map((s) => (
                <option key={s} value={s.toLowerCase()}>{s}</option>
              ))}
            </select>
            <select
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
              className="rounded-lg bg-surface-container-high border border-outline-variant/30 px-3 py-2 font-label-sm text-label-sm text-text-primary outline-none transition-all focus:border-lime"
            >
              {ORDER_DATE_FILTERS.map((f) => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-lime/30 bg-lime/5 p-4">
          <span className="font-label-sm text-label-sm text-text-primary">
            {selectedIds.length} selected
          </span>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={handleBulkMarkProcessing} className="text-accent border-lime/30 hover:bg-lime/10">
              Mark as Processing
            </Button>
            <Button type="button" variant="outline" onClick={handleBulkMarkShipped} className="text-accent border-lime/30 hover:bg-lime/10">
              Mark as Shipped
            </Button>
            <Button type="button" variant="ghost" onClick={() => setSelectedIds([])}>
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      <div className="glass-panel rounded-xl shadow-lg relative overflow-hidden mb-6 hidden md:block">
        <div
          className="absolute top-0 right-0 h-64 w-64 bg-lime/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative z-10 overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-outline-variant/20">
                <th className="p-4 w-12">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-outline-variant/30 bg-surface-container-high text-lime focus:ring-lime"
                    aria-label="Select all orders"
                  />
                </th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Order</th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Customer</th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Seller</th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Items</th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Amount</th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Payment</th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Status</th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Date</th>
                <th className="text-right font-label-sm text-label-sm text-text-muted pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order) => (
                <tr key={order.id} className={`border-b border-outline-variant/10 last:border-0 ${selectedIds.includes(order.id) ? "bg-lime/5" : ""}`}>
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(order.id)}
                      onChange={() => toggleSelect(order.id)}
                      className="h-4 w-4 rounded border-outline-variant/30 bg-surface-container-high text-lime focus:ring-lime"
                      aria-label={`Select order ${order.id}`}
                    />
                  </td>
                  <td className="py-4 font-label-sm text-label-sm text-text-primary">{order.id}</td>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 shrink-0 rounded-full overflow-hidden border border-outline-variant/30">
                        <img src={order.customer.avatar} alt={order.customer.name} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <p className="font-body-md text-sm text-text-primary">{order.customer.name}</p>
                        <p className="font-body-md text-xs text-text-muted">{order.customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 font-body-md text-sm text-text-primary">{order.seller.name}</td>
                  <td className="py-4 font-body-md text-sm text-text-primary">{order.items.length} items</td>
                  <td className="py-4 font-body-md text-sm text-text-primary">₦{order.total.toLocaleString()}</td>
                  <td className="py-4">
                    <Badge variant={order.paymentStatus === "Paid" ? "success" : order.paymentStatus === "Pending" ? "neutral" : "default"}>{order.paymentStatus}</Badge>
                  </td>
                  <td className="py-4">
                    <Badge variant={statusBadgeVariant(order.status)}>{order.status}</Badge>
                  </td>
                  <td className="py-4 font-body-md text-sm text-text-muted">
                    {new Date(order.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="py-4 text-right">
                    <button type="button" onClick={() => setDetailsOrder(order)} className="font-label-sm text-label-sm text-accent hover:text-accent/80 transition-colors">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="md:hidden mb-6">
        {paginatedOrders.map((order) => (
          <MobileOrderCard
            key={order.id}
            order={order}
            isSelected={selectedIds.includes(order.id)}
            onToggleSelect={() => toggleSelect(order.id)}
            onViewDetails={(o) => setDetailsOrder(o)}
            onCancelOrder={(o) => handleCancelOrder(o)}
            onRefundOrder={(o) => handleRefundOrder(o)}
          />
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="glass-panel rounded-xl p-12 text-center mb-6">
          <span className="material-symbols text-4xl text-text-muted mb-3">shopping_cart</span>
          <p className="font-body-md text-body-md text-text-muted mb-4">No orders found</p>
          <p className="font-body-md text-sm text-text-muted mb-4">Try adjusting your search or filters.</p>
          <Button type="button" onClick={resetFilters}>Reset Filters</Button>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="font-body-md text-sm text-text-muted">
            Page {safePage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={safePage === 1}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={safePage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <OrderDetailsModal
        order={detailsOrder}
        onClose={() => setDetailsOrder(null)}
        onUpdateStatus={handleUpdateStatus}
        onCancelOrder={handleCancelOrder}
        onRefundOrder={handleRefundOrder}
      />

      <ConfirmModal
        open={!!bulkAction}
        title={bulkAction?.type === "processing" ? "Mark selected orders as Processing?" : "Mark selected orders as Shipped?"}
        message={`This will update the status of ${selectedIds.length} order(s). Continue?`}
        confirmLabel={bulkAction?.type === "processing" ? "Mark as Processing" : "Mark as Shipped"}
        onConfirm={confirmBulkAction}
        onCancel={() => setBulkAction(null)}
      />
    </div>
  );
}
