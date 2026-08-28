import React from "react";
import { CATEGORIES } from "../../data/products.js";

export default function FilterSidebar({
  selectedCategory,
  onSelectCategory,
  maxPrice,
  onMaxPriceChange,
}) {
  return (
    <div className="rounded-xl border border-outline-variant/20 bg-surface/70 p-6 backdrop-blur-[20px]">
      <h3 className="mb-6 font-display text-h4 text-text-primary">Filters</h3>

      <div className="space-y-6">
        <div>
          <h4 className="mb-3 text-label-sm uppercase tracking-wider text-text-muted">
            Category
          </h4>
          <ul className="space-y-1 font-body-md">
            {CATEGORIES.map((category) => {
              const active = category === selectedCategory;
              return (
                <li key={category}>
                  <button
                    onClick={() => onSelectCategory(category)}
                    className={`flex w-full items-center justify-between rounded-lg px-2 py-2 text-left transition-colors ${
                      active
                        ? "bg-surface-high font-semibold text-accent"
                        : "text-text-muted hover:bg-surface-high"
                    }`}
                  >
                    <span>{category}</span>
                    {active ? (
                      <span className="material-symbols text-sm">check</span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="h-px w-full bg-outline-variant/20" />

        <div>
          <h4 className="mb-3 text-label-sm uppercase tracking-wider text-text-muted">
            Price
          </h4>
          <input
            type="range"
            min="0"
            max="1000"
            value={maxPrice}
            onChange={(event) => onMaxPriceChange(Number(event.target.value))}
            className="w-full accent-lime"
            aria-label="Maximum price"
          />
          <div className="mt-2 flex justify-between text-sm text-text-muted">
            <span>$0</span>
            <span>{maxPrice >= 1000 ? "$1000+" : `$${maxPrice}`}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
