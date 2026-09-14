import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import ProductCard from "../components/product/ProductCard.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useWishlist } from "../context/WishlistContext.jsx";

const SORT_OPTIONS = [
  { id: "recent", label: "Recently Added" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "name", label: "Name: A to Z" },
];

function formatDate(dateStr) {
  if (!dateStr) return null;
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return null;
  }
}

function getImageUrl(item) {
  const product = item?.product;
  return (
    product?.primary_image?.image ||
    product?.images?.[0]?.image ||
    null
  );
}

export default function CustomerWishlist() {
  const { addItem } = useCart();
  const { items, loading, error, remove, refresh } = useWishlist();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("recent");

  useEffect(() => {
    refresh();
  }, [refresh]);

  const wishlistProducts = useMemo(() => {
    return items
      .map((item) => {
        const product = item?.product;
        if (!product) return null;
        return {
          ...product,
          savedAt: item.created_at,
          image: getImageUrl(item),
        };
      })
      .filter(Boolean);
  }, [items]);

  const filteredProducts = useMemo(() => {
    let result = [...wishlistProducts];

    const query = searchQuery.toLowerCase().trim();
    if (query) {
      result = result.filter((product) => {
        const name = product.name?.toLowerCase() || "";
        const cat =
          product.category?.name?.toLowerCase() ||
          product.category?.slug?.toLowerCase() ||
          "";
        return name.includes(query) || cat.includes(query);
      });
    }

    switch (sortOption) {
      case "price-asc":
        result.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case "price-desc":
        result.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case "name":
        result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "recent":
      default:
        result.sort((a, b) => {
          const aDate = a.savedAt ? new Date(a.savedAt).getTime() : 0;
          const bDate = b.savedAt ? new Date(b.savedAt).getTime() : 0;
          return bDate - aDate;
        });
        break;
    }

    return result;
  }, [wishlistProducts, searchQuery, sortOption]);

  const handleRemoveFromWishlist = useCallback(
    async (productId) => {
      await remove(productId);
    },
    [remove]
  );

  const handleAddToCart = useCallback(
    (product) => {
      addItem(
        {
          id: product.id,
          name: product.name,
          price: Number(product.price),
          image: product.image,
          category: product.category?.slug || product.category || "",
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

  if (loading && wishlistProducts.length === 0) {
    return (
      <div className="flex flex-col min-h-full">
        <div className="mb-6">
          <h1 className="font-display text-h2 text-text-primary">Saved Items</h1>
          <p className="font-body-md text-body-md text-text-muted mt-1">
            Loading your saved products…
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-outline-variant/20 bg-surface p-6"
            >
              <div className="mb-4 h-64 w-full animate-pulse rounded-xl bg-surface-container" />
              <div className="mb-2 h-6 w-3/4 animate-pulse rounded bg-surface-container" />
              <div className="mb-4 h-4 w-full animate-pulse rounded bg-surface-container" />
              <div className="h-11 w-full animate-pulse rounded-lg bg-surface-container" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && wishlistProducts.length === 0) {
    return (
      <div className="flex flex-col min-h-full">
        <div className="mb-6">
          <h1 className="font-display text-h2 text-text-primary">Saved Items</h1>
        </div>
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-surface-container">
              <span className="material-symbols text-4xl text-text-muted">
                cloud_off
              </span>
            </div>
            <h2 className="font-display text-h3 text-text-primary mb-2">
              Unable to load your wishlist
            </h2>
            <p className="font-body-md text-body-md text-text-muted mb-8 max-w-md">
              Please try again in a moment.
            </p>
            <Button onClick={refresh}>Try Again</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
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

      <p className="text-sm text-text-muted mb-6">
        {wishlistProducts.length === 1
          ? "1 saved item"
          : `${wishlistProducts.length} saved items`}
      </p>

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
          {filteredProducts.map((product) => {
            const inStock =
              product.stock_quantity == null || product.stock_quantity > 0;
            return (
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
                {!inStock ? (
                  <div className="absolute right-2 top-2 z-20 rounded-full bg-obsidian/80 px-2 py-1 text-[10px] font-medium text-accent backdrop-blur-sm">
                    Out of stock
                  </div>
                ) : null}
                <button
                  onClick={() => handleRemoveFromWishlist(product.id)}
                  className="absolute left-2 top-2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-obsidian/80 text-accent backdrop-blur-sm transition-all hover:bg-obsidian hover:scale-110 shadow-lg"
                  aria-label={`Remove ${product.name} from saved items`}
                >
                  <span
                    className="material-symbols text-[20px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    close
                  </span>
                </button>
                {product.savedAt ? (
                  <div className="absolute left-2 bottom-2 z-20 rounded-full bg-surface-container/90 px-2 py-1 text-[10px] font-medium text-text-muted backdrop-blur-sm">
                    Saved {formatDate(product.savedAt)}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
