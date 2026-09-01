import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ANALYTICS_DATA,
  TIME_RANGES,
  TOP_PRODUCTS,
  INVENTORY_INSIGHTS,
} from "../data/sellerAnalytics.js";
import Button from "../components/ui/Button.jsx";

function MetricCard({ label, value, change, icon }) {
  const isPositive = change?.startsWith("+");
  return (
    <div className="rounded-xl border border-outline-variant/20 bg-surface-container p-5 shadow-lg">
      <div className="flex items-center gap-2 mb-2">
        {icon ? (
          <span
            className="material-symbols text-sm text-text-muted"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            {icon}
          </span>
        ) : null}
        <p className="font-label-sm text-label-sm text-text-muted">{label}</p>
      </div>
      <p className="font-h3 text-h3 text-text-primary">{value}</p>
      {change ? (
        <p
          className={`font-label-sm text-label-sm mt-1 flex items-center gap-1 ${
            isPositive ? "text-accent" : "text-red-400"
          }`}
        >
          <span
            className="material-symbols text-sm"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {isPositive ? "trending_up" : "trending_down"}
          </span>
          {change} <span className="text-text-muted font-normal">vs prev. period</span>
        </p>
      ) : null}
    </div>
  );
}

function BarChart({ data, label, unit = "" }) {
  const chartRef = useRef(null);

  useEffect(() => {
    const bars = chartRef.current?.querySelectorAll(".chart-bar-fill");
    if (!bars) return;
    bars.forEach((bar) => {
      const h = bar.style.height;
      bar.style.height = "0%";
      setTimeout(() => {
        bar.style.height = h;
      }, 100);
    });
  }, [data]);

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex-1 min-h-[160px] md:min-h-[200px] flex flex-col">
      <div className="flex w-full justify-between items-end h-full gap-2 md:gap-3 pt-4 md:pt-6">
        {data.map((item) => (
          <div
            key={item.day}
            className="flex-1 h-full flex flex-col justify-end"
          >
            <div className="relative w-full h-full flex flex-col justify-end">
              <div className="chart-bar w-full rounded-t-sm relative" style={{ height: `${(item.value / maxValue) * 100}%` }}>
                <div
                  className="chart-bar-fill"
                  style={{ height: "100%" }}
                  aria-label={`${item.day}: ${item.value}${unit}`}
                />
              </div>
            </div>
            <span className="text-xs text-text-muted text-center mt-2 font-label-sm">
              {item.day}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TopProductRow({ product }) {
  const isUp = product.trend === "up";
  return (
    <div className="flex items-center justify-between p-4 rounded-lg hover:bg-surface-high transition-colors group border border-transparent hover:border-outline-variant/20">
      <div className="flex items-center gap-4 min-w-0">
        <div className="h-12 w-12 shrink-0 rounded-md bg-surface-variant overflow-hidden border border-outline-variant/30">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        </div>
        <div className="min-w-0">
          <p className="font-label-sm text-label-sm text-text-primary truncate">{product.name}</p>
          <p className="text-xs text-text-muted mt-0.5">
            {product.unitsSold} sold · {product.revenue}
          </p>
        </div>
      </div>
      <div className="shrink-0 ml-4">
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${
            isUp
              ? "bg-lime/10 text-accent border-lime/30"
              : "bg-red-400/10 text-red-400 border-red-400/30"
          }`}
        >
          <span
            className="material-symbols text-[12px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {isUp ? "trending_up" : "trending_down"}
          </span>
          {product.trendValue}
        </span>
      </div>
    </div>
  );
}

function InsightCard({ insight }) {
  const severityConfig = {
    warning: { icon: "warning", className: "border-amber-400/30 bg-amber-400/5" },
    success: { icon: "check_circle", className: "border-lime/30 bg-lime/5" },
    info: { icon: "info", className: "border-blue-400/30 bg-blue-400/5" },
  };
  const cfg = severityConfig[insight.severity] ?? severityConfig.info;
  return (
    <div className={`rounded-lg border p-4 ${cfg.className}`}>
      <div className="flex items-start gap-3">
        <span
          className="material-symbols text-text-muted mt-0.5"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {cfg.icon}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-label-sm text-label-sm text-text-primary">{insight.title}</p>
          <p className="text-sm text-text-muted mt-1">{insight.description}</p>
          <Link
            to={insight.actionHref}
            className="inline-flex items-center gap-1 mt-2 text-xs text-accent hover:underline font-semibold"
          >
            {insight.action}
            <span
              className="material-symbols text-[14px]"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              arrow_forward
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SellerAnalytics() {
  const [timeRange, setTimeRange] = useState("30d");
  const data = ANALYTICS_DATA[timeRange] ?? ANALYTICS_DATA["30d"];

  return (
    <div className="flex flex-col min-h-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-h2 text-text-primary">Analytics</h1>
          <p className="font-body-md text-body-md text-text-muted mt-1">
            Understand your store performance and discover opportunities to grow.
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-outline-variant/30 bg-surface-container p-1">
          {TIME_RANGES.map((range) => (
            <button
              key={range.id}
              type="button"
              onClick={() => setTimeRange(range.id)}
              className={`px-3 py-1.5 rounded-md font-label-sm text-label-sm transition-all ${
                timeRange === range.id
                  ? "bg-lime text-obsidian"
                  : "text-text-muted hover:text-text-primary"
              }`}
              aria-pressed={timeRange === range.id}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <MetricCard
          label="Revenue"
          value={data.summary.revenue}
          change={data.summary.revenueChange}
          icon="payments"
        />
        <MetricCard
          label="Orders"
          value={data.summary.orders}
          change={data.summary.ordersChange}
          icon="receipt_long"
        />
        <MetricCard
          label="Products Sold"
          value={data.summary.productsSold}
          change={data.summary.productsSoldChange}
          icon="inventory_2"
        />
        <MetricCard
          label="Avg. Order Value"
          value={data.summary.averageOrderValue}
          change={data.summary.averageOrderValueChange}
          icon="trending_up"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="glass-panel rounded-xl p-6 shadow-lg relative overflow-hidden">
          <div
            className="absolute top-0 right-0 h-64 w-64 bg-lime/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"
            aria-hidden="true"
          />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <h3 className="font-h4 text-h4 text-text-primary">Revenue</h3>
            <span className="font-label-sm text-label-sm text-text-muted bg-surface-high px-2 py-1 rounded">
              {TIME_RANGES.find((r) => r.id === timeRange)?.label}
            </span>
          </div>
          <BarChart data={data.revenue} label="Revenue" unit="$" />
        </div>
        <div className="glass-panel rounded-xl p-6 shadow-lg relative overflow-hidden">
          <div
            className="absolute top-0 right-0 h-64 w-64 bg-lime/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"
            aria-hidden="true"
          />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <h3 className="font-h4 text-h4 text-text-primary">Orders</h3>
            <span className="font-label-sm text-label-sm text-text-muted bg-surface-high px-2 py-1 rounded">
              {TIME_RANGES.find((r) => r.id === timeRange)?.label}
            </span>
          </div>
          <BarChart data={data.orders} label="Orders" unit="" />
        </div>
      </div>

      {/* Top Products */}
      <div className="glass-panel rounded-xl p-6 shadow-lg mb-6">
        <div className="flex justify-between items-center mb-4 border-b border-outline-variant/20 pb-4">
          <h3 className="font-h4 text-h4 text-text-primary">Top Products</h3>
          <Link
            to="/seller/inventory"
            className="font-label-sm text-label-sm text-text-muted hover:text-accent transition-colors flex items-center"
          >
            View All
            <span
              className="material-symbols ml-1 text-sm"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              arrow_forward
            </span>
          </Link>
        </div>
        <div className="space-y-2">
          {TOP_PRODUCTS.map((product) => (
            <TopProductRow key={product.id} product={product} />
          ))}
        </div>
      </div>

      {/* Inventory Insights */}
      <div className="glass-panel rounded-xl p-6 shadow-lg mb-6">
        <div className="flex justify-between items-center mb-4 border-b border-outline-variant/20 pb-4">
          <h3 className="font-h4 text-h4 text-text-primary">Inventory Insights</h3>
          <Link
            to="/seller/inventory"
            className="font-label-sm text-label-sm text-text-muted hover:text-accent transition-colors flex items-center"
          >
            View Inventory
            <span
              className="material-symbols ml-1 text-sm"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              arrow_forward
            </span>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {INVENTORY_INSIGHTS.map((insight, idx) => (
            <InsightCard key={`${insight.type}-${idx}`} insight={insight} />
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/seller/orders"
          className="glass-panel rounded-xl p-5 shadow-lg flex items-center justify-between group hover:border-lime/30 transition-colors"
        >
          <div>
            <p className="font-label-sm text-label-sm text-text-primary">View Orders</p>
            <p className="text-xs text-text-muted mt-1">Manage customer orders and fulfillment</p>
          </div>
          <span
            className="material-symbols text-text-muted group-hover:text-accent transition-colors"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            arrow_forward
          </span>
        </Link>
        <Link
          to="/seller/inventory"
          className="glass-panel rounded-xl p-5 shadow-lg flex items-center justify-between group hover:border-lime/30 transition-colors"
        >
          <div>
            <p className="font-label-sm text-label-sm text-text-primary">View Inventory</p>
            <p className="text-xs text-text-muted mt-1">Manage products and stock levels</p>
          </div>
          <span
            className="material-symbols text-text-muted group-hover:text-accent transition-colors"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            arrow_forward
          </span>
        </Link>
      </div>
    </div>
  );
}
