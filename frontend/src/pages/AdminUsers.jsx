import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button.jsx";
import Badge from "../components/ui/Badge.jsx";
import {
  ADMIN_USERS,
  USER_STATUS_FILTERS,
  USER_PAGE_SIZE,
} from "../data/adminDashboard.js";

const ITEMS_PER_PAGE = USER_PAGE_SIZE;

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

function ConfirmModal({ open, title, message, confirmLabel, onConfirm, onCancel, danger = false }) {
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
        <p className="font-body-md text-body-md text-text-muted mb-6">{message}</p>
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

function UserDetailsModal({ user, onClose, onSuspend, onActivate, onVerify }) {
  if (!user) return null;
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="User Details"
    >
      <div className="absolute inset-0 bg-obsidian/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-xl border border-outline-variant/20 bg-surface-container p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-h4 text-h4 text-text-primary">User Details</h3>
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
            <img src={user.avatar} alt={user.firstName} className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="font-h4 text-h4 text-text-primary">{user.firstName} {user.lastName}</p>
            <p className="font-body-md text-sm text-text-muted">{user.id}</p>
          </div>
        </div>
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between rounded-lg border border-outline-variant/20 bg-surface-container-high p-3">
            <span className="font-label-sm text-label-sm text-text-muted">Email</span>
            <span className="font-body-md text-sm text-text-primary">{user.email}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-outline-variant/20 bg-surface-container-high p-3">
            <span className="font-label-sm text-label-sm text-text-muted">Phone</span>
            <span className="font-body-md text-sm text-text-primary">{user.phone}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-outline-variant/20 bg-surface-container-high p-3">
            <span className="font-label-sm text-label-sm text-text-muted">Status</span>
            <Badge variant={user.status === "Active" ? "success" : "default"}>{user.status}</Badge>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-outline-variant/20 bg-surface-container-high p-3">
            <span className="font-label-sm text-label-sm text-text-muted">Verified</span>
            <Badge variant={user.verified ? "lime" : "neutral"}>{user.verified ? "Verified" : "Unverified"}</Badge>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-outline-variant/20 bg-surface-container-high p-3">
            <span className="font-label-sm text-label-sm text-text-muted">Joined</span>
            <span className="font-body-md text-sm text-text-primary">{new Date(user.joined).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
          </div>
        </div>
        <div className="mb-6">
          <h4 className="font-label-sm text-label-sm text-text-primary mb-3">Activity</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-outline-variant/20 bg-surface-container-high p-3 text-center">
              <p className="font-h4 text-h4 text-text-primary">{user.orders}</p>
              <p className="font-body-md text-xs text-text-muted">Orders</p>
            </div>
            <div className="rounded-lg border border-outline-variant/20 bg-surface-container-high p-3 text-center">
              <p className="font-h4 text-h4 text-text-primary">{user.totalSpent}</p>
              <p className="font-body-md text-xs text-text-muted">Total Spent</p>
            </div>
            <div className="rounded-lg border border-outline-variant/20 bg-surface-container-high p-3 text-center">
              <p className="font-h4 text-h4 text-text-primary">{user.reviewsSubmitted}</p>
              <p className="font-body-md text-xs text-text-muted">Reviews</p>
            </div>
          </div>
        </div>
        <div className="mb-6">
          <h4 className="font-label-sm text-label-sm text-text-primary mb-3">Recent Activity</h4>
          <div className="space-y-2">
            {user.activity.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-text-muted">
                <span className="material-symbols text-xs text-accent" style={{ fontVariationSettings: "'FILL' 0" }}>circle</span>
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          {user.status === "Active" ? (
            <Button type="button" variant="outline" onClick={() => onSuspend(user)} className="flex-1">
              Suspend Account
            </Button>
          ) : (
            <Button type="button" onClick={() => onActivate(user)} className="flex-1">
              Activate Account
            </Button>
          )}
          {!user.verified && (
            <Button type="button" variant="outline" onClick={() => onVerify(user)} className="flex-1">
              Verify Account
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

function MobileUserCard({ user, isSelected, onToggleSelect, onViewProfile, onSuspend, onActivate, onVerify }) {
  return (
    <div className="rounded-xl border border-outline-variant/20 bg-surface-container p-4 shadow-lg mb-4">
      <div className="flex items-start gap-3 mb-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="mt-1 h-4 w-4 rounded border-outline-variant/30 bg-surface-container-high text-lime focus:ring-lime"
          aria-label={`Select ${user.firstName} ${user.lastName}`}
        />
        <div className="h-10 w-10 shrink-0 rounded-full overflow-hidden border border-outline-variant/30">
          <img src={user.avatar} alt={user.firstName} className="h-full w-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-label-sm text-label-sm text-text-primary truncate">{user.firstName} {user.lastName}</p>
          <p className="font-body-md text-xs text-text-muted truncate">{user.email}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        <Badge variant={user.status === "Active" ? "success" : "default"}>{user.status}</Badge>
        <Badge variant={user.verified ? "lime" : "neutral"}>{user.verified ? "Verified" : "Unverified"}</Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => onViewProfile(user)} className="font-label-sm text-label-sm text-accent hover:text-accent/80 transition-colors">View Profile</button>
        {user.status === "Active" ? (
          <button type="button" onClick={() => onSuspend(user)} className="font-label-sm text-label-sm text-red-400 hover:text-red-300 transition-colors">Suspend</button>
        ) : (
          <button type="button" onClick={() => onActivate(user)} className="font-label-sm text-label-sm text-accent hover:text-accent/80 transition-colors">Activate</button>
        )}
        {!user.verified && (
          <button type="button" onClick={() => onVerify(user)} className="font-label-sm text-label-sm text-text-muted hover:text-text-primary transition-colors">Verify</button>
        )}
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState(ADMIN_USERS);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [detailsUser, setDetailsUser] = useState(null);
  const [suspendUser, setSuspendUser] = useState(null);
  const [activateUser, setActivateUser] = useState(null);
  const [verifyUser, setVerifyUser] = useState(null);
  const [bulkAction, setBulkAction] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const term = search.trim().toLowerCase();
      if (term) {
        const match =
          user.firstName.toLowerCase().includes(term) ||
          user.lastName.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term) ||
          user.phone.includes(term) ||
          user.id.toLowerCase().includes(term);
        if (!match) return false;
      }
      if (filter === "active") return user.status === "Active";
      if (filter === "suspended") return user.status === "Suspended";
      if (filter === "verified") return user.verified;
      if (filter === "unverified") return !user.verified;
      return true;
    });
  }, [users, search, filter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedUsers = filteredUsers.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const allSelected = paginatedUsers.length > 0 && paginatedUsers.every((u) => selectedIds.includes(u.id));
  const someSelected = paginatedUsers.some((u) => selectedIds.includes(u.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !paginatedUsers.some((u) => u.id === id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...paginatedUsers.map((u) => u.id)])]);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSuspend = (user) => {
    setSuspendUser(user);
  };

  const confirmSuspend = () => {
    if (!suspendUser) return;
    setUsers((prev) => prev.map((u) => (u.id === suspendUser.id ? { ...u, status: "Suspended" } : u)));
    setSelectedIds((prev) => prev.filter((id) => id !== suspendUser.id));
    setSuspendUser(null);
    showToast(`Account ${suspendUser.id} suspended.`);
  };

  const handleActivate = (user) => {
    setActivateUser(user);
  };

  const confirmActivate = () => {
    if (!activateUser) return;
    setUsers((prev) => prev.map((u) => (u.id === activateUser.id ? { ...u, status: "Active" } : u)));
    setSelectedIds((prev) => prev.filter((id) => id !== activateUser.id));
    setActivateUser(null);
    showToast(`Account ${activateUser.id} activated.`);
  };

  const handleVerify = (user) => {
    setVerifyUser(user);
  };

  const confirmVerify = () => {
    if (!verifyUser) return;
    setUsers((prev) => prev.map((u) => (u.id === verifyUser.id ? { ...u, verified: true } : u)));
    setSelectedIds((prev) => prev.filter((id) => id !== verifyUser.id));
    setVerifyUser(null);
    showToast(`Account ${verifyUser.id} verified.`);
  };

  const handleBulkSuspend = () => {
    setBulkAction({ type: "suspend" });
  };

  const handleBulkActivate = () => {
    setBulkAction({ type: "activate" });
  };

  const confirmBulkAction = () => {
    if (!bulkAction) return;
    setUsers((prev) =>
      prev.map((u) =>
        selectedIds.includes(u.id)
          ? { ...u, status: bulkAction.type === "suspend" ? "Suspended" : "Active" }
          : u
      )
    );
    const label = bulkAction.type === "suspend" ? "suspended" : "activated";
    showToast(`${selectedIds.length} account(s) ${label}.`);
    setSelectedIds([]);
    setBulkAction(null);
  };

  const exportSelectedCSV = () => {
    const selected = users.filter((u) => selectedIds.includes(u.id));
    if (!selected.length) return;
    const header = "ID,Name,Email,Phone,Status,Verified,Joined\n";
    const rows = selected
      .map((u) => `${u.id},"${u.firstName} ${u.lastName}",${u.email},${u.phone},${u.status},${u.verified ? "Yes" : "No"},${u.joined}`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nuvora-users.csv";
    a.click();
    URL.revokeObjectURL(url);
    showToast("CSV exported successfully.");
  };

  const resetFilters = () => {
    setSearch("");
    setFilter("all");
    setCurrentPage(1);
  };

  const overview = {
    total: users.length,
    active: users.filter((u) => u.status === "Active").length,
    verified: users.filter((u) => u.verified).length,
    suspended: users.filter((u) => u.status === "Suspended").length,
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
        <h1 className="font-display text-h2 text-text-primary">User Management</h1>
        <p className="font-body-md text-body-md text-text-muted mt-1">
          View, monitor, and manage NUVORA customer accounts.
        </p>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard title="Total Users" value={overview.total} />
          <StatCard title="Active Users" value={overview.active} />
          <StatCard title="Verified Users" value={overview.verified} />
          <StatCard title="Suspended Users" value={overview.suspended} />
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
              placeholder="Search by name, email, phone, or user ID..."
              className="block w-full rounded-lg bg-surface-container-high border border-outline-variant/30 px-4 py-2.5 font-body-md text-text-primary outline-none transition-all placeholder:text-text-muted/60 focus:border-lime"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {USER_STATUS_FILTERS.map((f) => (
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
            <Button type="button" variant="ghost" onClick={exportSelectedCSV}>
              Export CSV
            </Button>
            <Button type="button" variant="ghost" onClick={() => setSelectedIds([])}>
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Users Table - Desktop */}
      <div className="glass-panel rounded-xl shadow-lg relative overflow-hidden mb-6 hidden md:block">
        <div
          className="absolute top-0 right-0 h-64 w-64 bg-lime/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative z-10 overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-outline-variant/20">
                <th className="p-4 w-12">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-outline-variant/30 bg-surface-container-high text-lime focus:ring-lime"
                    aria-label="Select all users"
                  />
                </th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">User</th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Email</th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Phone</th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Verification</th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Status</th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Orders</th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Joined</th>
                <th className="text-right font-label-sm text-label-sm text-text-muted pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user) => (
                <tr key={user.id} className={`border-b border-outline-variant/10 last:border-0 ${selectedIds.includes(user.id) ? "bg-lime/5" : ""}`}>
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(user.id)}
                      onChange={() => toggleSelect(user.id)}
                      className="h-4 w-4 rounded border-outline-variant/30 bg-surface-container-high text-lime focus:ring-lime"
                      aria-label={`Select ${user.firstName} ${user.lastName}`}
                    />
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 shrink-0 rounded-full overflow-hidden border border-outline-variant/30">
                        <img src={user.avatar} alt={user.firstName} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <p className="font-label-sm text-label-sm text-text-primary">{user.firstName} {user.lastName}</p>
                        <p className="font-body-md text-xs text-text-muted">{user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 font-body-md text-sm text-text-primary">{user.email}</td>
                  <td className="py-4 font-body-md text-sm text-text-muted">{user.phone}</td>
                  <td className="py-4">
                    <Badge variant={user.verified ? "lime" : "neutral"}>{user.verified ? "Verified" : "Unverified"}</Badge>
                  </td>
                  <td className="py-4">
                    <Badge variant={user.status === "Active" ? "success" : "default"}>{user.status}</Badge>
                  </td>
                  <td className="py-4 font-body-md text-sm text-text-primary">{user.orders}</td>
                  <td className="py-4 font-body-md text-sm text-text-muted">
                    {new Date(user.joined).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button type="button" onClick={() => setDetailsUser(user)} className="font-label-sm text-label-sm text-accent hover:text-accent/80 transition-colors">View</button>
                      {user.status === "Active" ? (
                        <button type="button" onClick={() => handleSuspend(user)} className="font-label-sm text-label-sm text-red-400 hover:text-red-300 transition-colors">Suspend</button>
                      ) : (
                        <button type="button" onClick={() => handleActivate(user)} className="font-label-sm text-label-sm text-accent hover:text-accent/80 transition-colors">Activate</button>
                      )}
                      {!user.verified && (
                        <button type="button" onClick={() => handleVerify(user)} className="font-label-sm text-label-sm text-text-muted hover:text-text-primary transition-colors">Verify</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Users Cards - Mobile */}
      <div className="md:hidden mb-6">
        {paginatedUsers.map((user) => (
          <MobileUserCard
            key={user.id}
            user={user}
            isSelected={selectedIds.includes(user.id)}
            onToggleSelect={() => toggleSelect(user.id)}
            onViewProfile={(u) => setDetailsUser(u)}
            onSuspend={handleSuspend}
            onActivate={handleActivate}
            onVerify={handleVerify}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div className="glass-panel rounded-xl p-12 text-center mb-6">
          <span className="material-symbols text-4xl text-text-muted mb-3">people</span>
          <p className="font-body-md text-body-md text-text-muted mb-4">No users found</p>
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

      {/* User Details Modal */}
      <UserDetailsModal
        user={detailsUser}
        onClose={() => setDetailsUser(null)}
        onSuspend={(u) => { setDetailsUser(null); handleSuspend(u); }}
        onActivate={(u) => { setDetailsUser(null); handleActivate(u); }}
        onVerify={(u) => { setDetailsUser(null); handleVerify(u); }}
      />

      {/* Suspend Confirmation */}
      <ConfirmModal
        open={!!suspendUser}
        title="Suspend this account?"
        message={`${suspendUser?.firstName} ${suspendUser?.lastName} will no longer be able to use the marketplace normally while suspended.`}
        confirmLabel="Suspend Account"
        danger
        onConfirm={confirmSuspend}
        onCancel={() => setSuspendUser(null)}
      />

      {/* Activate Confirmation */}
      <ConfirmModal
        open={!!activateUser}
        title="Activate this account?"
        message={`Restore marketplace access for ${activateUser?.firstName} ${activateUser?.lastName}?`}
        confirmLabel="Activate Account"
        onConfirm={confirmActivate}
        onCancel={() => setActivateUser(null)}
      />

      {/* Verify Confirmation */}
      <ConfirmModal
        open={!!verifyUser}
        title="Verify this account?"
        message={`Mark ${verifyUser?.firstName} ${verifyUser?.lastName} as verified? This is a mock frontend action only.`}
        confirmLabel="Verify Account"
        onConfirm={confirmVerify}
        onCancel={() => setVerifyUser(null)}
      />

      {/* Bulk Action Confirmation */}
      <ConfirmModal
        open={!!bulkAction}
        title={bulkAction?.type === "suspend" ? "Suspend selected accounts?" : "Activate selected accounts?"}
        message={`This will change the status of ${selectedIds.length} account(s). Continue?`}
        confirmLabel={bulkAction?.type === "suspend" ? "Suspend Selected" : "Activate Selected"}
        danger={bulkAction?.type === "suspend"}
        onConfirm={confirmBulkAction}
        onCancel={() => setBulkAction(null)}
      />
    </div>
  );
}
