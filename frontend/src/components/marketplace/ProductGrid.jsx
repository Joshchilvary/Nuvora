import React from "react";
import ProductCard from "../product/ProductCard.jsx";

export default function ProductGrid({ products, onAddToCart }) {
  if (products.length === 0) {
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
          image={product.image}
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
