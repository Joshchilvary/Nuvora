import React, { useMemo, useState } from "react";
import FilterSidebar from "../components/marketplace/FilterSidebar.jsx";
import SearchBar from "../components/marketplace/SearchBar.jsx";
import ProductGrid from "../components/marketplace/ProductGrid.jsx";
import { PRODUCTS } from "../data/products.js";

export default function Marketplace() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All Products");
  const [maxPrice, setMaxPrice] = useState(1000);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return PRODUCTS.filter((product) => {
      const matchesCategory =
        category === "All Products" || product.category === category;
      const matchesPrice = product.price <= maxPrice;
      const matchesQuery =
        term === "" ||
        `${product.name} ${product.description}`.toLowerCase().includes(term);
      return matchesCategory && matchesPrice && matchesQuery;
    });
  }, [query, category, maxPrice]);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
      <aside className="hidden md:col-span-3 md:block">
        <div className="sticky top-28">
          <FilterSidebar
            selectedCategory={category}
            onSelectCategory={setCategory}
            maxPrice={maxPrice}
            onMaxPriceChange={setMaxPrice}
          />
        </div>
      </aside>

      <div className="flex flex-col gap-8 md:col-span-9">
        <SearchBar value={query} onChange={setQuery} />

        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-display text-[40px] font-semibold leading-tight text-text-primary md:text-h1">
              Market
            </h1>
            <p className="mt-2 text-body-lg text-text-muted">
              Discover premium dimensional goods.
            </p>
          </div>
          <div className="hidden gap-2 md:flex">
            <button
              className="rounded-lg border border-outline-variant/20 p-2 text-accent transition-colors hover:bg-surface-high"
              aria-label="Grid view"
            >
              <span className="material-symbols">grid_view</span>
            </button>
            <button
              className="rounded-lg border border-outline-variant/20 p-2 text-text-muted opacity-50"
              aria-label="List view"
            >
              <span className="material-symbols">view_list</span>
            </button>
          </div>
        </div>

        <button
          onClick={() => setMobileFiltersOpen((open) => !open)}
          className="flex items-center justify-center gap-2 rounded-xl border border-outline-variant/20 py-3 text-text-primary transition-colors hover:bg-surface-high md:hidden"
        >
          <span className="material-symbols">tune</span>
          Filters
        </button>
        {mobileFiltersOpen ? (
          <div className="md:hidden">
            <FilterSidebar
              selectedCategory={category}
              onSelectCategory={setCategory}
              maxPrice={maxPrice}
              onMaxPriceChange={setMaxPrice}
            />
          </div>
        ) : null}

        <ProductGrid products={filtered} />
      </div>
    </div>
  );
}
