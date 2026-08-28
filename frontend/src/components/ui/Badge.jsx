import React from "react";

const VARIANTS = {
  default: "bg-surface-elevated text-text-muted border-outline-variant/30",
  lime: "bg-lime/15 text-accent border-lime/30",
  success: "bg-lime/15 text-accent border-lime/30",
  neutral: "bg-surface-high text-text-muted border-outline-variant/20",
};

export default function Badge({ children, variant = "default", className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${VARIANTS[variant] || VARIANTS.default} ${className}`}
    >
      {children}
    </span>
  );
}
