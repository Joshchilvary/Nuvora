import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button.jsx";
import Badge from "../components/ui/Badge.jsx";
import {
  AUDIT_OVERVIEW,
  AUDIT_EVENTS,
  AUDIT_FILTERS,
  AUDIT_PAGE_SIZE,
} from "../data/adminDashboard.js";

const ITEMS_PER_PAGE = AUDIT_PAGE_SIZE;

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
    Informational: "neutral",
  }[severity] || "default";
  return <Badge variant={variant}>{severity}</Badge>;
}

function ResultBadge({ result }) {
  const variant = result === "Successful" ? "success" : "default";
  return <Badge variant={variant}>{result}</Badge>;
}

function EventDetailsModal({ event, onClose }) {
  if (!event) return null;
  const hasChanges = event.before && event.after;
  const entries = hasChanges ? Object.keys(event.before) : [];
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Event Details"
    >
      <div className="absolute inset-0 bg-obsidian/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-xl border border-outline-variant/20 bg-surface-container p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-h4 text-h4 text-text-primary">Event {event.id}</h3>
            <p className="font-body-md text-sm text-text-muted">{event.timestamp}</p>
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
          <SeverityBadge severity={event.severity} />
          <Badge variant="neutral">{event.action}</Badge>
          <ResultBadge result={event.result} />
          {event.isSecurityEvent && (
            <Link
              to="/admin/security"
              onClick={onClose}
              className="inline-flex items-center gap-1 rounded-full border border-lime/30 bg-lime/10 px-3 py-1 text-xs font-semibold text-accent hover:bg-lime/20 transition-colors"
            >
              <span className="material-symbols text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
              Security Center
            </Link>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-outline-variant/20 bg-surface-container-high p-4">
            <p className="font-label-sm text-label-sm text-text-muted mb-1">Description</p>
            <p className="font-body-md text-sm text-text-primary">{event.description}</p>
          </div>

          <div className="rounded-lg border border-outline-variant/20 bg-surface-container-high p-4">
            <p className="font-label-sm text-label-sm text-text-muted mb-2">Actor</p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div>
                <p className="font-body-md text-sm text-text-primary">{event.actor}</p>
                <p className="font-body-md text-xs text-text-muted">{event.actorRole}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-outline-variant/20 bg-surface-container-high p-4">
            <p className="font-label-sm text-label-sm text-text-muted mb-2">Target</p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div>
                <p className="font-body-md text-sm text-text-primary">{event.resourceType}: {event.resourceName}</p>
                <p className="font-body-md text-xs text-text-muted">{event.resourceId}</p>
              </div>
            </div>
          </div>

          {hasChanges && (
            <div className="rounded-lg border border-outline-variant/20 bg-surface-container-high p-4">
              <p className="font-label-sm text-label-sm text-text-muted mb-3">Changes</p>
              <div className="space-y-3">
                {entries.map((key) => (
                  <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <span className="font-label-sm text-label-sm text-text-primary w-full sm:w-32 capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                    <div className="flex-1 flex items-center gap-2">
                      <span className="font-body-md text-sm text-text-muted line-through opacity-70 break-all">
                        {String(event.before[key])}
                      </span>
                      <span className="material-symbols text-text-muted text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_forward</span>
                      <span className="font-body-md text-sm text-text-primary break-all">
                        {String(event.after[key])}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-lg border border-outline-variant/20 bg-surface-container-high p-4">
            <p className="font-label-sm text-label-sm text-text-muted mb-2">Context</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <p className="font-body-md text-xs text-text-muted">Source</p>
                <p className="font-body-md text-sm text-text-primary">{event.source}</p>
              </div>
              <div>
                <p className="font-body-md text-xs text-text-muted">Session</p>
                <p className="font-body-md text-sm text-text-primary">{event.sessionReference}</p>
              </div>
              <div>
                <p className="font-body-md text-xs text-text-muted">Device</p>
                <p className="font-body-md text-sm text-text-primary">{event.device}</p>
              </div>
              <div>
                <p className="font-body-md text-xs text-text-muted">Location</p>
                <p className="font-body-md text-sm text-text-primary">{event.location}</p>
              </div>
            </div>
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

function MobileEventCard({ event, onViewDetails }) {
  return (
    <div className="rounded-xl border border-outline-variant/20 bg-surface-container p-4 shadow-lg mb-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="font-label-sm text-label-sm text-text-primary truncate">{event.id}</p>
          <p className="font-body-md text-xs text-text-muted">{event.timestamp}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <SeverityBadge severity={event.severity} />
          <ResultBadge result={event.result} />
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        <Badge variant="neutral">{event.action}</Badge>
        <Badge variant="neutral">{event.resourceType}</Badge>
      </div>
      <p className="font-body-md text-sm text-text-primary mb-1 line-clamp-2">{event.description}</p>
      <p className="font-body-md text-xs text-text-muted mb-3">{event.actor} — {event.resourceName}</p>
      <button
        type="button"
        onClick={() => onViewDetails(event)}
        className="font-label-sm text-label-sm text-accent hover:text-accent/80 transition-colors"
      >
        View Details
      </button>
    </div>
  );
}

export default function AdminAuditLogs() {
  const [events, setEvents] = useState(AUDIT_EVENTS);
  const [search, setSearch] = useState("");
  const [actionTypeFilter, setActionTypeFilter] = useState("all");
  const [resourceFilter, setResourceFilter] = useState("all");
  const [resultFilter, setResultFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [bulkAction, setBulkAction] = useState(null);
  const [toast, setToast] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const term = search.trim().toLowerCase();
      if (term) {
        const match =
          event.id.toLowerCase().includes(term) ||
          event.actor.toLowerCase().includes(term) ||
          event.resourceName.toLowerCase().includes(term) ||
          event.action.toLowerCase().includes(term) ||
          event.description.toLowerCase().includes(term) ||
          event.resourceId.toLowerCase().includes(term);
        if (!match) return false;
      }
      if (actionTypeFilter !== "all" && event.action.toLowerCase() !== actionTypeFilter) return false;
      if (resourceFilter !== "all" && event.resourceType.toLowerCase() !== resourceFilter) return false;
      if (resultFilter !== "all" && event.result.toLowerCase() !== resultFilter) return false;
      if (severityFilter !== "all" && event.severity.toLowerCase() !== severityFilter) return false;
      if (dateRange !== "all") {
        const eventDate = new Date(event.timestamp);
        const now = new Date();
        if (dateRange === "today") {
          if (eventDate.toDateString() !== now.toDateString()) return false;
        } else if (dateRange === "7d") {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          if (eventDate < weekAgo) return false;
        } else if (dateRange === "30d") {
          const monthAgo = new Date();
          monthAgo.setDate(monthAgo.getDate() - 30);
          if (eventDate < monthAgo) return false;
        }
      }
      return true;
    });
  }, [events, search, actionTypeFilter, resourceFilter, resultFilter, severityFilter, dateRange]);

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedEvents = filteredEvents.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const allSelected = paginatedEvents.length > 0 && paginatedEvents.every((e) => selectedIds.includes(e.id));
  const someSelected = paginatedEvents.some((e) => selectedIds.includes(e.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !paginatedEvents.some((e) => e.id === id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...paginatedEvents.map((e) => e.id)])]);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleExportCSV = () => {
    const dataToExport = filteredEvents;
    if (!dataToExport.length) return;
    const header = "Event ID,Timestamp,Actor,Action,Resource Type,Resource ID,Resource Name,Severity,Result,Description,Source,Device,Location\n";
    const rows = dataToExport
      .map((e) => `${e.id},"${e.timestamp}","${e.actor}","${e.action}","${e.resourceType}","${e.resourceId}","${e.resourceName.replace(/"/g, '""')}","${e.severity}","${e.result}","${e.description.replace(/"/g, '""')}","${e.source}","${e.device}","${e.location}"`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nuvora-audit-logs.csv";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Audit logs exported successfully.");
  };

  const resetFilters = () => {
    setSearch("");
    setActionTypeFilter("all");
    setResourceFilter("all");
    setResultFilter("all");
    setSeverityFilter("all");
    setDateRange("all");
    setCurrentPage(1);
    setSelectedIds([]);
  };

  const handleBulkTag = () => {
    if (!selectedIds.length) return;
    setBulkAction({ type: "tag", selectedIds });
  };

  const confirmBulkAction = () => {
    if (!bulkAction) return;
    showToast(`${bulkAction.selectedIds.length} event(s) processed.`);
    setSelectedIds([]);
    setBulkAction(null);
  };

  const timelineEvents = useMemo(() => {
    return [...events]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 6);
  }, [events]);

  const overview = {
    total: AUDIT_OVERVIEW.totalEvents,
    adminActions: AUDIT_OVERVIEW.adminActions,
    securityEvents: AUDIT_OVERVIEW.securityEvents,
    userChanges: AUDIT_OVERVIEW.userChanges,
    failedActions: AUDIT_OVERVIEW.failedActions,
  };

  const statusBadgeVariant = (status) => {
    switch (status) {
      case "Active":
        return "success";
      case "Suspended":
        return "default";
      case "Pending":
        return "neutral";
      case "Rejected":
        return "default";
      case "Successful":
        return "success";
      case "Failed":
        return "default";
      case "Locked":
        return "default";
      case "Cleared":
        return "success";
      case "Under Review":
        return "neutral";
      default:
        return "default";
    }
  };

  const timelineColor = (severity) => {
    switch (severity) {
      case "Critical":
        return "text-red-400";
      case "High":
        return "text-orange-400";
      case "Medium":
        return "text-yellow-400";
      case "Low":
        return "text-accent";
      case "Informational":
        return "text-blue-400";
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
          <h1 className="font-display text-h2 text-text-primary">Audit Logs</h1>
          <p className="font-body-md text-body-md text-text-muted mt-1">
            Track administrative actions, security events, and important changes across NUVORA.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={handleExportCSV}>Export Logs</Button>
          <Button type="button" variant="ghost" onClick={() => showToast("Audit logs refreshed.")}>
            <span className="material-symbols text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>refresh</span>
            Refresh
          </Button>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard title="Total Events" value={overview.total.toLocaleString()} icon="history" />
        <StatCard title="Admin Actions" value={overview.adminActions.toLocaleString()} icon="admin_panel_settings" />
        <StatCard title="Security Events" value={overview.securityEvents.toLocaleString()} icon="security" />
        <StatCard title="User Changes" value={overview.userChanges.toLocaleString()} icon="people" />
        <StatCard title="Failed Actions" value={overview.failedActions.toLocaleString()} icon="error" />
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
                placeholder="Search by event ID, admin, user, resource, action, or description..."
                className="block w-full rounded-lg bg-surface-container-high border border-outline-variant/30 px-4 py-2.5 font-body-md text-text-primary outline-none transition-all placeholder:text-text-muted/60 focus:border-lime"
              />
            </div>
            <Button type="button" variant="outline" onClick={resetFilters}>Reset Filters</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={actionTypeFilter}
              onChange={(e) => { setActionTypeFilter(e.target.value); setCurrentPage(1); }}
              className="rounded-lg bg-surface-container-high border border-outline-variant/30 px-3 py-2 font-label-sm text-label-sm text-text-primary outline-none transition-all focus:border-lime"
            >
              {AUDIT_FILTERS.actionType.map((f) => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </select>
            <select
              value={resourceFilter}
              onChange={(e) => { setResourceFilter(e.target.value); setCurrentPage(1); }}
              className="rounded-lg bg-surface-container-high border border-outline-variant/30 px-3 py-2 font-label-sm text-label-sm text-text-primary outline-none transition-all focus:border-lime"
            >
              {AUDIT_FILTERS.resource.map((f) => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </select>
            <select
              value={resultFilter}
              onChange={(e) => { setResultFilter(e.target.value); setCurrentPage(1); }}
              className="rounded-lg bg-surface-container-high border border-outline-variant/30 px-3 py-2 font-label-sm text-label-sm text-text-primary outline-none transition-all focus:border-lime"
            >
              {AUDIT_FILTERS.result.map((f) => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </select>
            <select
              value={severityFilter}
              onChange={(e) => { setSeverityFilter(e.target.value); setCurrentPage(1); }}
              className="rounded-lg bg-surface-container-high border border-outline-variant/30 px-3 py-2 font-label-sm text-label-sm text-text-primary outline-none transition-all focus:border-lime"
            >
              {AUDIT_FILTERS.severity.map((f) => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </select>
            <select
              value={dateRange}
              onChange={(e) => { setDateRange(e.target.value); setCurrentPage(1); }}
              className="rounded-lg bg-surface-container-high border border-outline-variant/30 px-3 py-2 font-label-sm text-label-sm text-text-primary outline-none transition-all focus:border-lime"
            >
              {AUDIT_FILTERS.dateRange.map((f) => (
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
            <Button type="button" variant="outline" onClick={handleBulkTag} className="text-accent border-lime/30 hover:bg-lime/10">
              Tag Selected
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
                    aria-label="Select all events"
                  />
                </th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Event</th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Actor</th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Action</th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Resource</th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Severity</th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Result</th>
                <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Date / Time</th>
                <th className="text-right font-label-sm text-label-sm text-text-muted pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEvents.map((event) => (
                <tr key={event.id} className={`border-b border-outline-variant/10 last:border-0 ${selectedIds.includes(event.id) ? "bg-lime/5" : ""}`}>
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(event.id)}
                      onChange={() => toggleSelect(event.id)}
                      className="h-4 w-4 rounded border-outline-variant/30 bg-surface-container-high text-lime focus:ring-lime"
                      aria-label={`Select event ${event.id}`}
                    />
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-high">
                        <span className="material-symbols text-accent text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>
                          {event.isSecurityEvent ? "security" : "receipt_long"}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-label-sm text-label-sm text-text-primary">{event.id}</p>
                        <p className="font-body-md text-xs text-text-muted truncate max-w-[180px]">{event.resourceName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 font-body-md text-sm text-text-primary">{event.actor}</td>
                  <td className="py-4">
                    <Badge variant="neutral">{event.action}</Badge>
                  </td>
                  <td className="py-4">
                    <div>
                      <p className="font-body-md text-sm text-text-primary">{event.resourceType}</p>
                      <p className="font-body-md text-xs text-text-muted">{event.resourceId}</p>
                    </div>
                  </td>
                  <td className="py-4">
                    <SeverityBadge severity={event.severity} />
                  </td>
                  <td className="py-4">
                    <ResultBadge result={event.result} />
                  </td>
                  <td className="py-4 font-body-md text-sm text-text-muted whitespace-nowrap">{event.timestamp}</td>
                  <td className="py-4 text-right">
                    <button type="button" onClick={() => setSelectedEvent(event)} className="font-label-sm text-label-sm text-accent hover:text-accent/80 transition-colors">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="md:hidden mb-6">
        {paginatedEvents.map((event) => (
          <MobileEventCard
            key={event.id}
            event={event}
            onViewDetails={(e) => setSelectedEvent(e)}
          />
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="glass-panel rounded-xl p-12 text-center mb-6">
          <span className="material-symbols text-4xl text-text-muted mb-3">history_off</span>
          <p className="font-body-md text-body-md text-text-muted mb-4">No audit events found</p>
          <p className="font-body-md text-sm text-text-muted mb-4">Try adjusting your search or filters.</p>
          <Button type="button" onClick={resetFilters}>Reset Filters</Button>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mb-8">
          <p className="font-body-md text-sm text-text-muted">
            Page {safePage} of {totalPages} — {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""}
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

      <div className="glass-panel rounded-xl p-6 md:p-8 shadow-lg relative overflow-hidden">
        <div
          className="absolute top-0 right-0 h-64 w-64 bg-lime/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative z-10 mb-6">
          <h2 className="font-h3 text-h3 text-text-primary">Recent Timeline</h2>
          <p className="font-body-md text-body-md text-text-muted mt-1">Latest administrative and security events.</p>
        </div>
        <div className="relative z-10">
          <div className="space-y-0">
            {timelineEvents.map((item, index) => (
              <div key={item.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`h-3 w-3 rounded-full ${timelineColor(item.severity)} bg-current`} />
                  {index < timelineEvents.length - 1 && (
                    <div className="w-px h-full bg-outline-variant/30 mt-1" />
                  )}
                </div>
                <div className="pb-6 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-label-sm text-label-sm text-text-primary">{item.action}</span>
                    <SeverityBadge severity={item.severity} />
                    <ResultBadge result={item.result} />
                  </div>
                  <p className="font-body-md text-sm text-text-muted line-clamp-2">{item.description}</p>
                  <span className="font-body-md text-xs text-text-muted">{item.timestamp} — {item.actor}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <EventDetailsModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />

      <ConfirmModal
        open={!!bulkAction}
        title="Process selected events?"
        message={`This will update ${bulkAction?.selectedIds?.length || 0} event(s). Continue?`}
        confirmLabel="Process Selected"
        onConfirm={confirmBulkAction}
        onCancel={() => setBulkAction(null)}
      />
    </div>
  );
}
