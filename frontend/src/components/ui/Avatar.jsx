import React from "react";

function getInitials(name) {
  if (!name) return null;
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return null;
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const SIZES = {
  xs: "h-6 w-6 text-[9px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

export default function Avatar({ src, name, alt, size = "md", className = "" }) {
  const sizeClass = SIZES[size] || SIZES.md;
  const initial = getInitials(name);

  if (src) {
    return (
      <img
        src={src}
        alt={alt || name || "User avatar"}
        className={`rounded-full object-cover ${sizeClass} ${className}`.trim()}
      />
    );
  }

  const label = initial || (name ? name[0].toUpperCase() : "NA");
  return (
    <span
      aria-label={name ? `${name} avatar` : "User avatar"}
      className={`rounded-full bg-surface-high font-display font-semibold text-accent flex items-center justify-center ${sizeClass} ${className}`.trim()}
    >
      {label}
    </span>
  );
}
