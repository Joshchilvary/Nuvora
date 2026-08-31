import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { CATEGORIES } from "../data/products.js";
import { INVENTORY_STATS } from "../data/seller.js";
import { getSellerInventory } from "../services/inventory.js";
import Button from "../components/ui/Button.jsx";

const STATUS_CONFIG = {
  "in-stock": {
    label: "In Stock",
    icon: "check_circle",
    className: "bg-lime/10 text-accent border-lime/30",
    statsIcon: "inventory_2",
  },
  "low-stock": {
    label: "Low Stock",
    icon: "warning",
    className: "bg-amber-400/10 text-amber-400 border-amber-400/30",
    statsIcon: "warning",
  },
  "out-of-stock": {
    label: "Out of Stock",
    icon: "cancel",
    className: "bg-red-400/10 text-red-400 border-red-400/30",
    statsIcon: "cancel",
  },
};

const STATUS_FILTERS = [
  { id: "all", label: "All" },
  { id: "in-stock", label: "In Stock" },
  { id: "low-stock", label: "Low Stock" },
  { id: "out-of-stock", label: "Out of Stock" },
];

const SORT_OPTIONS = [
  { value: "name-asc", label: "Name (A-Z)" },
  { value: "name-desc", label: "Name (Z-A)" },
  { value: "price-asc", label: "Price (Low to High)" },
  { value: "price-desc", label: "Price (High to Low)" },
  { value: "stock-asc", label: "Stock (Low to High)" },
  { value: "stock-desc", label: "Stock (High to Low)" },
  { value: "sales-desc", label: "Sales (High to Low)" },
];

function formatPrice(price) {
  if (price == null) return "—";
  return `$${price.toFixed(2)}`;
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["in-stock"];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${cfg.className}`}
    >
      <span
        className="material-symbols text-xs"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        {cfg.icon}
      </span>
      {cfg.label}
    </span>
  );
}

function InventoryStatCard({ label, value, icon }) {
  return (
    <div className="rounded-xl border border-outline-variant/20 bg-surface-container p-5 shadow-lg">
      <div className="flex items-center gap-2 mb-2">
        <span
          className="material-symbols text-sm text-text-muted"
          style={{ fontVariationSettings: "'FILL' 0" }}
        >
          {icon}
        </span>
        <p className="font-label-sm text-label-sm text-text-muted">{label}</p>
      </div>
      <p className="font-h3 text-h3 text-text-primary">{value}</p>
    </div>
  );
}

function ProductImage({ src, alt, className = "h-12 w-12" }) {
  return (
    <div className={`${className} rounded-md bg-surface-variant overflow-hidden border border-outline-variant/30`}>
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-text-muted">
          <span className="material-symbols text-2xl">image</span>
        </div>
      )}
    </div>
  );
}

function InventoryTableRow({ item }) {
  return (
    <tr className="border-b border-outline-variant/10">
      <td className="py-4">
        <div className="flex items-center gap-3">
          <ProductImage src={item.image} alt={item.name} />
          <div>
            <p className="font-label-sm text-label-sm text-text-primary">{item.name}</p>
            <p className="font-body-md text-sm text-text-muted">{item.category}</p>
          </div>
        </div>
      </td>
      <td className="py-4">
        <span className="font-body-md text-body-md text-text-muted">{item.sku}</span>
      </td>
      <td className="py-4">
        <span className="font-body-md text-body-md text-text-primary">{formatPrice(item.price)}</span>
      </td>
      <td className="py-4">
        <span className="font-body-md text-body-md text-text-primary">{item.stock}</span>
      </td>
      <td className="py-4">
        <StatusBadge status={item.status} />
      </td>
      <td className="py-4">
        <span className="font-body-md text-body-md text-text-muted">
          {item.sales} {item.salesLabel}
        </span>
      </td>
      <td className="py-4 whitespace-nowrap">
        <Link
          to={`/seller/inventory/${item.productId}/edit`}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-outline-variant/30 bg-surface-high px-3 py-1.5 font-label-sm text-label-sm text-text-primary transition-colors hover:text-accent"
          aria-label={`Edit ${item.name}`}
        >
          <span
            className="material-symbols text-sm"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            edit
          </span>
          Edit
        </Link>
      </td>
    </tr>
  );
}

function InventoryCard({ item }) {
  return (
    <div className="rounded-xl border border-outline-variant/20 bg-surface-container p-4 shadow-lg">
      <div className="flex gap-3">
        <ProductImage src={item.image} alt={item.name} className="h-16 w-16 rounded-md" />
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-label-sm text-label-sm text-text-primary">{item.name}</p>
              <p className="font-body-md text-sm text-text-muted">{item.category}</p>
            </div>
            <StatusBadge status={item.status} />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div>
              <p className="font-label-sm text-label-sm text-text-muted">Price</p>
              <p className="font-body-md text-body-md text-text-primary">{formatPrice(item.price)}</p>
            </div>
            <div>
              <p className="font-label-sm text-label-sm text-text-muted">Stock</p>
              <p className="font-body-md text-body-md text-text-primary">{item.stock} units</p>
            </div>
            <div>
              <p className="font-label-sm text-label-sm text-text-muted">SKU</p>
              <p className="font-body-md text-sm text-text-muted">{item.sku}</p>
            </div>
            <div>
              <p className="font-label-sm text-label-sm text-text-muted">Sales</p>
              <p className="font-body-md text-body-md text-text-primary">{item.sales}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Link
          to={`/seller/inventory/${item.productId}/edit`}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-outline-variant/30 bg-surface-high px-3 py-1.5 font-label-sm text-label-sm text-text-primary transition-colors hover:text-accent"
          aria-label={`Edit ${item.name}`}
        >
          <span
            className="material-symbols text-sm"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            edit
          </span>
          Edit
        </Link>
      </div>
    </div>
  );
}

export default function SellerInventory() {
  const [inventory, setInventory] = useState(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");

  useEffect(() => {
    let active = true;
    (async () => {
      const data = await getSellerInventory();
      if (active) setInventory(data);
    })();
    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    if (!inventory) return INVENTORY_STATS;
    return {
      total: inventory.length,
      inStock: inventory.filter((i) => i.status === "in-stock").length,
      lowStock: inventory.filter((i) => i.status === "low-stock").length,
      outOfStock: inventory.filter((i) => i.status === "out-of-stock").length,
    };
  }, [inventory]);

  const filteredAndSorted = useMemo(() => {
    if (!inventory) return [];
    let result = [...inventory];

    const query = searchQuery.toLowerCase().trim();
    if (query) {
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((item) => item.status === statusFilter);
    }

    if (categoryFilter && categoryFilter !== "All Products") {
      result = result.filter((item) => item.category === categoryFilter);
    }

    const sortFns = {
      "name-asc": (a, b) => a.name.localeCompare(b.name),
      "name-desc": (a, b) => b.name.localeCompare(a.name),
      "price-asc": (a, b) => (a.price ?? 0) - (b.price ?? 0),
      "price-desc": (a, b) => (b.price ?? 0) - (a.price ?? 0),
      "stock-asc": (a, b) => (a.stock ?? 0) - (b.stock ?? 0),
      "stock-desc": (a, b) => (b.stock ?? 0) - (a.stock ?? 0),
      "sales-desc": (a, b) => (b.sales ?? 0) - (a.sales ?? 0),
    };
    result.sort(sortFns[sortBy] || sortFns["name-asc"]);

    return result;
  }, [inventory, searchQuery, statusFilter, categoryFilter, sortBy]);

  const hasActiveFilters =
    searchQuery.trim() ||
    statusFilter !== "all" ||
    (categoryFilter && categoryFilter !== "All Products");

  const showEmptySearch = hasActiveFilters && filteredAndSorted.length === 0;
  const showEmptyInventory = inventory !== undefined && inventory.length === 0;

  const clearAllFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setCategoryFilter("");
    setSortBy("name-asc");
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-h2 text-text-primary">Inventory</h1>
          <p className="font-body-md text-body-md text-text-muted mt-1">
            Manage your products, stock levels, and listings.
          </p>
        </div>
        <Link to="/seller/inventory/new">
          <Button className="rounded-full px-6 py-3 text-base">
            <span
              className="material-symbols mr-2"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              add
            </span>
            Add Product
          </Button>
        </Link>
      </div>

      {/* Loading State */}
      {!inventory && (
        <div className="flex items-center justify-center py-16">
          <span
            className="material-symbols text-3xl text-text-muted animate-spin-fast"
            aria-label="Loading"
          >
            sync
          </span>
        </div>
      )}

      {/* Empty Inventory State */}
      {showEmptyInventory && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-surface-container">
            <span
              className="material-symbols text-4xl text-text-muted"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              inventory_2
            </span>
          </div>
          <h3 className="font-display text-h3 text-text-primary mb-2">No products yet</h3>
          <p className="font-body-md text-body-md text-text-muted mb-6 max-w-md">
            Start adding products to your inventory. Once you list your first product, it
            will appear here.
          </p>
          <Link to="/seller/inventory/new">
            <Button>Add Your First Product</Button>
          </Link>
        </div>
      )}

      {/* Inventory Summary + Content */}
      {inventory && inventory.length > 0 && (
        <>
          {/* Inventory Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
            <InventoryStatCard
              label="Total Products"
              value={stats.total}
              icon="inventory_2"
            />
            <InventoryStatCard
              label="In Stock"
              value={stats.inStock}
              icon="check_circle"
            />
            <InventoryStatCard
              label="Low Stock"
              value={stats.lowStock}
              icon="warning"
            />
            <InventoryStatCard
              label="Out of Stock"
              value={stats.outOfStock}
              icon="cancel"
            />
          </div>

          {/* Search + Filters + Sort */}
          <div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch">
            <div className="relative flex-1">
              <span
                className="material-symbols text-text-muted absolute left-3 top-1/2 -translate-y-1/2"
                style={{ fontVariationSettings: "'FILL' 0" }}
              >
                search
              </span>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-outline-variant/30 bg-surface-container px-10 py-2.5 font-body-md text-body-md text-text-primary placeholder-text-muted/60 focus:border-lime focus:outline-none"
                aria-label="Search products"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setStatusFilter(filter.id)}
                    className={`px-4 py-2 rounded-lg font-label-sm text-label-sm transition-all ${
                      statusFilter === filter.id
                        ? "bg-lime text-obsidian"
                        : "bg-surface-high text-text-muted hover:text-text-primary"
                    }`}
                    aria-pressed={statusFilter === filter.id}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-outline-variant/30 bg-surface-container px-3 py-2 font-body-md text-body-md text-text-primary focus:border-lime focus:outline-none"
              aria-label="Filter by category"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat === "All Products" ? "" : cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-outline-variant/30 bg-surface-container px-3 py-2 font-body-md text-body-md text-text-primary focus:border-lime focus:outline-none"
              aria-label="Sort by"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Empty Search Results */}
          {showEmptySearch ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span
                className="material-symbols text-5xl text-text-muted mb-4"
                style={{ fontVariationSettings: "'FILL' 0" }}
              >
                search_off
              </span>
              <h3 className="font-display text-h3 text-text-primary mb-2">No products found</h3>
              <p className="font-body-md text-body-md text-text-muted mb-6 max-w-md">
                Try adjusting your search or filter criteria.
              </p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="font-label-sm text-label-sm text-accent hover:underline transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-outline-variant/20">
                      <th className="text-left py-3 font-label-sm text-label-sm text-text-muted">
                        Product
                      </th>
                      <th className="text-left py-3 font-label-sm text-label-sm text-text-muted">
                        SKU
                      </th>
                      <th className="text-left py-3 font-label-sm text-label-sm text-text-muted">
                        Price
                      </th>
                      <th className="text-left py-3 font-label-sm text-label-sm text-text-muted">
                        Stock
                      </th>
                      <th className="text-left py-3 font-label-sm text-label-sm text-text-muted">
                        Status
                      </th>
                      <th className="text-left py-3 font-label-sm text-label-sm text-text-muted">
                        Sales
                      </th>
                      <th className="text-left py-3 font-label-sm text-label-sm text-text-muted">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSorted.map((item) => (
                      <InventoryTableRow key={item.productId} item={item} />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {filteredAndSorted.map((item) => (
                  <InventoryCard key={item.productId} item={item} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
