import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button.jsx";
import Badge from "../components/ui/Badge.jsx";
import {
  ADMIN_REVIEWS,
  REVIEW_STATUSES,
  REVIEW_DATE_FILTERS,
  REVIEW_REPORT_REASONS,
  REVIEW_PAGE_SIZE,
} from "../data/adminDashboard.js";

const ITEMS_PER_PAGE = REVIEW_PAGE_SIZE;

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

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= rating;
        return (
          <span
            key={star}
            className="material-symbols text-sm"
            style={{
              fontVariationSettings: "'FILL' 1",
              color: filled ? "rgb(var(--nuvora-lime) / <alpha-value>)" : "rgb(var(--nuvora-outline-variant) / <alpha-value>)",
            }}
          >
            star
          </span>
        );
      })}
    </div>
  );
}

function ReviewDetailsModal({ review, onClose, onPublish, onHide, onRemove, onDismissReport }) {
  if (!review) return null;
  const [actionType, setActionType] = useState(null);
  const [showReportReasons, setShowReportReasons] = useState(false);

  const statusBadgeVariant = (status) => {
    switch (status) {
      case "Published": return "success";
      case "Pending": return "neutral";
      case "Reported": return "default";
      case "Removed": return "default";
      default: return "default";
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Review Details"
    >
      <div className="absolute inset-0 bg-obsidian/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-xl border border-outline-variant/20 bg-surface-container p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-h4 text-h4 text-text-primary">Review {review.id}</h3>
            <p className="font-body-md text-sm text-text-muted">
              {new Date(review.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
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
          <Badge variant={statusBadgeVariant(review.status)}>{review.status}</Badge>
          <StarRating rating={review.rating} />
        </div>

        <div className="mb-6">
          <h4 className="font-label-sm text-label-sm text-text-primary mb-2">Review</h4>
          <div className="rounded-lg border border-outline-variant/20 bg-surface-container-high p-4">
            <p className="font-label-sm text-label-sm text-text-primary mb-1">{review.title}</p>
            <p className="font-body-md text-sm text-text-muted">{review.content}</p>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="font-label-sm text-label-sm text-text-primary mb-3">Customer</h4>
          <div className="flex items-center gap-3 rounded-lg border border-outline-variant/20 bg-surface-container-high p-3">
            <div className="h-10 w-10 shrink-0 rounded-full overflow-hidden border border-outline-variant/30">
              <img src={review.customerAvatar} alt={review.customerName} className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="font-label-sm text-label-sm text-text-primary">{review.customerName}</p>
              <p className="font-body-md text-xs text-text-muted">{review.customerEmail}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="font-label-sm text-label-sm text-text-primary mb-3">Product</h4>
          <div className="rounded-lg border border-outline-variant/20 bg-surface-container-high p-3">
            <p className="font-label-sm text-label-sm text-text-primary">{review.productName}</p>
            <p className="font-body-md text-xs text-text-muted">{review.category} · {review.seller}</p>
          </div>
        </div>

        {review.reports > 0 && (
          <div className="mb-6">
            <h4 className="font-label-sm text-label-sm text-text-primary mb-2">Reports</h4>
            <div className="rounded-lg border border-red-400/30 bg-red-400/5 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-body-md text-sm text-text-primary">{review.reports} report(s)</span>
                <button
                  type="button"
                  onClick={() => setShowReportReasons(!showReportReasons)}
                  className="font-label-sm text-label-sm text-accent hover:text-accent/80 transition-colors"
                >
                  {showReportReasons ? "Hide" : "Show"} Details
                </button>
              </div>
              {showReportReasons && (
                <div className="space-y-1">
                  {REVIEW_REPORT_REASONS.map((reason) => (
                    <div key={reason} className="flex items-center gap-2 text-sm text-text-muted">
                      <span className="material-symbols text-xs text-accent" style={{ fontVariationSettings: "'FILL' 0" }}>circle</span>
                      {reason}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          {review.status !== "Published" && (
            <Button type="button" onClick={() => { onPublish(review); onClose(); }} className="flex-1">
              Publish Review
            </Button>
          )}
          {review.status === "Published" && (
            <Button type="button" variant="outline" onClick={() => { setActionType("hide"); }} className="flex-1">
              Hide Review
            </Button>
          )}
          {review.status === "Reported" && (
            <Button type="button" variant="outline" onClick={() => { onDismissReport(review); onClose(); }} className="flex-1">
              Dismiss Report
            </Button>
          )}
          {review.status !== "Removed" && (
            <Button type="button" variant="outline" onClick={() => { setActionType("remove"); }} className="flex-1 text-red-400 border-red-400/30 hover:bg-red-400/10">
              Remove Review
            </Button>
          )}
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            Close
          </Button>
        </div>

        <ConfirmModal
          open={actionType === "hide"}
          title="Hide this review?"
          message={`This review will no longer be publicly visible on the marketplace.`}
          confirmLabel="Hide Review"
          onConfirm={() => { onHide(review); setActionType(null); onClose(); }}
          onCancel={() => setActionType(null)}
        />
        <ConfirmModal
          open={actionType === "remove"}
          title="Remove this review?"
          message={`This will permanently remove review ${review.id} from the marketplace. Continue?`}
          confirmLabel="Remove Review"
          danger
          onConfirm={() => { onRemove(review); setActionType(null); onClose(); }}
          onCancel={() => setActionType(null)}
        />
      </div>
    </div>
  );
}

function MobileReviewCard({ review, isSelected, onToggleSelect, onViewDetails }) {
  return (
    <div className="rounded-xl border border-outline-variant/20 bg-surface-container p-4 shadow-lg mb-4">
      <div className="flex items-start gap-3 mb-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="mt-1 h-4 w-4 rounded border-outline-variant/30 bg-surface-container-high text-lime focus:ring-lime"
          aria-label={`Select review ${review.id}`}
        />
        <div className="h-10 w-10 shrink-0 rounded-full overflow-hidden border border-outline-variant/30">
          <img src={review.customerAvatar} alt={review.customerName} className="h-full w-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-label-sm text-label-sm text-text-primary truncate">{review.customerName}</p>
          <p className="font-body-md text-xs text-text-muted truncate">{review.productName}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        <StarRating rating={review.rating} />
        <Badge variant={review.status === "Published" ? "success" : review.status === "Pending" ? "neutral" : review.status === "Reported" ? "default" : "default"}>{review.status}</Badge>
        {review.reports > 0 && <Badge variant="default">{review.reports} reports</Badge>}
      </div>
      <p className="font-body-md text-xs text-text-muted mb-3 line-clamp-2">{review.content}</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => onViewDetails(review)} className="font-label-sm text-label-sm text-accent hover:text-accent/80 transition-colors">View</button>
      </div>
    </div>
  );
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState(ADMIN_REVIEWS);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reportFilter, setReportFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [detailsReview, setDetailsReview] = useState(null);
  const [bulkAction, setBulkAction] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const term = search.trim().toLowerCase();
      if (term) {
        const match =
          review.id.toLowerCase().includes(term) ||
          review.customerName.toLowerCase().includes(term) ||
          review.productName.toLowerCase().includes(term) ||
          review.seller.toLowerCase().includes(term) ||
          review.content.toLowerCase().includes(term);
        if (!match) return false;
      }
      if (ratingFilter !== "all" && review.rating !== parseInt(ratingFilter)) return false;
      if (statusFilter !== "all") {
        const statusMap = { published: "Published", pending: "Pending", reported: "Reported", removed: "Removed" };
        if (review.status !== statusMap[statusFilter]) return false;
      }
      if (reportFilter === "reported" && review.reports === 0) return false;
      if (reportFilter === "not-reported" && review.reports > 0) return false;
      if (dateFilter !== "all") {
        const reviewDate = new Date(review.date);
        const now = new Date();
        if (dateFilter === "today") {
          if (reviewDate.toDateString() !== now.toDateString()) return false;
        } else if (dateFilter === "7d") {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          if (reviewDate < weekAgo) return false;
        } else if (dateFilter === "30d") {
          const monthAgo = new Date();
          monthAgo.setDate(monthAgo.getDate() - 30);
          if (reviewDate < monthAgo) return false;
        }
      }
      return true;
    });
  }, [reviews, search, ratingFilter, statusFilter, reportFilter, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedReviews = filteredReviews.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const allSelected = paginatedReviews.length > 0 && paginatedReviews.every((r) => selectedIds.includes(r.id));
  const someSelected = paginatedReviews.some((r) => selectedIds.includes(r.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !paginatedReviews.some((r) => r.id === id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...paginatedReviews.map((r) => r.id)])]);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handlePublish = (review) => {
    setReviews((prev) => prev.map((r) => (r.id === review.id ? { ...r, status: "Published" } : r)));
    showToast(`Review ${review.id} published.`);
  };

  const handleHide = (review) => {
    setReviews((prev) => prev.map((r) => (r.id === review.id ? { ...r, status: "Removed" } : r)));
    showToast(`Review ${review.id} hidden.`);
  };

  const handleRemove = (review) => {
    setReviews((prev) => prev.map((r) => (r.id === review.id ? { ...r, status: "Removed" } : r)));
    showToast(`Review ${review.id} removed.`);
  };

  const handleDismissReport = (review) => {
    setReviews((prev) => prev.map((r) => (r.id === review.id ? { ...r, status: "Published", reports: 0, reportReason: "" } : r)));
    showToast(`Report dismissed for review ${review.id}.`);
  };

  const handleBulkPublish = () => {
    setBulkAction({ type: "publish" });
  };

  const handleBulkHide = () => {
    setBulkAction({ type: "hide" });
  };

  const handleBulkRemove = () => {
    setBulkAction({ type: "remove" });
  };

  const confirmBulkAction = () => {
    if (!bulkAction) return;
    setReviews((prev) =>
      prev.map((r) => {
        if (!selectedIds.includes(r.id)) return r;
        if (bulkAction.type === "publish") return { ...r, status: "Published" };
        if (bulkAction.type === "hide") return { ...r, status: "Removed" };
        if (bulkAction.type === "remove") return { ...r, status: "Removed", reports: 0, reportReason: "" };
        return r;
      })
    );
    const labels = { publish: "published", hide: "hidden", remove: "removed" };
    showToast(`${selectedIds.length} review(s) ${labels[bulkAction.type]}.`);
    setSelectedIds([]);
    setBulkAction(null);
  };

  const exportCSV = () => {
    const dataToExport = selectedIds.length > 0 ? reviews.filter((r) => selectedIds.includes(r.id)) : filteredReviews;
    if (!dataToExport.length) return;
    const header = "Review ID,Customer,Email,Product,Seller,Rating,Status,Reports,Date\n";
    const rows = dataToExport
      .map((r) => `${r.id},"${r.customerName}",${r.customerEmail},${r.productName},${r.seller},${r.rating},${r.status},${r.reports},${r.date}`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nuvora-reviews.csv";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Reviews exported successfully.");
  };

  const resetFilters = () => {
    setSearch("");
    setRatingFilter("all");
    setStatusFilter("all");
    setReportFilter("all");
    setDateFilter("all");
    setCurrentPage(1);
  };

  const overview = {
    total: reviews.length,
    avgRating: (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1),
    pending: reviews.filter((r) => r.status === "Pending").length,
    reported: reviews.filter((r) => r.status === "Reported").length,
    removed: reviews.filter((r) => r.status === "Removed").length,
  };

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    return { star, count, pct: reviews.length ? Math.round((count / reviews.length) * 100) : 0 };
  });

  const statusBadgeVariant = (status) => {
    switch (status) {
      case "Published": return "success";
      case "Pending": return "neutral";
      case "Reported": return "default";
      case "Removed": return "default";
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
          <h1 className="font-display text-h2 text-text-primary">Review Management</h1>
          <p className="font-body-md text-body-md text-text-muted mt-1">
            Monitor customer feedback, moderate reviews, and protect marketplace trust.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={exportCSV}>Export Reviews</Button>
          <Button type="button" variant="ghost" onClick={() => showToast("Reviews refreshed.")}>
            <span className="material-symbols text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>refresh</span>
            Refresh
          </Button>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard title="Total Reviews" value={overview.total} icon="rate_review" />
        <StatCard title="Average Rating" value={overview.avgRating} icon="star" />
        <StatCard title="Pending Moderation" value={overview.pending} icon="pending" />
        <StatCard title="Reported Reviews" value={overview.reported} icon="warning" />
        <StatCard title="Removed Reviews" value={overview.removed} icon="delete" />
      </div>

      <div className="glass-panel rounded-xl p-4 md:p-6 shadow-lg relative overflow-hidden mb-6">
        <div
          className="absolute top-0 right-0 h-64 w-64 bg-lime/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative z-10 mb-4">
          <h2 className="font-h3 text-h3 text-text-primary">Rating Distribution</h2>
          <p className="font-body-md text-body-md text-text-muted mt-1">Review breakdown by star rating.</p>
        </div>
        <div className="relative z-10 space-y-2">
          {ratingDistribution.map(({ star, count, pct }) => (
            <div key={star} className="flex items-center gap-3">
              <span className="font-label-sm text-label-sm text-text-primary w-8">{star}★</span>
              <div className="flex-1 h-2 rounded-full bg-surface-high overflow-hidden">
                <div className="h-full rounded-full bg-lime transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
              <span className="font-body-md text-xs text-text-muted w-16 text-right">{count} ({pct}%)</span>
            </div>
          ))}
        </div>
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
                placeholder="Search by review ID, customer, product, seller, or text..."
                className="block w-full rounded-lg bg-surface-container-high border border-outline-variant/30 px-4 py-2.5 font-body-md text-text-primary outline-none transition-all placeholder:text-text-muted/60 focus:border-lime"
              />
            </div>
            <Button type="button" variant="outline" onClick={resetFilters}>Reset Filters</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={ratingFilter}
              onChange={(e) => { setRatingFilter(e.target.value); setCurrentPage(1); }}
              className="rounded-lg bg-surface-container-high border border-outline-variant/30 px-3 py-2 font-label-sm text-label-sm text-text-primary outline-none transition-all focus:border-lime"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="rounded-lg bg-surface-container-high border border-outline-variant/30 px-3 py-2 font-label-sm text-label-sm text-text-primary outline-none transition-all focus:border-lime"
            >
              <option value="all">All Statuses</option>
              {REVIEW_STATUSES.map((s) => (
                <option key={s} value={s.toLowerCase()}>{s}</option>
              ))}
            </select>
            <select
              value={reportFilter}
              onChange={(e) => { setReportFilter(e.target.value); setCurrentPage(1); }}
              className="rounded-lg bg-surface-container-high border border-outline-variant/30 px-3 py-2 font-label-sm text-label-sm text-text-primary outline-none transition-all focus:border-lime"
            >
              <option value="all">All Reports</option>
              <option value="reported">Reported</option>
              <option value="not-reported">Not Reported</option>
            </select>
            <select
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
              className="rounded-lg bg-surface-container-high border border-outline-variant/30 px-3 py-2 font-label-sm text-label-sm text-text-primary outline-none transition-all focus:border-lime"
            >
              {REVIEW_DATE_FILTERS.map((f) => (
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
            <Button type="button" variant="outline" onClick={handleBulkPublish} className="text-accent border-lime/30 hover:bg-lime/10">
              Publish Selected
            </Button>
            <Button type="button" variant="outline" onClick={handleBulkHide} className="text-red-400 border-red-400/30 hover:bg-red-400/10">
              Hide Selected
            </Button>
            <Button type="button" variant="outline" onClick={handleBulkRemove} className="text-red-400 border-red-400/30 hover:bg-red-400/10">
              Remove Selected
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
                    aria-label="Select all reviews"
                  />
                </th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Review</th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Customer</th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Product</th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Seller</th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Rating</th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Status</th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Reports</th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Date</th>
                <th className="text-right font-label-sm text-label-sm text-text-muted pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedReviews.map((review) => (
                <tr key={review.id} className={`border-b border-outline-variant/10 last:border-0 ${selectedIds.includes(review.id) ? "bg-lime/5" : ""}`}>
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(review.id)}
                      onChange={() => toggleSelect(review.id)}
                      className="h-4 w-4 rounded border-outline-variant/30 bg-surface-container-high text-lime focus:ring-lime"
                      aria-label={`Select review ${review.id}`}
                    />
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 rounded-full overflow-hidden border border-outline-variant/30">
                        <img src={review.customerAvatar} alt={review.customerName} className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-label-sm text-label-sm text-text-primary truncate max-w-[200px]">{review.title}</p>
                        <p className="font-body-md text-xs text-text-muted truncate max-w-[200px]">{review.content}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 font-body-md text-sm text-text-primary">{review.customerName}</td>
                  <td className="py-4 font-body-md text-sm text-text-primary">{review.productName}</td>
                  <td className="py-4 font-body-md text-sm text-text-muted">{review.seller}</td>
                  <td className="py-4">
                    <StarRating rating={review.rating} />
                  </td>
                  <td className="py-4">
                    <Badge variant={statusBadgeVariant(review.status)}>{review.status}</Badge>
                  </td>
                  <td className="py-4 font-body-md text-sm text-text-primary">{review.reports}</td>
                  <td className="py-4 font-body-md text-sm text-text-muted">
                    {new Date(review.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="py-4 text-right">
                    <button type="button" onClick={() => setDetailsReview(review)} className="font-label-sm text-label-sm text-accent hover:text-accent/80 transition-colors">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="md:hidden mb-6">
        {paginatedReviews.map((review) => (
          <MobileReviewCard
            key={review.id}
            review={review}
            isSelected={selectedIds.includes(review.id)}
            onToggleSelect={() => toggleSelect(review.id)}
            onViewDetails={(r) => setDetailsReview(r)}
          />
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <div className="glass-panel rounded-xl p-12 text-center mb-6">
          <span className="material-symbols text-4xl text-text-muted mb-3">rate_review</span>
          <p className="font-body-md text-body-md text-text-muted mb-4">No reviews found</p>
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

      <ReviewDetailsModal
        review={detailsReview}
        onClose={() => setDetailsReview(null)}
        onPublish={handlePublish}
        onHide={handleHide}
        onRemove={handleRemove}
        onDismissReport={handleDismissReport}
      />

      <ConfirmModal
        open={!!bulkAction}
        title={bulkAction?.type === "publish" ? "Publish selected reviews?" : bulkAction?.type === "hide" ? "Hide selected reviews?" : "Remove selected reviews?"}
        message={`This will update the status of ${selectedIds.length} review(s). Continue?`}
        confirmLabel={bulkAction?.type === "publish" ? "Publish Selected" : bulkAction?.type === "hide" ? "Hide Selected" : "Remove Selected"}
        danger={bulkAction?.type === "remove"}
        onConfirm={confirmBulkAction}
        onCancel={() => setBulkAction(null)}
      />
    </div>
  );
}
