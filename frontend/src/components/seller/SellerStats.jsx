import React from "react";

export default function SellerStats({ stats }) {
  const items = [
    { label: "Revenue", value: stats.revenue, change: stats.revenueChange },
    { label: "Orders", value: stats.orders, change: stats.ordersChange },
    { label: "Conversion", value: stats.conversion, change: stats.conversionChange },
    { label: "Visitors", value: stats.visitors, change: stats.visitorsChange },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-outline-variant/20 bg-surface-container p-3 md:p-5 shadow-lg"
        >
          <p className="font-label-sm text-label-sm text-text-muted mb-2">{item.label}</p>
          <p className="font-h3 text-h3 text-text-primary">{item.value}</p>
          <p className="font-label-sm text-label-sm text-accent mt-1">{item.change}</p>
        </div>
      ))}
    </div>
  );
}
