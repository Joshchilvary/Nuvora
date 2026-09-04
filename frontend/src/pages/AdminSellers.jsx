import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button.jsx";
import Badge from "../components/ui/Badge.jsx";
import {
  ADMIN_SELLERS,
  SELLER_STATUS_FILTERS,
  SELLER_PAGE_SIZE,
  SELLER_PERFORMANCE,
  REJECTION_REASONS,
} from "../data/adminDashboard.js";

const ITEMS_PER_PAGE = SELLER_PAGE_SIZE;

function StatCard({ title, value }) {
  return (
    <div className="glass-panel rounded-xl p-4 shadow-lg relative overflow-hidden">
      <div
        className="absolute top-0 right-0 h-40 w-40 bg-lime/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"
        aria-hidden="true"
      />
      <p className="font-label-sm text-label-sm text-text-muted mb-1 relative z-10">{title}</p>
      <p className="font-h3 text-h3 text-text-primary relative z-10">{value}</p>
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

function SellerDetailsModal({ seller, onClose, onSuspend, onActivate, onVerify }) {
  if (!seller) return null;
  const timeFilter = "7 Days";
  const chartData = SELLER_PERFORMANCE[timeFilter] || SELLER_PERFORMANCE["7 Days"];
  const maxRevenue = Math.max(...chartData.revenue);
  const maxOrders = Math.max(...chartData.orders);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Seller Details"
    >
      <div className="absolute inset-0 bg-obsidian/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-xl border border-outline-variant/20 bg-surface-container p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-h4 text-h4 text-text-primary">Seller Details</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:text-text-primary transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols" style={{ fontVariationSettings: "'FILL' 0" }}>close</span>
          </button>
        </div>
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 shrink-0 rounded-full overflow-hidden border border-outline-variant/30">
            <img src={seller.avatar} alt={seller.storeName} className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="font-h4 text-h4 text-text-primary">{seller.storeName}</p>
            <p className="font-body-md text-sm text-text-muted">{seller.ownerName} · {seller.id}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="rounded-lg border border-outline-variant/20 bg-surface-container-high p-3 text-center">
            <p className="font-h4 text-h4 text-text-primary">{seller.products}</p>
            <p className="font-body-md text-xs text-text-muted">Products</p>
          </div>
          <div className="rounded-lg border border-outline-variant/20 bg-surface-container-high p-3 text-center">
            <p className="font-h4 text-h4 text-text-primary">{seller.orders}</p>
            <p className="font-body-md text-xs text-text-muted">Orders</p>
          </div>
          <div className="rounded-lg border border-outline-variant/20 bg-surface-container-high p-3 text-center">
            <p className="font-h4 text-h4 text-text-primary">{seller.revenue}</p>
            <p className="font-body-md text-xs text-text-muted">Revenue</p>
          </div>
          <div className="rounded-lg border border-outline-variant/20 bg-surface-container-high p-3 text-center">
            <p className="font-h4 text-h4 text-text-primary">{seller.rating || "—"}</p>
            <p className="font-body-md text-xs text-text-muted">Rating</p>
          </div>
        </div>
        <div className="mb-6">
          <h4 className="font-label-sm text-label-sm text-text-primary mb-2">Performance (7 Days)</h4>
          <div className="flex items-end gap-2 h-32">
            {chartData.revenue.map((value, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md bg-lime/70 transition-all"
                  style={{ height: `${(value / maxRevenue) * 100}%`, minHeight: "4px" }}
                />
                <span className="text-[10px] text-text-muted">{chartData.labels[idx]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mb-6">
          <h4 className="font-label-sm text-label-sm text-text-primary mb-3">Recent Activity</h4>
          <div className="space-y-2">
            {seller.activity.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-text-muted">
                <span className="material-symbols text-xs text-accent" style={{ fontVariationSettings: "'FILL' 0" }}>circle</span>
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button type="button" variant="outline" onClick={() => onSuspend(seller)} className="flex-1">
            Suspend Seller
          </Button>
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

function ApplicationReviewModal({ application, onClose, onApprove, onReject }) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  if (!application) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Review Application"
    >
      <div className="absolute inset-0 bg-obsidian/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-xl border border-outline-variant/20 bg-surface-container p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-h4 text-h4 text-text-primary">Review Application</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:text-text-primary transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols" style={{ fontVariationSettings: "'FILL' 0" }}>close</span>
          </button>
        </div>
        <div className="space-y-4 mb-6">
          <div>
            <h4 className="font-label-sm text-label-sm text-text-primary mb-2">Applicant</h4>
            <div className="rounded-lg border border-outline-variant/20 bg-surface-container-high p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-body-md text-sm text-text-muted">Owner</span>
                <span className="font-body-md text-sm text-text-primary">{application.ownerName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-body-md text-sm text-text-muted">Email</span>
                <span className="font-body-md text-sm text-text-primary">{application.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-body-md text-sm text-text-muted">Phone</span>
                <span className="font-body-md text-sm text-text-primary">{application.phone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-body-md text-sm text-text-muted">Status</span>
                <Badge variant={application.status === "Approved" ? "success" : application.status === "Rejected" ? "default" : "neutral"}>{application.status}</Badge>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-label-sm text-label-sm text-text-primary mb-2">Business</h4>
            <div className="rounded-lg border border-outline-variant/20 bg-surface-container-high p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-body-md text-sm text-text-muted">Store</span>
                <span className="font-body-md text-sm text-text-primary">{application.storeName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-body-md text-sm text-text-muted">Category</span>
                <span className="font-body-md text-sm text-text-primary">{application.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-body-md text-sm text-text-muted">Location</span>
                <span className="font-body-md text-sm text-text-primary">{application.location}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-body-md text-sm text-text-muted">Verified</span>
                <Badge variant={application.verified ? "lime" : "neutral"}>{application.verified ? "Verified" : "Pending Verification"}</Badge>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-label-sm text-label-sm text-text-primary mb-2">Application</h4>
            <div className="rounded-lg border border-outline-variant/20 bg-surface-container-high p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-body-md text-sm text-text-muted">Submitted</span>
                <span className="font-body-md text-sm text-text-primary">{new Date(application.appliedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-body-md text-sm text-text-muted">Status</span>
                <span className="font-body-md text-sm text-text-primary">{application.status}</span>
              </div>
            </div>
          </div>
        </div>
        {showRejectForm ? (
          <div className="mb-6 space-y-2">
            <label htmlFor="reject-reason" className="block font-label-sm text-label-sm text-text-primary">Rejection Reason</label>
            <select
              id="reject-reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="block w-full rounded-lg bg-surface-container-high border border-outline-variant/30 px-4 py-2.5 font-body-md text-text-primary outline-none transition-all focus:border-lime"
            >
              <option value="">Select a reason</option>
              {REJECTION_REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        ) : null}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button type="button" onClick={() => onApprove(application)} className="flex-1">
            Approve Seller
          </Button>
          {!showRejectForm ? (
            <Button type="button" variant="outline" onClick={() => setShowRejectForm(true)} className="flex-1">
              Reject Application
            </Button>
          ) : (
            <Button type="button" variant="outline" onClick={() => onReject(application, rejectionReason)} disabled={!rejectionReason} className="flex-1">
              Confirm Rejection
            </Button>
          )}
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

function MobileSellerCard({ seller, isSelected, onToggleSelect, onViewDetails, onSuspend, onActivate, onVerify, onReview }) {
  return (
    <div className="rounded-xl border border-outline-variant/20 bg-surface-container p-4 shadow-lg mb-4">
      <div className="flex items-start gap-3 mb-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="mt-1 h-4 w-4 rounded border-outline-variant/30 bg-surface-container-high text-lime focus:ring-lime"
          aria-label={`Select ${seller.storeName}`}
        />
        <div className="h-10 w-10 shrink-0 rounded-full overflow-hidden border border-outline-variant/30">
          <img src={seller.avatar} alt={seller.storeName} className="h-full w-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-label-sm text-label-sm text-text-primary truncate">{seller.storeName}</p>
          <p className="font-body-md text-xs text-text-muted truncate">{seller.ownerName}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        <Badge variant={seller.status === "Active" ? "success" : seller.status === "Pending" || seller.status === "Under Review" ? "neutral" : "default"}>{seller.status}</Badge>
        <Badge variant={seller.verified ? "lime" : "neutral"}>{seller.verified ? "Verified" : "Unverified"}</Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => onViewDetails(seller)} className="font-label-sm text-label-sm text-accent hover:text-accent/80 transition-colors">View</button>
        {seller.status === "Pending" || seller.status === "Under Review" ? (
          <button type="button" onClick={() => onReview(seller)} className="font-label-sm text-label-sm text-accent hover:text-accent/80 transition-colors">Review</button>
        ) : (
          <>
            {seller.status === "Active" ? (
              <button type="button" onClick={() => onSuspend(seller)} className="font-label-sm text-label-sm text-red-400 hover:text-red-300 transition-colors">Suspend</button>
            ) : (
              <button type="button" onClick={() => onActivate(seller)} className="font-label-sm text-label-sm text-accent hover:text-accent/80 transition-colors">Activate</button>
            )}
            {!seller.verified && (
              <button type="button" onClick={() => onVerify(seller)} className="font-label-sm text-label-sm text-text-muted hover:text-text-primary transition-colors">Verify</button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function AdminSellers() {
  const [sellers, setSellers] = useState(ADMIN_SELLERS);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [detailsSeller, setDetailsSeller] = useState(null);
  const [reviewApplication, setReviewApplication] = useState(null);
  const [suspendSeller, setSuspendSeller] = useState(null);
  const [activateSeller, setActivateSeller] = useState(null);
  const [verifySeller, setVerifySeller] = useState(null);
  const [bulkAction, setBulkAction] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const filteredSellers = useMemo(() => {
    return sellers.filter((seller) => {
      const term = search.trim().toLowerCase();
      if (term) {
        const match =
          seller.storeName.toLowerCase().includes(term) ||
          seller.ownerName.toLowerCase().includes(term) ||
          seller.email.toLowerCase().includes(term) ||
          seller.id.toLowerCase().includes(term);
        if (!match) return false;
      }
      if (filter === "active") return seller.status === "Active";
      if (filter === "pending") return seller.status === "Pending" || seller.status === "Under Review";
      if (filter === "suspended") return seller.status === "Suspended";
      if (filter === "verified") return seller.verified;
      if (filter === "unverified") return !seller.verified;
      if (filter === "rejected") return seller.status === "Rejected";
      return true;
    });
  }, [sellers, search, filter]);

  const totalPages = Math.max(1, Math.ceil(filteredSellers.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedSellers = filteredSellers.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const allSelected = paginatedSellers.length > 0 && paginatedSellers.every((s) => selectedIds.includes(s.id));
  const someSelected = paginatedSellers.some((s) => selectedIds.includes(s.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !paginatedSellers.some((s) => s.id === id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...paginatedSellers.map((s) => s.id)])]);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleReview = (seller) => {
    setReviewApplication(seller);
  };

  const handleApprove = (application) => {
    setSellers((prev) =>
      prev.map((s) => (s.id === application.id ? { ...s, status: "Active", verified: true } : s))
    );
    setReviewApplication(null);
    showToast(`Seller ${application.storeName} approved.`);
  };

  const handleReject = (application, reason) => {
    if (!reason) return;
    setSellers((prev) =>
      prev.map((s) => (s.id === application.id ? { ...s, status: "Rejected", verified: false } : s))
    );
    setReviewApplication(null);
    showToast(`Application for ${application.storeName} rejected.`);
  };

  const handleSuspend = (seller) => {
    setSuspendSeller(seller);
  };

  const confirmSuspend = () => {
    if (!suspendSeller) return;
    setSellers((prev) => prev.map((s) => (s.id === suspendSeller.id ? { ...s, status: "Suspended" } : s)));
    setSelectedIds((prev) => prev.filter((id) => id !== suspendSeller.id));
    setSuspendSeller(null);
    showToast(`Seller ${suspendSeller.storeName} suspended.`);
  };

  const handleActivate = (seller) => {
    setActivateSeller(seller);
  };

  const confirmActivate = () => {
    if (!activateSeller) return;
    setSellers((prev) => prev.map((s) => (s.id === activateSeller.id ? { ...s, status: "Active" } : s)));
    setSelectedIds((prev) => prev.filter((id) => id !== activateSeller.id));
    setActivateSeller(null);
    showToast(`Seller ${activateSeller.storeName} activated.`);
  };

  const handleVerify = (seller) => {
    setVerifySeller(seller);
  };

  const confirmVerify = () => {
    if (!verifySeller) return;
    setSellers((prev) => prev.map((s) => (s.id === verifySeller.id ? { ...s, verified: true } : s)));
    setSelectedIds((prev) => prev.filter((id) => id !== verifySeller.id));
    setVerifySeller(null);
    showToast(`Seller ${verifySeller.storeName} verified.`);
  };

  const handleBulkSuspend = () => {
    setBulkAction({ type: "suspend" });
  };

  const handleBulkActivate = () => {
    setBulkAction({ type: "activate" });
  };

  const confirmBulkAction = () => {
    if (!bulkAction) return;
    setSellers((prev) =>
      prev.map((s) =>
        selectedIds.includes(s.id)
          ? { ...s, status: bulkAction.type === "suspend" ? "Suspended" : "Active" }
          : s
      )
    );
    const label = bulkAction.type === "suspend" ? "suspended" : "activated";
    showToast(`${selectedIds.length} seller(s) ${label}.`);
    setSelectedIds([]);
    setBulkAction(null);
  };

  const resetFilters = () => {
    setSearch("");
    setFilter("all");
    setCurrentPage(1);
  };

  const overview = {
    total: sellers.length,
    active: sellers.filter((s) => s.status === "Active").length,
    pending: sellers.filter((s) => s.status === "Pending" || s.status === "Under Review").length,
    suspended: sellers.filter((s) => s.status === "Suspended").length,
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Toast */}
      {toast && (
        <div className="mb-6 rounded-lg border border-lime/30 bg-lime/5 p-4 flex items-center gap-3 animate-fade-rise">
          <span className="material-symbols text-accent" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
          <p className="text-sm text-text-primary">{toast}</p>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="font-display text-h2 text-text-primary">Seller Management</h1>
        <p className="font-body-md text-body-md text-text-muted mt-1">
          Manage sellers, stores, applications, verification, and marketplace performance.
        </p>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard title="Total Sellers" value={overview.total} />
          <StatCard title="Active Sellers" value={overview.active} />
          <StatCard title="Pending Applications" value={overview.pending} />
          <StatCard title="Suspended Sellers" value={overview.suspended} />
        </div>
      </div>

      {/* Seller Applications */}
      <div className="glass-panel rounded-xl p-6 md:p-8 shadow-lg relative overflow-hidden mb-6">
        <div
          className="absolute top-0 right-0 h-64 w-64 bg-lime/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"
          aria-hidden="true"
        />
        <div className="mb-6 relative z-10">
          <h2 className="font-h3 text-h3 text-text-primary">Seller Applications</h2>
          <p className="font-body-md text-body-md text-text-muted mt-1">Review and manage pending seller requests.</p>
        </div>
        <div className="relative z-10 overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-outline-variant/20">
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Store</th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Owner</th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Category</th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Status</th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Verified</th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Applied</th>
                <th className="text-right font-label-sm text-label-sm text-text-muted pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sellers.filter((s) => s.status === "Pending" || s.status === "Under Review").map((seller) => (
                <tr key={seller.id} className="border-b border-outline-variant/10 last:border-0">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 shrink-0 rounded-full overflow-hidden border border-outline-variant/30">
                        <img src={seller.avatar} alt={seller.storeName} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <p className="font-label-sm text-label-sm text-text-primary">{seller.storeName}</p>
                        <p className="font-body-md text-xs text-text-muted">{seller.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 font-body-md text-sm text-text-primary">{seller.ownerName}</td>
                  <td className="py-4 font-body-md text-sm text-text-muted">{seller.category}</td>
                  <td className="py-4">
                    <Badge variant={seller.status === "Pending" ? "neutral" : "default"}>{seller.status}</Badge>
                  </td>
                  <td className="py-4">
                    <Badge variant={seller.verified ? "lime" : "neutral"}>{seller.verified ? "Verified" : "Unverified"}</Badge>
                  </td>
                  <td className="py-4 font-body-md text-sm text-text-muted">
                    {new Date(seller.joined).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="py-4 text-right">
                    <button type="button" onClick={() => handleReview(seller)} className="font-label-sm text-label-sm text-accent hover:text-accent/80 transition-colors">Review</button>
                  </td>
                </tr>
              ))}
              {sellers.filter((s) => s.status === "Pending" || s.status === "Under Review").length === 0 && (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-text-muted font-body-md text-sm">No pending applications.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="glass-panel rounded-xl p-4 md:p-6 shadow-lg relative overflow-hidden mb-6">
        <div
          className="absolute top-0 right-0 h-64 w-64 bg-lime/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative z-10 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Search by store, owner, email, or seller ID..."
              className="block w-full rounded-lg bg-surface-container-high border border-outline-variant/30 px-4 py-2.5 font-body-md text-text-primary outline-none transition-all placeholder:text-text-muted/60 focus:border-lime"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {SELLER_STATUS_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => { setFilter(f.id); setCurrentPage(1); }}
                className={`rounded-lg px-3 py-2 font-label-sm text-label-sm transition-all ${
                  filter === f.id
                    ? "bg-lime text-obsidian"
                    : "border border-outline-variant/30 text-text-muted hover:text-text-primary hover:bg-surface-high"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <Button type="button" variant="outline" onClick={resetFilters}>
            Reset
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-lime/30 bg-lime/5 p-4">
          <span className="font-label-sm text-label-sm text-text-primary">
            {selectedIds.length} selected
          </span>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={handleBulkSuspend} className="text-red-400 border-red-400/30 hover:bg-red-400/10">
              Suspend Selected
            </Button>
            <Button type="button" variant="outline" onClick={handleBulkActivate} className="text-accent border-lime/30 hover:bg-lime/10">
              Activate Selected
            </Button>
            <Button type="button" variant="ghost" onClick={() => setSelectedIds([])}>
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Sellers Table - Desktop */}
      <div className="glass-panel rounded-xl shadow-lg relative overflow-hidden mb-6 hidden md:block">
        <div
          className="absolute top-0 right-0 h-64 w-64 bg-lime/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative z-10 overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-outline-variant/20">
                <th className="p-4 w-12">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-outline-variant/30 bg-surface-container-high text-lime focus:ring-lime"
                    aria-label="Select all sellers"
                  />
                </th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Seller / Store</th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Owner</th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Category</th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Verification</th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Status</th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Products</th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Orders</th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Revenue</th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Joined</th>
                <th className="text-right font-label-sm text-label-sm text-text-muted pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSellers.map((seller) => (
                <tr key={seller.id} className={`border-b border-outline-variant/10 last:border-0 ${selectedIds.includes(seller.id) ? "bg-lime/5" : ""}`}>
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(seller.id)}
                      onChange={() => toggleSelect(seller.id)}
                      className="h-4 w-4 rounded border-outline-variant/30 bg-surface-container-high text-lime focus:ring-lime"
                      aria-label={`Select ${seller.storeName}`}
                    />
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 shrink-0 rounded-full overflow-hidden border border-outline-variant/30">
                        <img src={seller.avatar} alt={seller.storeName} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <p className="font-label-sm text-label-sm text-text-primary">{seller.storeName}</p>
                        <p className="font-body-md text-xs text-text-muted">{seller.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 font-body-md text-sm text-text-primary">{seller.ownerName}</td>
                  <td className="py-4 font-body-md text-sm text-text-muted">{seller.category}</td>
                  <td className="py-4">
                    <Badge variant={seller.verified ? "lime" : "neutral"}>{seller.verified ? "Verified" : "Unverified"}</Badge>
                  </td>
                  <td className="py-4">
                    <Badge variant={seller.status === "Active" ? "success" : seller.status === "Pending" || seller.status === "Under Review" ? "neutral" : "default"}>{seller.status}</Badge>
                  </td>
                  <td className="py-4 font-body-md text-sm text-text-primary">{seller.products}</td>
                  <td className="py-4 font-body-md text-sm text-text-primary">{seller.orders}</td>
                  <td className="py-4 font-body-md text-sm text-text-primary">{seller.revenue}</td>
                  <td className="py-4 font-body-md text-sm text-text-muted">
                    {new Date(seller.joined).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button type="button" onClick={() => setDetailsSeller(seller)} className="font-label-sm text-label-sm text-accent hover:text-accent/80 transition-colors">View</button>
                      {seller.status === "Pending" || seller.status === "Under Review" ? (
                        <button type="button" onClick={() => handleReview(seller)} className="font-label-sm text-label-sm text-accent hover:text-accent/80 transition-colors">Review</button>
                      ) : (
                        <>
                          {seller.status === "Active" ? (
                            <button type="button" onClick={() => handleSuspend(seller)} className="font-label-sm text-label-sm text-red-400 hover:text-red-300 transition-colors">Suspend</button>
                          ) : seller.status !== "Rejected" ? (
                            <button type="button" onClick={() => handleActivate(seller)} className="font-label-sm text-label-sm text-accent hover:text-accent/80 transition-colors">Activate</button>
                          ) : null}
                          {!seller.verified && seller.status !== "Rejected" && (
                            <button type="button" onClick={() => handleVerify(seller)} className="font-label-sm text-label-sm text-text-muted hover:text-text-primary transition-colors">Verify</button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sellers Cards - Mobile */}
      <div className="md:hidden mb-6">
        {paginatedSellers.map((seller) => (
          <MobileSellerCard
            key={seller.id}
            seller={seller}
            isSelected={selectedIds.includes(seller.id)}
            onToggleSelect={() => toggleSelect(seller.id)}
            onViewDetails={(s) => setDetailsSeller(s)}
            onSuspend={handleSuspend}
            onActivate={handleActivate}
            onVerify={handleVerify}
            onReview={handleReview}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredSellers.length === 0 && (
        <div className="glass-panel rounded-xl p-12 text-center mb-6">
          <span className="material-symbols text-4xl text-text-muted mb-3">storefront</span>
          <p className="font-body-md text-body-md text-text-muted mb-4">No sellers found</p>
          <p className="font-body-md text-sm text-text-muted mb-4">Try adjusting your search or filters.</p>
          <Button type="button" onClick={resetFilters}>Reset Filters</Button>
        </div>
      )}

      {/* Pagination */}
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

      {/* Seller Details Modal */}
      <SellerDetailsModal
        seller={detailsSeller}
        onClose={() => setDetailsSeller(null)}
        onSuspend={(s) => { setDetailsSeller(null); handleSuspend(s); }}
        onActivate={(s) => { setDetailsSeller(null); handleActivate(s); }}
        onVerify={(s) => { setDetailsSeller(null); handleVerify(s); }}
      />

      {/* Application Review Modal */}
      <ApplicationReviewModal
        application={reviewApplication}
        onClose={() => setReviewApplication(null)}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      {/* Suspend Confirmation */}
      <ConfirmModal
        open={!!suspendSeller}
        title="Suspend this seller?"
        message={`${suspendSeller?.storeName} will no longer be visible or active on the marketplace while suspended.`}
        confirmLabel="Suspend Seller"
        danger
        onConfirm={confirmSuspend}
        onCancel={() => setSuspendSeller(null)}
      />

      {/* Activate Confirmation */}
      <ConfirmModal
        open={!!activateSeller}
        title="Activate this seller?"
        message={`Restore marketplace access for ${activateSeller?.storeName}?`}
        confirmLabel="Activate Seller"
        onConfirm={confirmActivate}
        onCancel={() => setActivateSeller(null)}
      />

      {/* Verify Confirmation */}
      <ConfirmModal
        open={!!verifySeller}
        title="Verify this seller?"
        message={`Mark ${verifySeller?.storeName} as verified? This is a mock frontend action only.`}
        confirmLabel="Verify Seller"
        onConfirm={confirmVerify}
        onCancel={() => setVerifySeller(null)}
      />

      {/* Bulk Action Confirmation */}
      <ConfirmModal
        open={!!bulkAction}
        title={bulkAction?.type === "suspend" ? "Suspend selected sellers?" : "Activate selected sellers?"}
        message={`This will change the status of ${selectedIds.length} seller(s). Continue?`}
        confirmLabel={bulkAction?.type === "suspend" ? "Suspend Selected" : "Activate Selected"}
        danger={bulkAction?.type === "suspend"}
        onConfirm={confirmBulkAction}
        onCancel={() => setBulkAction(null)}
      />
    </div>
  );
}
