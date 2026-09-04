import React, { useEffect, useMemo, useState } from "react";
import FilterSidebar from "../components/marketplace/FilterSidebar.jsx";
import SearchBar from "../components/marketplace/SearchBar.jsx";
import ProductGrid from "../components/marketplace/ProductGrid.jsx";
import { useCart } from "../context/CartContext.jsx";
import { getCategories, getProducts } from "../services/api/marketplace.js";

export default function Marketplace() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [maxPrice, setMaxPrice] = useState(1000);
  const [minPrice, setMinPrice] = useState("");
  const [sort, setSort] = useState("newest");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addItem } = useCart();

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    getCategories()
      .then((data) => {
        if (!active) return;
        setCategories(data);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || "Failed to load categories");
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    const params = {
      search: query.trim() || undefined,
      category: category || undefined,
      min_price: minPrice !== "" ? Number(minPrice) : undefined,
      max_price: maxPrice < 1000 ? maxPrice : undefined,
      ordering: sort,
    };

    getProducts(params)
      .then((data) => {
        if (!active) return;
        setProducts(data.results);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || "Failed to load products");
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [query, category, maxPrice, minPrice, sort]);

  const displayCategories = useMemo(() => {
    const list = categories
      .filter((item) => !item.parent)
      .map((item) => item.name);
    return ["All Products", ...list];
  }, [categories]);

  const handleCategoryChange = (name) => {
    setCategory(name === "All Products" ? "" : name);
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
      <aside className="hidden md:col-span-3 md:block">
        <div className="sticky top-28">
          <FilterSidebar
            categories={displayCategories}
            selectedCategory={category}
            onSelectCategory={handleCategoryChange}
            maxPrice={maxPrice}
            onMaxPriceChange={setMaxPrice}
            minPrice={minPrice}
            onMinPriceChange={setMinPrice}
            sort={sort}
            onSortChange={setSort}
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
              categories={displayCategories}
              selectedCategory={category}
              onSelectCategory={handleCategoryChange}
              maxPrice={maxPrice}
              onMaxPriceChange={setMaxPrice}
              minPrice={minPrice}
              onMinPriceChange={setMinPrice}
              sort={sort}
              onSortChange={setSort}
            />
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-outline-variant/20 bg-surface p-12 text-center text-text-muted">
            <p>{error}</p>
          </div>
        ) : (
          <ProductGrid
            products={products}
            loading={loading}
            onAddToCart={(product) => addItem(product, 1)}
          />
        )}
      </div>
    </div>
  );
}
