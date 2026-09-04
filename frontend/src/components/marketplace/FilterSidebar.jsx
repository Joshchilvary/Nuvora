import React from "react";

export default function FilterSidebar({
  categories = [],
  selectedCategory,
  onSelectCategory,
  maxPrice,
  onMaxPriceChange,
  minPrice,
  onMinPriceChange,
  sort,
  onSortChange,
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
            {categories.map((category) => {
              const active = category === selectedCategory;
              return (
                <li key={category}>
                  <button
                    onClick={() => onSelectCategory?.(category)}
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
            Sort
          </h4>
          <select
            value={sort}
            onChange={(event) => onSortChange?.(event.target.value)}
            className="w-full rounded-lg border border-outline-variant/30 bg-surface-low px-3 py-2 font-body-md text-text-primary outline-none focus:border-lime"
          >
            <option value="newest">Newest</option>
            <option value="price">Price: Low to High</option>
            <option value="-price">Price: High to Low</option>
          </select>
        </div>

        <div className="h-px w-full bg-outline-variant/20" />

        <div>
          <h4 className="mb-3 text-label-sm uppercase tracking-wider text-text-muted">
            Price
          </h4>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="0"
              value={minPrice}
              onChange={(event) => onMinPriceChange?.(event.target.value)}
              className="w-full rounded-lg border border-outline-variant/30 bg-surface-low px-3 py-2 font-body-md text-text-primary outline-none focus:border-lime"
              placeholder="Min"
            />
            <span className="text-text-muted">-</span>
            <input
              type="number"
              min="0"
              value={maxPrice}
              onChange={(event) => onMaxPriceChange?.(Number(event.target.value))}
              className="w-full rounded-lg border border-outline-variant/30 bg-surface-low px-3 py-2 font-body-md text-text-primary outline-none focus:border-lime"
              placeholder="Max"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
