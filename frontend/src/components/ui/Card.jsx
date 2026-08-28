import React from "react";

export default function Card({ children, className = "", ...props }) {
  return (
    <div
      className={`rounded-2xl bg-surface border border-outline-variant/20 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
