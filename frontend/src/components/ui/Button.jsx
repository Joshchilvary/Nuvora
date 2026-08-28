import React from "react";

const VARIANTS = {
  primary: "bg-lime text-obsidian hover:bg-lime-soft focus-visible:ring-lime/60",
  secondary:
    "bg-surface-elevated text-text-primary hover:bg-surface-high focus-visible:ring-outline/50",
  outline:
    "bg-transparent text-text-primary border border-outline-variant/40 hover:bg-surface-elevated focus-visible:ring-outline/50",
  ghost:
    "bg-transparent text-text-muted hover:text-text-primary hover:bg-surface-elevated focus-visible:ring-outline/40",
};

const SIZES = {
  sm: "px-3.5 py-1.5 text-xs rounded-lg",
  md: "px-5 py-2.5 text-sm rounded-xl",
  lg: "px-6 py-3 text-base rounded-xl",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-colors focus:outline-none focus-visible:ring-2 disabled:opacity-50 disabled:pointer-events-none ${VARIANTS[variant] || VARIANTS.primary} ${SIZES[size] || SIZES.md} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
