import React from "react";
import ProductCard from "../product/ProductCard.jsx";

export default function ProductGrid({ products, loading, onAddToCart }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-outline-variant/20 bg-surface p-6"
          >
            <div className="mb-4 h-64 w-full animate-pulse rounded-xl bg-surface-high" />
            <div className="mb-2 h-6 w-3/4 animate-pulse rounded bg-surface-high" />
            <div className="mb-4 h-4 w-full animate-pulse rounded bg-surface-high" />
            <div className="h-11 w-full animate-pulse rounded-lg bg-surface-high" />
          </div>
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="rounded-2xl border border-outline-variant/20 bg-surface p-12 text-center">
        <span className="material-symbols mb-3 text-5xl text-text-muted">
          search_off
        </span>
        <p className="text-text-muted">
          No products match your discovery filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          image={product.primary_image?.image || product.images?.[0]?.image}
          title={product.name}
          price={`$${product.price}`}
          description={product.description}
          badge={product.badge}
          onAddToCart={() => onAddToCart?.(product)}
        />
      ))}
    </div>
  );
}
