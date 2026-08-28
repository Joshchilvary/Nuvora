import React from "react";

const CATEGORIES = [
  { label: "Audio", icon: "headphones" },
  { label: "Computing", icon: "laptop_mac" },
  { label: "Workspace", icon: "chair" },
  { label: "Wearables", icon: "watch" },
];

export default function CategorySection() {
  return (
    <section className="mb-32">
      <div className="mb-10 flex items-end justify-between">
        <h2 className="font-display text-h2 text-text-primary">Categories</h2>
        <a
          href="#"
          className="font-label-sm text-accent transition-colors hover:underline"
        >
          View All
        </a>
      </div>
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {CATEGORIES.map((category) => (
          <a
            key={category.label}
            href="#"
            className="group flex cursor-pointer flex-col items-center border border-outline-variant/20 bg-surface p-8 text-center transition-colors hover:border-lime/50"
          >
            <span className="material-symbols mb-4 text-[48px] text-text-muted transition-colors group-hover:text-accent [font-variation-settings:'wght'_300]">
              {category.icon}
            </span>
            <h3 className="font-display text-h4 text-text-primary">
              {category.label}
            </h3>
          </a>
        ))}
      </div>
    </section>
  );
}
