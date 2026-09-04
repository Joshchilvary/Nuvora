import React, { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button.jsx";
import Badge from "../components/ui/Badge.jsx";
import {
  ADMIN_STATS,
  REVENUE_DATA,
  RECENT_ORDERS,
  ACTIVITY_FEED,
  SELLER_APPLICATIONS,
  PRODUCT_MODERATION,
  SECURITY_METRICS,
} from "../data/adminDashboard.js";

const TIME_FILTERS = Object.keys(REVENUE_DATA);

function StatCard({ title, value, trend, positive }) {
  return (
    <div className="glass-panel rounded-xl p-5 shadow-lg relative overflow-hidden">
      <div
        className="absolute top-0 right-0 h-48 w-48 bg-lime/5 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none"
        aria-hidden="true"
      />
      <p className="font-label-sm text-label-sm text-text-muted mb-1 relative z-10">{title}</p>
      <p className="font-h3 text-h3 text-text-primary relative z-10">{value}</p>
      <p
        className={`font-label-sm text-label-sm mt-2 relative z-10 ${
          positive ? "text-accent" : "text-red-400"
        }`}
      >
        {positive ? "+" : ""}{trend}
      </p>
    </div>
  );
}

function MiniChart({ data, type = "revenue" }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const padding = 10;
  const width = 600;
  const height = 200;

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((value - min) / range) * (height - padding * 2);
    return { x, y };
  });

  const pathD = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[300px] h-48" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`gradient-${type}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(var(--nuvora-lime) / 0.3)" />
            <stop offset="100%" stopColor="rgb(var(--nuvora-lime) / 0)" />
          </linearGradient>
        </defs>
        <path d={areaD} fill={`url(#gradient-${type})`} />
        <path
          d={pathD}
          fill="none"
          stroke="rgb(var(--nuvora-lime) / <alpha-value>)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((point, index) => (
          <circle key={index} cx={point.x} cy={point.y} r="4" fill="rgb(var(--nuvora-lime) / <alpha-value>)">
            <title>{data[index]}</title>
          </circle>
        ))}
      </svg>
    </div>
  );
}

function StatusBadge({ status }) {
  const variants = {
    Processing: "neutral",
    Shipped: "lime",
    Delivered: "success",
    Cancelled: "default",
    Pending: "neutral",
  };
  return <Badge variant={variants[status] || "default"}>{status}</Badge>;
}

function ActivityIcon({ icon }) {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-high">
      <span className="material-symbols text-accent text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>
        {icon}
      </span>
    </div>
  );
}

export default function AdminDashboard() {
  const [timeFilter, setTimeFilter] = useState("7 Days");
  const chartData = REVENUE_DATA[timeFilter] || REVENUE_DATA["7 Days"];

  return (
    <div className="flex flex-col min-h-full">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="font-display text-h2 text-text-primary">Admin Dashboard</h1>
        <p className="font-body-md text-body-md text-text-muted mt-1">
          Monitor and manage the NUVORA marketplace from one place.
        </p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-lime/30 bg-lime/10 px-3 py-1.5 text-xs font-semibold text-accent">
          <span className="material-symbols text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
            verified_user
          </span>
          Marketplace Status — Operational
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total Users" value={ADMIN_STATS.totalUsers.value} trend={ADMIN_STATS.totalUsers.trend} positive={ADMIN_STATS.totalUsers.positive} />
        <StatCard title="Active Sellers" value={ADMIN_STATS.activeSellers.value} trend={ADMIN_STATS.activeSellers.trend} positive={ADMIN_STATS.activeSellers.positive} />
        <StatCard title="Total Products" value={ADMIN_STATS.totalProducts.value} trend={ADMIN_STATS.totalProducts.trend} positive={ADMIN_STATS.totalProducts.positive} />
        <StatCard title="Total Orders" value={ADMIN_STATS.totalOrders.value} trend={ADMIN_STATS.totalOrders.trend} positive={ADMIN_STATS.totalOrders.positive} />
        <StatCard title="Revenue" value={ADMIN_STATS.revenue.value} trend={ADMIN_STATS.revenue.trend} positive={ADMIN_STATS.revenue.positive} />
        <StatCard title="Pending Orders" value={ADMIN_STATS.pendingOrders.value} trend={ADMIN_STATS.pendingOrders.trend} positive={ADMIN_STATS.pendingOrders.positive} />
      </div>

      {/* Revenue Chart */}
      <div className="glass-panel rounded-xl p-6 md:p-8 shadow-lg relative overflow-hidden mb-8">
        <div
          className="absolute top-0 right-0 h-64 w-64 bg-lime/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"
          aria-hidden="true"
        />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 relative z-10">
          <div>
            <h2 className="font-h3 text-h3 text-text-primary">Revenue Overview</h2>
            <p className="font-body-md text-body-md text-text-muted mt-1">Marketplace performance over time.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {TIME_FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setTimeFilter(filter)}
                className={`rounded-lg px-3 py-1.5 font-label-sm text-label-sm transition-all ${
                  timeFilter === filter
                    ? "bg-lime text-obsidian"
                    : "border border-outline-variant/30 text-text-muted hover:text-text-primary hover:bg-surface-high"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
        <div className="relative z-10">
          <MiniChart data={chartData.revenue} type="revenue" />
          <div className="flex items-center justify-between mt-4 text-xs text-text-muted">
            <span>Revenue trend</span>
            <span className="font-semibold text-text-primary">
              ₦{chartData.revenue.reduce((a, b) => a + b, 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Order Activity */}
        <div className="xl:col-span-2 glass-panel rounded-xl p-6 md:p-8 shadow-lg relative overflow-hidden">
          <div
            className="absolute top-0 right-0 h-64 w-64 bg-lime/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"
            aria-hidden="true"
          />
          <div className="mb-6 relative z-10">
            <h2 className="font-h3 text-h3 text-text-primary">Order Activity</h2>
            <p className="font-body-md text-body-md text-text-muted mt-1">Recent marketplace orders.</p>
          </div>
          <div className="relative z-10 overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-outline-variant/20">
                  <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Order ID</th>
                  <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Customer</th>
                  <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Seller</th>
                  <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Amount</th>
                  <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Status</th>
                  <th className="text-left font-label-sm text-label-sm text-text-muted pb-3">Date</th>
                  <th className="text-right font-label-sm text-label-sm text-text-muted pb-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_ORDERS.map((order) => (
                  <tr key={order.id} className="border-b border-outline-variant/10 last:border-0">
                    <td className="py-4 font-label-sm text-label-sm text-text-primary">{order.id}</td>
                    <td className="py-4 font-body-md text-sm text-text-primary">{order.customer}</td>
                    <td className="py-4 font-body-md text-sm text-text-muted">{order.seller}</td>
                    <td className="py-4 font-body-md text-sm text-text-primary">{order.amount}</td>
                    <td className="py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="py-4 font-body-md text-sm text-text-muted">
                      {new Date(order.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="py-4 text-right">
                      <button
                        type="button"
                        className="font-label-sm text-label-sm text-accent hover:text-accent/80 transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="glass-panel rounded-xl p-6 md:p-8 shadow-lg relative overflow-hidden">
          <div
            className="absolute top-0 right-0 h-64 w-64 bg-lime/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"
            aria-hidden="true"
          />
          <div className="mb-6 relative z-10">
            <h2 className="font-h3 text-h3 text-text-primary">Activity Feed</h2>
            <p className="font-body-md text-body-md text-text-muted mt-1">Recent platform activity.</p>
          </div>
          <div className="relative z-10 space-y-4">
            {ACTIVITY_FEED.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <ActivityIcon icon={activity.icon} />
                <div className="flex-1 min-w-0">
                  <p className="font-body-md text-sm text-text-primary">{activity.description}</p>
                  <p className="font-body-md text-xs text-text-muted mt-0.5">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Seller Applications */}
        <div className="glass-panel rounded-xl p-6 md:p-8 shadow-lg relative overflow-hidden">
          <div
            className="absolute top-0 right-0 h-64 w-64 bg-lime/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"
            aria-hidden="true"
          />
          <div className="mb-6 relative z-10">
            <h2 className="font-h3 text-h3 text-text-primary">Seller Applications</h2>
            <p className="font-body-md text-body-md text-text-muted mt-1">Review new seller requests.</p>
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-body-md text-sm text-text-muted">Pending</span>
              <span className="font-label-sm text-label-sm text-text-primary font-semibold">{SELLER_APPLICATIONS.pending}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-body-md text-sm text-text-muted">Approved</span>
              <span className="font-label-sm text-label-sm text-text-primary font-semibold">{SELLER_APPLICATIONS.approved}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-body-md text-sm text-text-muted">Rejected</span>
              <span className="font-label-sm text-label-sm text-text-primary font-semibold">{SELLER_APPLICATIONS.rejected}</span>
            </div>
            <Button type="button" variant="outline" className="w-full mt-4">
              View Applications
            </Button>
          </div>
        </div>

        {/* Product Moderation */}
        <div className="glass-panel rounded-xl p-6 md:p-8 shadow-lg relative overflow-hidden">
          <div
            className="absolute top-0 right-0 h-64 w-64 bg-lime/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"
            aria-hidden="true"
          />
          <div className="mb-6 relative z-10">
            <h2 className="font-h3 text-h3 text-text-primary">Product Moderation</h2>
            <p className="font-body-md text-body-md text-text-muted mt-1">Monitor product listings.</p>
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-body-md text-sm text-text-muted">Awaiting Approval</span>
              <span className="font-label-sm text-label-sm text-text-primary font-semibold">{PRODUCT_MODERATION.awaitingApproval}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-body-md text-sm text-text-muted">Reported</span>
              <span className="font-label-sm text-label-sm text-text-primary font-semibold">{PRODUCT_MODERATION.reported}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-body-md text-sm text-text-muted">Removed</span>
              <span className="font-label-sm text-label-sm text-text-primary font-semibold">{PRODUCT_MODERATION.removed}</span>
            </div>
            <Button type="button" variant="outline" className="w-full mt-4">
              Review Products
            </Button>
          </div>
        </div>

        {/* Security Overview */}
        <div className="glass-panel rounded-xl p-6 md:p-8 shadow-lg relative overflow-hidden">
          <div
            className="absolute top-0 right-0 h-64 w-64 bg-lime/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"
            aria-hidden="true"
          />
          <div className="mb-6 relative z-10">
            <h2 className="font-h3 text-h3 text-text-primary">Security Overview</h2>
            <p className="font-body-md text-body-md text-text-muted mt-1">Platform protection status.</p>
          </div>
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-lime/30 bg-lime/10 px-3 py-1.5 text-xs font-semibold text-accent">
              <span className="material-symbols text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified_user
              </span>
              Security Status — {SECURITY_METRICS.status}
            </div>
            <div className="flex items-center justify-between">
              <span className="font-body-md text-sm text-text-muted">Failed Login Attempts</span>
              <span className="font-label-sm text-label-sm text-text-primary font-semibold">{SECURITY_METRICS.failedLogins}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-body-md text-sm text-text-muted">Suspicious Activity</span>
              <span className="font-label-sm text-label-sm text-text-primary font-semibold">{SECURITY_METRICS.suspiciousActivity}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-body-md text-sm text-text-muted">Active Alerts</span>
              <span className="font-label-sm text-label-sm text-text-primary font-semibold">{SECURITY_METRICS.activeAlerts}</span>
            </div>
            <Button type="button" variant="outline" className="w-full mt-4">
              Open Security Center
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 glass-panel rounded-xl p-6 md:p-8 shadow-lg relative overflow-hidden">
        <div
          className="absolute top-0 right-0 h-64 w-64 bg-lime/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"
          aria-hidden="true"
        />
        <div className="mb-6 relative z-10">
          <h2 className="font-h3 text-h3 text-text-primary">Quick Actions</h2>
          <p className="font-body-md text-body-md text-text-muted mt-1">Common admin tasks.</p>
        </div>
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Add Product", icon: "add_circle" },
            { label: "Manage Users", icon: "people" },
            { label: "Manage Sellers", icon: "storefront" },
            { label: "View Orders", icon: "local_shipping" },
            { label: "Review Reports", icon: "flag" },
            { label: "Security Center", icon: "shield" },
          ].map((action) => (
            <button
              key={action.label}
              type="button"
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-outline-variant/20 bg-surface-container p-4 transition-all hover:border-outline-variant/40 hover:bg-surface-high group"
            >
              <span
                className="material-symbols text-2xl text-accent group-hover:scale-110 transition-transform"
                style={{ fontVariationSettings: "'FILL' 0" }}
              >
                {action.icon}
              </span>
              <span className="font-label-sm text-label-sm text-text-primary text-center">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
