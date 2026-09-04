import React, { useState, useMemo } from "react";
import Button from "../components/ui/Button.jsx";
import Badge from "../components/ui/Badge.jsx";
import {
  SECURITY_OVERVIEW,
  SECURITY_ALERTS,
  AUTH_ACTIVITY,
  FAILED_LOGINS,
  SUSPICIOUS_ACTIVITIES,
  ACTIVE_SESSIONS,
  ADMIN_SECURITY,
  SECURITY_CONTROLS,
  RISK_DISTRIBUTION,
  SECURITY_ACTIVITY_TIMELINE,
  SECURITY_FILTERS,
  SECURITY_PAGE_SIZE,
} from "../data/adminDashboard.js";

const ITEMS_PER_PAGE = SECURITY_PAGE_SIZE;

function StatCard({ title, value, icon, sub }) {
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
          {sub && <p className="font-body-md text-xs text-text-muted mt-0.5">{sub}</p>}
        </div>
      </div>
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
        <p className="font-body-md text-body-md text-text-muted mb-4">{message}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" variant="primary" onClick={onConfirm} className={danger ? "!bg-red-500 hover:!bg-red-600 text-white" : ""}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

function SeverityBadge({ severity }) {
  const variant = {
    Critical: "default",
    High: "default",
    Medium: "neutral",
    Low: "lime",
  }[severity] || "default";
  return <Badge variant={variant}>{severity}</Badge>;
}

function AlertDetailsModal({ alert, onClose }) {
  if (!alert) return null;
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Alert Details"
    >
      <div className="absolute inset-0 bg-obsidian/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-xl border border-outline-variant/20 bg-surface-container p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-h4 text-h4 text-text-primary">Alert {alert.id}</h3>
            <p className="font-body-md text-sm text-text-muted">{alert.time}</p>
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
        <div className="flex flex-wrap gap-2 mb-4">
          <SeverityBadge severity={alert.severity} />
          <Badge variant="neutral">{alert.type}</Badge>
          <Badge variant={alert.status === "Resolved" ? "success" : alert.status === "Investigating" ? "lime" : "default"}>{alert.status}</Badge>
        </div>
        <div className="space-y-4">
          <div className="rounded-lg border border-outline-variant/20 bg-surface-container-high p-4">
            <p className="font-label-sm text-label-sm text-text-muted mb-1">Description</p>
            <p className="font-body-md text-sm text-text-primary">{alert.description}</p>
          </div>
          <div className="rounded-lg border border-outline-variant/20 bg-surface-container-high p-4">
            <p className="font-label-sm text-label-sm text-text-muted mb-1">Affected Account</p>
            <p className="font-body-md text-sm text-text-primary">{alert.affectedAccount}</p>
          </div>
          <div className="rounded-lg border border-outline-variant/20 bg-surface-container-high p-4">
            <p className="font-label-sm text-label-sm text-text-muted mb-1">Source</p>
            <p className="font-body-md text-sm text-text-primary">{alert.source}</p>
          </div>
          <div className="rounded-lg border border-outline-variant/20 bg-surface-container-high p-4">
            <p className="font-label-sm text-label-sm text-text-muted mb-1">Recommended Response</p>
            <p className="font-body-md text-sm text-text-primary">{alert.recommendedResponse}</p>
          </div>
        </div>
        <div className="mt-6">
          <Button type="button" variant="ghost" onClick={onClose} className="w-full sm:w-auto">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

function AuthActivityChart({ data }) {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const max = Math.max(...values);
  return (
    <div className="flex items-end gap-2 h-48">
      {keys.map((key) => {
        const value = data[key];
        const height = max > 0 ? (value / max) * 100 : 0;
        return (
          <div key={key} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full rounded-t-lg bg-lime/20 relative overflow-hidden" style={{ height: `${height}%`, minHeight: "8px" }}>
              <div className="absolute inset-0 bg-lime/60 rounded-t-lg" />
            </div>
            <span className="font-label-sm text-label-sm text-text-muted text-center truncate w-full">{key}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminSecurity() {
  const [alerts, setAlerts] = useState(SECURITY_ALERTS);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [eventTypeFilter, setEventTypeFilter] = useState("all");
  const [alertStatusFilter, setAlertStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [bulkAction, setBulkAction] = useState(null);
  const [toast, setToast] = useState(null);
  const [authTimeRange, setAuthTimeRange] = useState("24 Hours");

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const term = search.trim().toLowerCase();
      if (term) {
        const match =
          alert.id.toLowerCase().includes(term) ||
          alert.description.toLowerCase().includes(term) ||
          alert.affectedAccount.toLowerCase().includes(term) ||
          alert.type.toLowerCase().includes(term);
        if (!match) return false;
      }
      if (severityFilter !== "all" && alert.severity.toLowerCase() !== severityFilter) return false;
      if (eventTypeFilter !== "all" && alert.type.toLowerCase() !== eventTypeFilter) return false;
      if (alertStatusFilter !== "all" && alert.status.toLowerCase() !== alertStatusFilter) return false;
      return true;
    });
  }, [alerts, search, severityFilter, eventTypeFilter, alertStatusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredAlerts.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedAlerts = filteredAlerts.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const handleResolve = (alert) => {
    setAlerts((prev) => prev.map((a) => (a.id === alert.id ? { ...a, status: "Resolved" } : a)));
    showToast(`Alert ${alert.id} marked as resolved.`);
  };

  const handleDismiss = (alert) => {
    setAlerts((prev) => prev.map((a) => (a.id === alert.id ? { ...a, status: "Dismissed" } : a)));
    showToast(`Alert ${alert.id} dismissed.`);
  };

  const confirmBulkAction = () => {
    if (!bulkAction) return;
    setAlerts((prev) =>
      prev.map((a) => {
        if (!bulkAction.selectedIds.includes(a.id)) return a;
        if (bulkAction.type === "resolve") return { ...a, status: "Resolved" };
        if (bulkAction.type === "dismiss") return { ...a, status: "Dismissed" };
        return a;
      })
    );
    const labels = { resolve: "resolved", dismiss: "dismissed" };
    showToast(`${bulkAction.selectedIds.length} alert(s) ${labels[bulkAction.type]}.`);
    setBulkAction(null);
  };

  const exportAlertsCSV = () => {
    const dataToExport = filteredAlerts;
    if (!dataToExport.length) return;
    const header = "ID,Severity,Type,Description,Status,Affected Account,Time\n";
    const rows = dataToExport
      .map((a) => `${a.id},"${a.severity}","${a.type}","${a.description.replace(/"/g, '""')}","${a.status}","${a.affectedAccount}","${a.time}"`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nuvora-security-alerts.csv";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Alerts exported successfully.");
  };

  const authData = AUTH_ACTIVITY[authTimeRange] || AUTH_ACTIVITY["24 Hours"];
  const authChartData = {
    successfulLogins: authData.successfulLogins,
    failedLogins: authData.failedLogins,
    lockouts: authData.accountLockouts,
    resets: authData.passwordResets,
  };

  const riskMax = Math.max(...RISK_DISTRIBUTION.map((r) => r.count), 1);

  const statusBadgeVariant = (status) => {
    switch (status) {
      case "Active":
        return "success";
      case "Idle":
        return "neutral";
      case "Blocked":
        return "default";
      case "Monitoring":
        return "neutral";
      case "Resolved":
        return "success";
      case "Investigating":
        return "lime";
      case "Open":
        return "default";
      case "Dismissed":
        return "neutral";
      case "Protected":
        return "success";
      case "Enabled":
        return "success";
      case "Configuration Required":
        return "neutral";
      default:
        return "default";
    }
  };

  const timelineTypeColor = (type) => {
    switch (type) {
      case "success":
        return "text-accent";
      case "warning":
        return "text-yellow-400";
      case "info":
        return "text-blue-400";
      case "error":
        return "text-red-400";
      default:
        return "text-text-muted";
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
          <h1 className="font-display text-h2 text-text-primary">Security Command Center</h1>
          <p className="font-body-md text-body-md text-text-muted mt-1">
            Monitor threats, manage alerts, and protect the NUVORA platform.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={exportAlertsCSV}>Export Alerts</Button>
          <Button type="button" variant="ghost" onClick={() => showToast("Security data refreshed.")}>
            <span className="material-symbols text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>refresh</span>
            Refresh
          </Button>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Security Score" value={SECURITY_OVERVIEW.score} icon="shield" sub={SECURITY_OVERVIEW.status} />
        <StatCard title="Active Sessions" value={SECURITY_OVERVIEW.activeSessions.toLocaleString()} icon="lock" />
        <StatCard title="Failed Logins" value={SECURITY_OVERVIEW.failedLogins} icon="warning" />
        <StatCard title="Suspicious Activities" value={SECURITY_OVERVIEW.suspiciousActivities} icon="visibility" />
        <StatCard title="Blocked Requests" value={SECURITY_OVERVIEW.blockedRequests.toLocaleString()} icon="block" />
        <StatCard title="Open Alerts" value={SECURITY_OVERVIEW.openAlerts} icon="notifications" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <div className="glass-panel rounded-xl p-6 md:p-8 shadow-lg relative overflow-hidden">
          <div
            className="absolute top-0 right-0 h-64 w-64 bg-lime/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"
            aria-hidden="true"
          />
          <div className="relative z-10 flex flex-col items-center justify-center">
            <div className="relative h-40 w-40">
              <svg viewBox="0 0 36 36" className="h-full w-full">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="rgb(var(--nuvora-outline-variant) / <alpha-value>)"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="rgb(var(--nuvora-lime) / <alpha-value>)"
                  strokeWidth="3"
                  strokeDasharray={`${SECURITY_OVERVIEW.score}, 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-3xl text-text-primary">{SECURITY_OVERVIEW.score}</span>
                <span className="font-label-sm text-label-sm text-text-muted">/ 100</span>
              </div>
            </div>
            <h3 className="font-h4 text-h4 text-text-primary mt-4">Security Health</h3>
            <p className="font-body-md text-body-md text-text-muted mt-1">Platform protection score</p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-lime/30 bg-lime/10 px-3 py-1.5 text-xs font-semibold text-accent">
              <span className="material-symbols text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified_user
              </span>
              {SECURITY_OVERVIEW.status}
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-6 md:p-8 shadow-lg relative overflow-hidden">
          <div
            className="absolute top-0 right-0 h-64 w-64 bg-lime/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"
            aria-hidden="true"
          />
          <div className="relative z-10 mb-6">
            <h2 className="font-h3 text-h3 text-text-primary">Risk Distribution</h2>
            <p className="font-body-md text-body-md text-text-muted mt-1">Active risk levels across the platform.</p>
          </div>
          <div className="relative z-10 space-y-3">
            {RISK_DISTRIBUTION.map(({ level, count, pct }) => {
              const barColor =
                level === "Critical"
                  ? "bg-red-500"
                  : level === "High"
                  ? "bg-orange-500"
                  : level === "Medium"
                  ? "bg-yellow-500"
                  : "bg-lime";
              return (
                <div key={level} className="flex items-center gap-3">
                  <span className="font-label-sm text-label-sm text-text-primary w-20">{level}</span>
                  <div className="flex-1 h-3 rounded-full bg-surface-high overflow-hidden">
                    <div
                      className={`h-full rounded-full ${barColor} progress-line`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="font-body-md text-xs text-text-muted w-12 text-right">{count} ({pct}%)</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-panel rounded-xl p-6 md:p-8 shadow-lg relative overflow-hidden">
          <div
            className="absolute top-0 right-0 h-64 w-64 bg-lime/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"
            aria-hidden="true"
          />
          <div className="relative z-10 mb-6">
            <h2 className="font-h3 text-h3 text-text-primary">Security Controls</h2>
            <p className="font-body-md text-body-md text-text-muted mt-1">Current platform security posture.</p>
          </div>
          <div className="relative z-10 space-y-3">
            {SECURITY_CONTROLS.map((control) => (
              <div key={control.name} className="flex items-center justify-between">
                <span className="font-body-md text-sm text-text-primary">{control.name}</span>
                <Badge variant={statusBadgeVariant(control.status)}>{control.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-xl p-6 md:p-8 shadow-lg relative overflow-hidden mb-6">
        <div
          className="absolute top-0 right-0 h-64 w-64 bg-lime/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative z-10 mb-6">
          <h2 className="font-h3 text-h3 text-text-primary">Security Alerts</h2>
          <p className="font-body-md text-body-md text-text-muted mt-1">Active and resolved security incidents.</p>
        </div>
        <div className="relative z-10 overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-outline-variant/20">
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Alert ID</th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Severity</th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Type</th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Description</th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Status</th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Time</th>
                <th className="text-right font-label-sm text-label-sm text-text-muted pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAlerts.map((alert) => (
                <tr key={alert.id} className="border-b border-outline-variant/10 last:border-0">
                  <td className="py-4 font-label-sm text-label-sm text-text-primary">{alert.id}</td>
                  <td className="py-4">
                    <SeverityBadge severity={alert.severity} />
                  </td>
                  <td className="py-4">
                    <Badge variant="neutral">{alert.type}</Badge>
                  </td>
                  <td className="py-4 font-body-md text-sm text-text-primary max-w-xs truncate">{alert.description}</td>
                  <td className="py-4">
                    <Badge variant={statusBadgeVariant(alert.status)}>{alert.status}</Badge>
                  </td>
                  <td className="py-4 font-body-md text-sm text-text-muted">{alert.time}</td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedAlert(alert)}
                        className="font-label-sm text-label-sm text-accent hover:text-accent/80 transition-colors"
                      >
                        View
                      </button>
                      {alert.status !== "Resolved" && alert.status !== "Dismissed" && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleResolve(alert)}
                            className="font-label-sm text-label-sm text-accent hover:text-accent/80 transition-colors"
                          >
                            Resolve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDismiss(alert)}
                            className="font-label-sm text-label-sm text-text-muted hover:text-text-primary transition-colors"
                          >
                            Dismiss
                          </button>
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

      {filteredAlerts.length === 0 && (
        <div className="glass-panel rounded-xl p-12 text-center mb-6">
          <span className="material-symbols text-4xl text-text-muted mb-3">security</span>
          <p className="font-body-md text-body-md text-text-muted mb-4">No alerts found</p>
          <p className="font-body-md text-sm text-text-muted mb-4">Try adjusting your search or filters.</p>
          <Button type="button" onClick={() => { setSearch(""); setSeverityFilter("all"); setEventTypeFilter("all"); setAlertStatusFilter("all"); setCurrentPage(1); }}>
            Reset Filters
          </Button>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mb-8">
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <div className="glass-panel rounded-xl p-6 md:p-8 shadow-lg relative overflow-hidden">
          <div
            className="absolute top-0 right-0 h-64 w-64 bg-lime/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"
            aria-hidden="true"
          />
          <div className="relative z-10 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="font-h3 text-h3 text-text-primary">Authentication Activity</h2>
                <p className="font-body-md text-body-md text-text-muted mt-1">Login and verification metrics.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.keys(AUTH_ACTIVITY).map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setAuthTimeRange(range)}
                    className={`rounded-lg px-3 py-1.5 font-label-sm text-label-sm transition-all ${
                      authTimeRange === range
                        ? "bg-lime text-obsidian"
                        : "border border-outline-variant/30 text-text-muted hover:text-text-primary hover:bg-surface-high"
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="relative z-10">
            <AuthActivityChart data={authChartData} />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="text-center">
                <p className="font-label-sm text-label-sm text-text-muted">Successful Logins</p>
                <p className="font-h4 text-h4 text-text-primary">{authData.successfulLogins.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="font-label-sm text-label-sm text-text-muted">Failed Logins</p>
                <p className="font-h4 text-h4 text-text-primary">{authData.failedLogins.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="font-label-sm text-label-sm text-text-muted">Password Resets</p>
                <p className="font-h4 text-h4 text-text-primary">{authData.passwordResets.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="font-label-sm text-label-sm text-text-muted">New Devices</p>
                <p className="font-h4 text-h4 text-text-primary">{authData.newDevices.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-6 md:p-8 shadow-lg relative overflow-hidden">
          <div
            className="absolute top-0 right-0 h-64 w-64 bg-lime/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"
            aria-hidden="true"
          />
          <div className="relative z-10 mb-6">
            <h2 className="font-h3 text-h3 text-text-primary">Failed Logins</h2>
            <p className="font-body-md text-body-md text-text-muted mt-1">Recent authentication failures.</p>
          </div>
          <div className="relative z-10 overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-outline-variant/20">
                  <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">User</th>
                  <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Attempts</th>
                  <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Location</th>
                  <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Device</th>
                  <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {FAILED_LOGINS.map((login) => (
                  <tr key={login.id} className="border-b border-outline-variant/10 last:border-0">
                    <td className="py-3">
                      <div>
                        <p className="font-body-md text-sm text-text-primary">{login.user}</p>
                        <p className="font-body-md text-xs text-text-muted">{login.email}</p>
                      </div>
                    </td>
                    <td className="py-3 font-body-md text-sm text-text-primary">{login.attempts}</td>
                    <td className="py-3 font-body-md text-sm text-text-muted">{login.location}</td>
                    <td className="py-3 font-body-md text-sm text-text-muted">{login.device}</td>
                    <td className="py-3">
                      <Badge variant={statusBadgeVariant(login.status)}>{login.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <div className="glass-panel rounded-xl p-6 md:p-8 shadow-lg relative overflow-hidden">
          <div
            className="absolute top-0 right-0 h-64 w-64 bg-lime/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"
            aria-hidden="true"
          />
          <div className="relative z-10 mb-6">
            <h2 className="font-h3 text-h3 text-text-primary">Suspicious Activities</h2>
            <p className="font-body-md text-body-md text-text-muted mt-1">Flagged events requiring attention.</p>
          </div>
          <div className="relative z-10 overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-outline-variant/20">
                  <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">ID</th>
                  <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Activity</th>
                  <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Risk</th>
                  <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Resource</th>
                  <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {SUSPICIOUS_ACTIVITIES.map((item) => (
                  <tr key={item.id} className="border-b border-outline-variant/10 last:border-0">
                    <td className="py-3 font-label-sm text-label-sm text-text-primary">{item.id}</td>
                    <td className="py-3 font-body-md text-sm text-text-primary">{item.activity}</td>
                    <td className="py-3">
                      <SeverityBadge severity={item.risk} />
                    </td>
                    <td className="py-3 font-body-md text-sm text-text-muted">{item.affectedResource}</td>
                    <td className="py-3">
                      <Badge variant={statusBadgeVariant(item.status)}>{item.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-6 md:p-8 shadow-lg relative overflow-hidden">
          <div
            className="absolute top-0 right-0 h-64 w-64 bg-lime/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"
            aria-hidden="true"
          />
          <div className="relative z-10 mb-6">
            <h2 className="font-h3 text-h3 text-text-primary">Active Sessions</h2>
            <p className="font-body-md text-body-md text-text-muted mt-1">Currently active user sessions.</p>
          </div>
          <div className="relative z-10 overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-outline-variant/20">
                  <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">User</th>
                  <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Device</th>
                  <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Location</th>
                  <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Last Activity</th>
                  <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {ACTIVE_SESSIONS.map((session) => (
                  <tr key={session.id} className="border-b border-outline-variant/10 last:border-0">
                    <td className="py-3">
                      <div>
                        <p className="font-body-md text-sm text-text-primary">{session.user}</p>
                        <p className="font-body-md text-xs text-text-muted">{session.email}</p>
                      </div>
                    </td>
                    <td className="py-3 font-body-md text-sm text-text-muted">{session.device}</td>
                    <td className="py-3 font-body-md text-sm text-text-muted">{session.location}</td>
                    <td className="py-3 font-body-md text-sm text-text-muted">{session.lastActivity}</td>
                    <td className="py-3">
                      <Badge variant={statusBadgeVariant(session.status)}>{session.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <div className="glass-panel rounded-xl p-6 md:p-8 shadow-lg relative overflow-hidden">
          <div
            className="absolute top-0 right-0 h-64 w-64 bg-lime/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"
            aria-hidden="true"
          />
          <div className="relative z-10 mb-6">
            <h2 className="font-h3 text-h3 text-text-primary">Admin Security</h2>
            <p className="font-body-md text-body-md text-text-muted mt-1">Administrator account protection.</p>
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-body-md text-sm text-text-muted">Admin Accounts</span>
              <span className="font-label-sm text-label-sm text-text-primary font-semibold">{ADMIN_SECURITY.adminAccounts}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-body-md text-sm text-text-muted">MFA Enabled</span>
              <Badge variant={ADMIN_SECURITY.mfaEnabled ? "success" : "default"}>{ADMIN_SECURITY.mfaEnabled ? "Yes" : "No"}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-body-md text-sm text-text-muted">Last Login</span>
              <span className="font-label-sm text-label-sm text-text-primary font-semibold">{ADMIN_SECURITY.lastLogin}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-body-md text-sm text-text-muted">Failed Logins</span>
              <span className="font-label-sm text-label-sm text-text-primary font-semibold">{ADMIN_SECURITY.failedLogins}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-body-md text-sm text-text-muted">Session Count</span>
              <span className="font-label-sm text-label-sm text-text-primary font-semibold">{ADMIN_SECURITY.sessionCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-body-md text-sm text-text-muted">Status</span>
              <Badge variant={statusBadgeVariant(ADMIN_SECURITY.status)}>{ADMIN_SECURITY.status}</Badge>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-6 md:p-8 shadow-lg relative overflow-hidden xl:col-span-2">
          <div
            className="absolute top-0 right-0 h-64 w-64 bg-lime/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"
            aria-hidden="true"
          />
          <div className="relative z-10 mb-6">
            <h2 className="font-h3 text-h3 text-text-primary">Activity Timeline</h2>
            <p className="font-body-md text-body-md text-text-muted mt-1">Recent security events.</p>
          </div>
          <div className="relative z-10">
            <div className="space-y-0">
              {SECURITY_ACTIVITY_TIMELINE.map((item, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`h-3 w-3 rounded-full ${timelineTypeColor(item.type)} bg-current`} />
                    {index < SECURITY_ACTIVITY_TIMELINE.length - 1 && (
                      <div className="w-px h-full bg-outline-variant/30 mt-1" />
                    )}
                  </div>
                  <div className="pb-6 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-label-sm text-label-sm text-text-primary">{item.description}</span>
                    </div>
                    <span className="font-body-md text-xs text-text-muted">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AlertDetailsModal alert={selectedAlert} onClose={() => setSelectedAlert(null)} />

      <ConfirmModal
        open={!!bulkAction}
        title={bulkAction?.type === "resolve" ? "Resolve selected alerts?" : "Dismiss selected alerts?"}
        message={`This will update the status of ${bulkAction?.selectedIds?.length || 0} alert(s). Continue?`}
        confirmLabel={bulkAction?.type === "resolve" ? "Resolve Selected" : "Dismiss Selected"}
        onConfirm={confirmBulkAction}
        onCancel={() => setBulkAction(null)}
      />
    </div>
  );
}
