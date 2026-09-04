import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button.jsx";
import Badge from "../components/ui/Badge.jsx";
import {
  ADMIN_PRODUCTS,
  PRODUCT_STATUS_FILTERS,
  PRODUCT_APPROVAL_FILTERS,
  PRODUCT_REPORT_FILTERS,
  PRODUCT_PAGE_SIZE,
} from "../data/adminDashboard.js";
import { CATEGORIES } from "../data/products.js";

const ITEMS_PER_PAGE = PRODUCT_PAGE_SIZE;

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

function ProductDetailsModal({ product, onClose, onApprove, onReject, onHide, onRestore, onDismissReport, onRemove }) {
  if (!product) return null;
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Product Details"
    >
      <div className="absolute inset-0 bg-obsidian/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-xl border border-outline-variant/20 bg-surface-container p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-h4 text-h4 text-text-primary">Product Details</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:text-text-primary transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols" style={{ fontVariationSettings: "'FILL' 0" }}>close</span>
          </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-6 mb-6">
          <div className="sm:w-48 shrink-0">
            <div className="h-48 w-full sm:h-full sm:min-h-[180px] rounded-xl overflow-hidden border border-outline-variant/20 bg-surface-high">
              <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-h4 text-h4 text-text-primary">{product.name}</p>
            <p className="font-body-md text-sm text-text-muted mt-1">{product.id}</p>
            <p className="font-body-md text-sm text-text-muted mt-2">{product.description}</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-outline-variant/20 bg-surface-container-high p-3">
                <p className="font-label-sm text-label-sm text-text-muted">Price</p>
                <p className="font-body-md text-sm text-text-primary">₦{product.price.toLocaleString()}{product.oldPrice && <span className="text-text-muted line-through ml-2">₦{product.oldPrice.toLocaleString()}</span>}</p>
              </div>
              <div className="rounded-lg border border-outline-variant/20 bg-surface-container-high p-3">
                <p className="font-label-sm text-label-sm text-text-muted">Stock</p>
                <p className="font-body-md text-sm text-text-primary">{product.stock}</p>
              </div>
              <div className="rounded-lg border border-outline-variant/20 bg-surface-container-high p-3">
                <p className="font-label-sm text-label-sm text-text-muted">Category</p>
                <p className="font-body-md text-sm text-text-primary">{product.category}</p>
              </div>
              <div className="rounded-lg border border-outline-variant/20 bg-surface-container-high p-3">
                <p className="font-label-sm text-label-sm text-text-muted">Seller</p>
                <p className="font-body-md text-sm text-text-primary">{product.seller}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-lg border border-outline-variant/20 bg-surface-container-high p-3 text-center">
            <p className="font-h4 text-h4 text-text-primary">{product.rating || "—"}</p>
            <p className="font-body-md text-xs text-text-muted">Rating</p>
          </div>
          <div className="rounded-lg border border-outline-variant/20 bg-surface-container-high p-3 text-center">
            <p className="font-h4 text-h4 text-text-primary">{product.reviews}</p>
            <p className="font-body-md text-xs text-text-muted">Reviews</p>
          </div>
          <div className="rounded-lg border border-outline-variant/20 bg-surface-container-high p-3 text-center">
            <p className="font-h4 text-h4 text-text-primary">{product.reports}</p>
            <p className="font-body-md text-xs text-text-muted">Reports</p>
          </div>
          <div className="rounded-lg border border-outline-variant/20 bg-surface-container-high p-3 text-center">
            <p className="font-h4 text-h4 text-text-primary">{new Date(product.added).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
            <p className="font-body-md text-xs text-text-muted">Added</p>
          </div>
        </div>
        {product.reports > 0 && (
          <div className="mb-6 rounded-lg border border-red-400/30 bg-red-400/5 p-4">
            <p className="font-label-sm text-label-sm text-red-400 mb-1">Reported</p>
            <p className="font-body-md text-sm text-text-muted">{product.reportReason || "No reason provided"}</p>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-3">
          {product.approval === "Pending" && (
            <>
              <Button type="button" onClick={() => onApprove(product)} className="flex-1">Approve Product</Button>
              {!showRejectForm ? (
                <Button type="button" variant="outline" onClick={() => setShowRejectForm(true)} className="flex-1">Reject Product</Button>
              ) : (
                <div className="flex-1 space-y-2">
                  <select
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="block w-full rounded-lg bg-surface-container-high border border-outline-variant/30 px-4 py-2.5 font-body-md text-text-primary outline-none transition-all focus:border-lime"
                  >
                    <option value="">Select a reason</option>
                    <option value="Incomplete information">Incomplete information</option>
                    <option value="Policy violation">Policy violation</option>
                    <option value="Quality concern">Quality concern</option>
                    <option value="Duplicate listing">Duplicate listing</option>
                  </select>
                  <Button type="button" variant="outline" onClick={() => onReject(product, rejectionReason)} disabled={!rejectionReason} className="w-full">Confirm Rejection</Button>
                </div>
              )}
            </>
          )}
          {product.status === "Active" && (
            <Button type="button" variant="outline" onClick={() => onHide(product)} className="flex-1">Hide Product</Button>
          )}
          {product.status === "Hidden" && (
            <Button type="button" onClick={() => onRestore(product)} className="flex-1">Restore Product</Button>
          )}
          {product.reports > 0 && (
            <>
              <Button type="button" variant="outline" onClick={() => onDismissReport(product)} className="flex-1">Dismiss Report</Button>
              <Button type="button" variant="outline" onClick={() => onRemove(product)} className="flex-1 text-red-400 border-red-400/30 hover:bg-red-400/10">Remove Product</Button>
            </>
          )}
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Close</Button>
        </div>
      </div>
    </div>
  );
}

function MobileProductCard({ product, isSelected, onToggleSelect, onViewDetails, onApprove, onReject, onHide, onRestore }) {
  return (
    <div className="rounded-xl border border-outline-variant/20 bg-surface-container p-4 shadow-lg mb-4">
      <div className="flex items-start gap-3 mb-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="mt-1 h-4 w-4 rounded border-outline-variant/30 bg-surface-container-high text-lime focus:ring-lime"
          aria-label={`Select ${product.name}`}
        />
        <div className="h-12 w-12 shrink-0 rounded-lg overflow-hidden border border-outline-variant/20">
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-label-sm text-label-sm text-text-primary truncate">{product.name}</p>
          <p className="font-body-md text-xs text-text-muted truncate">{product.seller}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        <Badge variant={product.approval === "Approved" ? "success" : product.approval === "Pending" ? "neutral" : "default"}>{product.approval}</Badge>
        <Badge variant={product.status === "Active" ? "lime" : product.status === "Hidden" ? "neutral" : "default"}>{product.status}</Badge>
        {product.reports > 0 && <Badge variant="default">{product.reports} reports</Badge>}
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => onViewDetails(product)} className="font-label-sm text-label-sm text-accent hover:text-accent/80 transition-colors">View</button>
        {product.approval === "Pending" && (
          <>
            <button type="button" onClick={() => onApprove(product)} className="font-label-sm text-label-sm text-accent hover:text-accent/80 transition-colors">Approve</button>
            <button type="button" onClick={() => onReject(product)} className="font-label-sm text-label-sm text-red-400 hover:text-red-300 transition-colors">Reject</button>
          </>
        )}
        {product.status === "Active" && (
          <button type="button" onClick={() => onHide(product)} className="font-label-sm text-label-sm text-red-400 hover:text-red-300 transition-colors">Hide</button>
        )}
        {product.status === "Hidden" && (
          <button type="button" onClick={() => onRestore(product)} className="font-label-sm text-label-sm text-accent hover:text-accent/80 transition-colors">Restore</button>
        )}
      </div>
    </div>
  );
}

export default function AdminProducts() {
  const [products, setProducts] = useState(ADMIN_PRODUCTS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [reportFilter, setReportFilter] = useState("all");
  const [sellerFilter, setSellerFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [detailsProduct, setDetailsProduct] = useState(null);
  const [hideProduct, setHideProduct] = useState(null);
  const [restoreProduct, setRestoreProduct] = useState(null);
  const [removeProduct, setRemoveProduct] = useState(null);
  const [bulkAction, setBulkAction] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const term = search.trim().toLowerCase();
      if (term) {
        const match =
          product.name.toLowerCase().includes(term) ||
          product.id.toLowerCase().includes(term) ||
          product.seller.toLowerCase().includes(term) ||
          product.category.toLowerCase().includes(term);
        if (!match) return false;
      }
      if (statusFilter !== "all") return product.status === statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1);
      if (approvalFilter !== "all") {
        const approvalMap = { approved: "Approved", pending: "Pending", rejected: "Rejected" };
        return product.approval === approvalMap[approvalFilter];
      }
      if (reportFilter === "reported" && product.reports === 0) return false;
      if (reportFilter === "not-reported" && product.reports > 0) return false;
      if (sellerFilter !== "all" && product.sellerId !== sellerFilter) return false;
      if (categoryFilter !== "all" && product.category !== categoryFilter) return false;
      return true;
    });
  }, [products, search, statusFilter, approvalFilter, reportFilter, sellerFilter, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedProducts = filteredProducts.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const allSelected = paginatedProducts.length > 0 && paginatedProducts.every((p) => selectedIds.includes(p.id));
  const someSelected = paginatedProducts.some((p) => selectedIds.includes(p.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !paginatedProducts.some((p) => p.id === id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...paginatedProducts.map((p) => p.id)])]);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleApprove = (product) => {
    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, approval: "Approved" } : p)));
    setDetailsProduct(null);
    showToast(`Product ${product.name} approved.`);
  };

  const handleReject = (product, reason) => {
    if (!reason) return;
    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, approval: "Rejected" } : p)));
    setDetailsProduct(null);
    showToast(`Product ${product.name} rejected.`);
  };

  const handleHide = (product) => {
    setHideProduct(product);
  };

  const confirmHide = () => {
    if (!hideProduct) return;
    setProducts((prev) => prev.map((p) => (p.id === hideProduct.id ? { ...p, status: "Hidden" } : p)));
    setSelectedIds((prev) => prev.filter((id) => id !== hideProduct.id));
    setHideProduct(null);
    showToast(`Product ${hideProduct.name} hidden.`);
  };

  const handleRestore = (product) => {
    setRestoreProduct(product);
  };

  const confirmRestore = () => {
    if (!restoreProduct) return;
    setProducts((prev) => prev.map((p) => (p.id === restoreProduct.id ? { ...p, status: "Active" } : p)));
    setSelectedIds((prev) => prev.filter((id) => id !== restoreProduct.id));
    setRestoreProduct(null);
    showToast(`Product ${restoreProduct.name} restored.`);
  };

  const handleDismissReport = (product) => {
    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, reports: 0, reportReason: "" } : p)));
    setDetailsProduct(null);
    showToast(`Report dismissed for ${product.name}.`);
  };

  const handleRemove = (product) => {
    setRemoveProduct(product);
  };

  const confirmRemove = () => {
    if (!removeProduct) return;
    setProducts((prev) => prev.map((p) => (p.id === removeProduct.id ? { ...p, status: "Removed", reports: 0, reportReason: "" } : p)));
    setSelectedIds((prev) => prev.filter((id) => id !== removeProduct.id));
    setRemoveProduct(null);
    showToast(`Product ${removeProduct.name} removed.`);
  };

  const handleBulkApprove = () => {
    setBulkAction({ type: "approve" });
  };

  const handleBulkHide = () => {
    setBulkAction({ type: "hide" });
  };

  const handleBulkRestore = () => {
    setBulkAction({ type: "restore" });
  };

  const confirmBulkAction = () => {
    if (!bulkAction) return;
    setProducts((prev) =>
      prev.map((p) =>
        selectedIds.includes(p.id)
          ? { ...p, status: bulkAction.type === "hide" ? "Hidden" : bulkAction.type === "restore" ? "Active" : p.status, approval: bulkAction.type === "approve" ? "Approved" : p.approval }
          : p
      )
    );
    const labels = { approve: "approved", hide: "hidden", restore: "restored" };
    showToast(`${selectedIds.length} product(s) ${labels[bulkAction.type]}.`);
    setSelectedIds([]);
    setBulkAction(null);
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setApprovalFilter("all");
    setReportFilter("all");
    setSellerFilter("all");
    setCategoryFilter("all");
    setCurrentPage(1);
  };

  const uniqueSellers = useMemo(() => {
    const map = new Map();
    products.forEach((p) => map.set(p.sellerId, p.seller));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [products]);

  const overview = {
    total: products.length,
    active: products.filter((p) => p.status === "Active").length,
    pending: products.filter((p) => p.approval === "Pending").length,
    reported: products.filter((p) => p.reports > 0).length,
    removed: products.filter((p) => p.status === "Removed").length,
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
        <h1 className="font-display text-h2 text-text-primary">Product Management</h1>
        <p className="font-body-md text-body-md text-text-muted mt-1">
          Manage, review, and moderate products across the NUVORA marketplace.
        </p>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3">
          <StatCard title="Total Products" value={overview.total} />
          <StatCard title="Active Products" value={overview.active} />
          <StatCard title="Pending Approval" value={overview.pending} />
          <StatCard title="Reported Products" value={overview.reported} />
          <StatCard title="Hidden/Removed" value={overview.removed} />
        </div>
      </div>

      {/* Search & Filters */}
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
                placeholder="Search by product name, ID, seller, or category..."
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
              {PRODUCT_STATUS_FILTERS.map((f) => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </select>
            <select
              value={approvalFilter}
              onChange={(e) => { setApprovalFilter(e.target.value); setCurrentPage(1); }}
              className="rounded-lg bg-surface-container-high border border-outline-variant/30 px-3 py-2 font-label-sm text-label-sm text-text-primary outline-none transition-all focus:border-lime"
            >
              {PRODUCT_APPROVAL_FILTERS.map((f) => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </select>
            <select
              value={sellerFilter}
              onChange={(e) => { setSellerFilter(e.target.value); setCurrentPage(1); }}
              className="rounded-lg bg-surface-container-high border border-outline-variant/30 px-3 py-2 font-label-sm text-label-sm text-text-primary outline-none transition-all focus:border-lime"
            >
              <option value="all">All Sellers</option>
              {uniqueSellers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
              className="rounded-lg bg-surface-container-high border border-outline-variant/30 px-3 py-2 font-label-sm text-label-sm text-text-primary outline-none transition-all focus:border-lime"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.filter((c) => c !== "All Products").map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={reportFilter}
              onChange={(e) => { setReportFilter(e.target.value); setCurrentPage(1); }}
              className="rounded-lg bg-surface-container-high border border-outline-variant/30 px-3 py-2 font-label-sm text-label-sm text-text-primary outline-none transition-all focus:border-lime"
            >
              {PRODUCT_REPORT_FILTERS.map((f) => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-lime/30 bg-lime/5 p-4">
          <span className="font-label-sm text-label-sm text-text-primary">
            {selectedIds.length} selected
          </span>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={handleBulkApprove} className="text-accent border-lime/30 hover:bg-lime/10">
              Approve Selected
            </Button>
            <Button type="button" variant="outline" onClick={handleBulkHide} className="text-red-400 border-red-400/30 hover:bg-red-400/10">
              Hide Selected
            </Button>
            <Button type="button" variant="outline" onClick={handleBulkRestore} className="text-accent border-lime/30 hover:bg-lime/10">
              Restore Selected
            </Button>
            <Button type="button" variant="ghost" onClick={() => setSelectedIds([])}>
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Products Table - Desktop */}
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
                    aria-label="Select all products"
                  />
                </th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Product</th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Seller</th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Category</th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Price</th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Stock</th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Approval</th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Status</th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Reports</th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Added</th>
                <th className="text-right font-label-sm text-label-sm text-text-muted pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((product) => (
                <tr key={product.id} className={`border-b border-outline-variant/10 last:border-0 ${selectedIds.includes(product.id) ? "bg-lime/5" : ""}`}>
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(product.id)}
                      onChange={() => toggleSelect(product.id)}
                      className="h-4 w-4 rounded border-outline-variant/30 bg-surface-container-high text-lime focus:ring-lime"
                      aria-label={`Select ${product.name}`}
                    />
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden border border-outline-variant/20">
                        <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <p className="font-label-sm text-label-sm text-text-primary">{product.name}</p>
                        <p className="font-body-md text-xs text-text-muted">{product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 font-body-md text-sm text-text-primary">{product.seller}</td>
                  <td className="py-4 font-body-md text-sm text-text-muted">{product.category}</td>
                  <td className="py-4 font-body-md text-sm text-text-primary">₦{product.price.toLocaleString()}</td>
                  <td className="py-4 font-body-md text-sm text-text-primary">{product.stock}</td>
                  <td className="py-4">
                    <Badge variant={product.approval === "Approved" ? "success" : product.approval === "Pending" ? "neutral" : "default"}>{product.approval}</Badge>
                  </td>
                  <td className="py-4">
                    <Badge variant={product.status === "Active" ? "lime" : product.status === "Hidden" ? "neutral" : "default"}>{product.status}</Badge>
                  </td>
                  <td className="py-4 font-body-md text-sm text-text-primary">{product.reports}</td>
                  <td className="py-4 font-body-md text-sm text-text-muted">
                    {new Date(product.added).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button type="button" onClick={() => setDetailsProduct(product)} className="font-label-sm text-label-sm text-accent hover:text-accent/80 transition-colors">View</button>
                      {product.approval === "Pending" && (
                        <>
                          <button type="button" onClick={() => { setDetailsProduct(product); }} className="font-label-sm text-label-sm text-accent hover:text-accent/80 transition-colors">Approve</button>
                          <button type="button" onClick={() => { setDetailsProduct(product); }} className="font-label-sm text-label-sm text-red-400 hover:text-red-300 transition-colors">Reject</button>
                        </>
                      )}
                      {product.status === "Active" && (
                        <button type="button" onClick={() => setHideProduct(product)} className="font-label-sm text-label-sm text-red-400 hover:text-red-300 transition-colors">Hide</button>
                      )}
                      {product.status === "Hidden" && (
                        <button type="button" onClick={() => setRestoreProduct(product)} className="font-label-sm text-label-sm text-accent hover:text-accent/80 transition-colors">Restore</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Products Cards - Mobile */}
      <div className="md:hidden mb-6">
        {paginatedProducts.map((product) => (
          <MobileProductCard
            key={product.id}
            product={product}
            isSelected={selectedIds.includes(product.id)}
            onToggleSelect={() => toggleSelect(product.id)}
            onViewDetails={(p) => setDetailsProduct(p)}
            onApprove={(p) => setDetailsProduct(p)}
            onReject={(p) => setDetailsProduct(p)}
            onHide={(p) => setHideProduct(p)}
            onRestore={(p) => setRestoreProduct(p)}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="glass-panel rounded-xl p-12 text-center mb-6">
          <span className="material-symbols text-4xl text-text-muted mb-3">inventory_2</span>
          <p className="font-body-md text-body-md text-text-muted mb-4">No products found</p>
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

      {/* Product Details Modal */}
      <ProductDetailsModal
        product={detailsProduct}
        onClose={() => setDetailsProduct(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        onHide={(p) => { setDetailsProduct(null); handleHide(p); }}
        onRestore={(p) => { setDetailsProduct(null); confirmRestore(); setRestoreProduct(null); }}
        onDismissReport={(p) => { setDetailsProduct(null); handleDismissReport(p); }}
        onRemove={(p) => { setDetailsProduct(null); handleRemove(p); }}
      />

      {/* Hide Confirmation */}
      <ConfirmModal
        open={!!hideProduct}
        title="Hide this product?"
        message={`${hideProduct?.name} will no longer be visible to marketplace shoppers while hidden.`}
        confirmLabel="Hide Product"
        danger
        onConfirm={confirmHide}
        onCancel={() => setHideProduct(null)}
      />

      {/* Restore Confirmation */}
      <ConfirmModal
        open={!!restoreProduct}
        title="Restore this product?"
        message={`Restore visibility for ${restoreProduct?.name}?`}
        confirmLabel="Restore Product"
        onConfirm={confirmRestore}
        onCancel={() => setRestoreProduct(null)}
      />

      {/* Remove Confirmation */}
      <ConfirmModal
        open={!!removeProduct}
        title="Remove this product?"
        message={`This will permanently remove ${removeProduct?.name} from the marketplace. Continue?`}
        confirmLabel="Remove Product"
        danger
        onConfirm={confirmRemove}
        onCancel={() => setRemoveProduct(null)}
      />

      {/* Bulk Action Confirmation */}
      <ConfirmModal
        open={!!bulkAction}
        title={bulkAction?.type === "approve" ? "Approve selected products?" : bulkAction?.type === "hide" ? "Hide selected products?" : "Restore selected products?"}
        message={`This will change the status of ${selectedIds.length} product(s). Continue?`}
        confirmLabel={bulkAction?.type === "approve" ? "Approve Selected" : bulkAction?.type === "hide" ? "Hide Selected" : "Restore Selected"}
        danger={bulkAction?.type === "hide"}
        onConfirm={confirmBulkAction}
        onCancel={() => setBulkAction(null)}
      />
    </div>
  );
}
