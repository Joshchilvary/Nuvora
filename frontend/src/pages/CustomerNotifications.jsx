import React, { useState, useMemo, createContext, useContext, useCallback } from "react";
import { Link } from "react-router-dom";
import { INITIAL_CUSTOMER_NOTIFICATIONS, CUSTOMER_NOTIFICATION_CATEGORIES } from "../data/customerNotifications.js";
import Button from "../components/ui/Button.jsx";

export const CustomerNotificationContext = createContext(null);

export function useCustomerNotifications() {
  const ctx = useContext(CustomerNotificationContext);
  if (!ctx) throw new Error("useCustomerNotifications must be used within CustomerNotificationContext");
  return ctx;
}

function formatTimestamp(ts) {
  const date = new Date(ts);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? "" : "s"} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getCategoryIcon(type) {
  const icons = {
    orders: "local_shipping",
    promotions: "percent",
    security: "shield",
    nuvora: "auto_awesome",
  };
  return icons[type] ?? "notifications";
}

function groupByDate(notifications) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 86400000;

  const groups = { Today: [], Yesterday: [], Earlier: [] };
  notifications.forEach((n) => {
    const ts = new Date(n.timestamp).getTime();
    if (ts >= today) groups.Today.push(n);
    else if (ts >= yesterday) groups.Yesterday.push(n);
    else groups.Earlier.push(n);
  });
  return Object.entries(groups).filter(([, items]) => items.length > 0);
}

function NotificationItem({ notification, onMarkRead, onDismiss }) {
  const icon = getCategoryIcon(notification.type);

  const handleClick = () => {
    if (!notification.read) {
      onMarkRead(notification.id);
    }
  };

  return (
    <div
      className={`group flex gap-4 rounded-xl border p-4 transition-colors ${
        notification.read
          ? "border-outline-variant/10 bg-surface-container-low"
          : "border-outline-variant/20 bg-surface-container"
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
          notification.read
            ? "bg-surface-high text-text-muted"
            : "bg-lime/10 text-accent"
        }`}
      >
        <span
          className="material-symbols text-[20px]"
          style={{ fontVariationSettings: notification.read ? "'FILL' 0" : "'FILL' 1" }}
        >
          {icon}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p
              className={`font-label-sm text-label-sm ${
                notification.read ? "text-text-muted" : "text-text-primary"
              }`}
            >
              {notification.title}
            </p>
            <p className="text-sm text-text-muted mt-0.5 line-clamp-2">
              {notification.message}
            </p>
          </div>
          {!notification.read ? (
            <span
              className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-lime"
              aria-label="Unread"
            />
          ) : null}
        </div>
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <span className="text-xs text-text-muted">
            {formatTimestamp(notification.timestamp)}
          </span>
          {notification.actionRoute ? (
            notification.read ? (
              <Link
                to={notification.actionRoute}
                className="text-xs text-accent hover:underline font-semibold"
              >
                {notification.actionLabel}
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleClick}
                className="text-xs text-accent hover:underline font-semibold"
              >
                Mark as read
              </button>
            )
          ) : null}
          <button
            type="button"
            onClick={() => onDismiss(notification.id)}
            className="text-xs text-text-muted hover:text-text-primary transition-colors opacity-0 group-hover:opacity-100"
            aria-label="Dismiss notification"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CustomerNotifications() {
  const { notifications, markAsRead, markAllAsRead, dismissNotification } = useCustomerNotifications();
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [readFilter, setReadFilter] = useState("all");

  const filtered = useMemo(() => {
    let result = [...notifications];
    if (categoryFilter !== "all") {
      result = result.filter((n) => n.category === categoryFilter);
    }
    if (readFilter === "unread") {
      result = result.filter((n) => !n.read);
    } else if (readFilter === "read") {
      result = result.filter((n) => n.read);
    }
    return result.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [notifications, categoryFilter, readFilter]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const grouped = groupByDate(filtered);

  const handleDismiss = useCallback((id) => {
    dismissNotification(id);
  }, [dismissNotification]);

  const clearFilters = useCallback(() => {
    setCategoryFilter("all");
    setReadFilter("all");
  }, []);

  return (
    <div className="flex flex-col min-h-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <Link
            to="/customer"
            className="inline-flex items-center gap-2 text-text-muted hover:text-accent transition-colors mb-4"
          >
            <span
              className="material-symbols text-sm"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              arrow_back
            </span>
            <span className="font-label-sm text-label-sm">Back to Dashboard</span>
          </Link>
          <h1 className="font-display text-h2 text-text-primary">Notifications</h1>
          <p className="font-body-md text-body-md text-text-muted mt-1">
            Stay updated on your orders, account activity, and discoveries.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-lime/10 border border-lime/30 px-2.5 py-1 text-xs font-semibold text-accent">
              <span
                className="material-symbols text-[12px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                mark_email_unread
              </span>
              {unreadCount} unread
            </span>
          ) : null}
          <Button
            type="button"
            variant="outline"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <span
              className="material-symbols text-sm"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              done_all
            </span>
            Mark all as read
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex flex-wrap gap-1.5">
          {CUSTOMER_NOTIFICATION_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-label-sm text-label-sm transition-all ${
                categoryFilter === cat.id
                  ? "bg-lime text-obsidian"
                  : "bg-surface-high text-text-muted hover:text-text-primary"
              }`}
              aria-pressed={categoryFilter === cat.id}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 sm:ml-auto">
          {[
            { id: "all", label: "All" },
            { id: "unread", label: "Unread" },
            { id: "read", label: "Read" },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setReadFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg font-label-sm text-label-sm transition-all ${
                readFilter === f.id
                  ? "bg-lime text-obsidian"
                  : "bg-surface-high text-text-muted hover:text-text-primary"
              }`}
              aria-pressed={readFilter === f.id}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notification List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-surface-container">
            <span
              className="material-symbols text-4xl text-text-muted"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              notifications_off
            </span>
          </div>
          <h3 className="font-display text-h3 text-text-primary mb-2">
            {categoryFilter === "all" && readFilter === "all"
              ? "You're all caught up"
              : "No notifications here"}
          </h3>
          <p className="font-body-md text-body-md text-text-muted mb-6 max-w-md">
            {categoryFilter === "all" && readFilter === "all"
              ? "You have no new notifications right now."
              : "Try another notification category."}
          </p>
          {categoryFilter !== "all" || readFilter !== "all" ? (
            <button
              type="button"
              onClick={clearFilters}
              className="font-label-sm text-label-sm text-accent hover:underline transition-colors"
            >
              View all
            </button>
          ) : (
            <Link to="/discover">
              <Button variant="outline">
                <span className="material-symbols text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                  auto_awesome
                </span>
                Continue Discovering
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([label, items]) => (
            <div key={label}>
              <p className="font-label-sm text-label-sm text-text-muted mb-3 uppercase tracking-wider">
                {label}
              </p>
              <div className="space-y-3">
                {items.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkRead={markAsRead}
                    onDismiss={handleDismiss}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
