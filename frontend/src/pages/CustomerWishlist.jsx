import React, { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import ProductCard from "../components/product/ProductCard.jsx";
import { PRODUCTS } from "../data/products.js";
import { CUSTOMER_WISHLIST } from "../data/customerWishlist.js";
import { useCart } from "../context/CartContext.jsx";

const SORT_OPTIONS = [
  { id: "recent", label: "Recently Added" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "name", label: "Name: A to Z" },
];

function formatDate(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function CustomerWishlist() {
  const { addItem } = useCart();
  const [wishlistIds, setWishlistIds] = useState(CUSTOMER_WISHLIST);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("recent");

  const wishlistProducts = useMemo(() => {
    return wishlistIds
      .map((item) => {
        const product = PRODUCTS.find((p) => p.id === item.productId);
        if (!product) return null;
        return {
          ...product,
          savedAt: item.savedAt,
          seller: "NUVORA",
        };
      })
      .filter(Boolean);
  }, [wishlistIds]);

  const filteredProducts = useMemo(() => {
    let result = [...wishlistProducts];

    const query = searchQuery.toLowerCase().trim();
    if (query) {
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query)
      );
    }

    switch (sortOption) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "recent":
      default:
        result.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
        break;
    }

    return result;
  }, [wishlistProducts, searchQuery, sortOption]);

  const handleRemoveFromWishlist = useCallback((productId) => {
    setWishlistIds((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  const handleAddToCart = useCallback(
    (product) => {
      addItem(
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category,
        },
        1
      );
    },
    [addItem]
  );

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSortOption("recent");
  }, []);

  return (
    <div className="flex flex-col min-h-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-h2 text-text-primary">Saved Items</h1>
          <p className="font-body-md text-body-md text-text-muted mt-1">
            Keep the products you love close and come back to them whenever you're ready.
          </p>
        </div>
        <Link to="/marketplace">
          <Button type="button">
            <span className="material-symbols text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
              storefront
            </span>
            Continue Shopping
          </Button>
        </Link>
      </div>

      {/* Wishlist Count */}
      <p className="text-sm text-text-muted mb-6">
        {wishlistProducts.length === 1
          ? "1 saved item"
          : `${wishlistProducts.length} saved items`}
      </p>

      {/* Search and Sort Controls */}
      {wishlistProducts.length > 0 && (
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <span
              className="material-symbols text-text-muted absolute left-3 top-1/2 -translate-y-1/2"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              search
            </span>
            <input
              type="text"
              placeholder="Search your saved products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-outline-variant/30 bg-surface-container px-10 py-2.5 font-body-md text-body-md text-text-primary placeholder-text-muted/60 focus:border-lime focus:outline-none"
              aria-label="Search saved products"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                aria-label="Clear search"
              >
                <span className="material-symbols text-lg" style={{ fontVariationSettings: "'FILL' 0" }}>
                  close
                </span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="text-sm text-text-muted whitespace-nowrap">
              Sort by:
            </label>
            <select
              id="sort-select"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="rounded-lg border border-outline-variant/30 bg-surface-container px-3 py-2.5 font-body-md text-body-md text-text-primary focus:border-lime focus:outline-none"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Product Grid or Empty State */}
      {wishlistProducts.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-surface-container">
              <span className="material-symbols text-4xl text-text-muted" style={{ fontVariationSettings: "'FILL' 0" }}>
                favorite
              </span>
            </div>
            <h2 className="font-display text-h3 text-text-primary mb-2">
              Your wishlist is waiting for its first discovery.
            </h2>
            <p className="font-body-md text-body-md text-text-muted mb-8 max-w-md">
              Save products you love and they'll appear here whenever you're ready to revisit them.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/discover">
                <Button size="lg">
                  <span className="material-symbols text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                    auto_awesome
                  </span>
                  Discover Products
                </Button>
              </Link>
              <Link to="/marketplace">
                <Button variant="outline" size="lg">Explore Marketplace</Button>
              </Link>
            </div>
          </div>
        </Card>
      ) : filteredProducts.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-surface-container">
              <span className="material-symbols text-4xl text-text-muted" style={{ fontVariationSettings: "'FILL' 0" }}>
                search_off
              </span>
            </div>
            <h2 className="font-display text-h3 text-text-primary mb-2">No saved items found</h2>
            <p className="font-body-md text-body-md text-text-muted mb-6 max-w-md">
              Try a different search or clear your filters to see more products.
            </p>
            <Button variant="outline" onClick={clearFilters}>
              <span className="material-symbols text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>
                filter_list_off
              </span>
              Clear Search
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <div key={product.id} className="relative group">
              <ProductCard
                id={product.id}
                image={product.image}
                title={product.name}
                price={`$${product.price}`}
                description={product.description}
                badge={product.badge}
                onAddToCart={() => handleAddToCart(product)}
              />
              <button
                onClick={() => handleRemoveFromWishlist(product.id)}
                className="absolute right-2 top-2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-obsidian/80 text-accent backdrop-blur-sm transition-all hover:bg-obsidian hover:scale-110 shadow-lg"
                aria-label={`Remove ${product.name} from saved items`}
              >
                <span
                  className="material-symbols text-[20px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  close
                </span>
              </button>
              <div className="absolute left-2 top-2 z-20 rounded-full bg-surface-container/90 px-2 py-1 text-[10px] font-medium text-text-muted backdrop-blur-sm">
                Saved {formatDate(product.savedAt)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
