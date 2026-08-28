import React from "react";
import Button from "../ui/Button.jsx";
import Badge from "../ui/Badge.jsx";

export default function ProductCard({
  image,
  title,
  price,
  description,
  badge,
  onAddToCart,
}) {
  return (
    <article className="group relative overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-outline-variant/20 transition-shadow hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
      <div className="relative h-64 overflow-hidden bg-deep-surface">
        {image ? (
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-text-muted">
            <span className="material-symbols text-5xl">image</span>
          </div>
        )}
        <button
          className="absolute right-4 top-4 flex items-center justify-center rounded-full bg-obsidian/70 p-2 text-text-muted backdrop-blur-sm transition-colors hover:text-accent"
          aria-label="Add to favorites"
        >
          <span className="material-symbols text-[20px]">favorite</span>
        </button>
      </div>

      <div className="p-6">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="line-clamp-1 font-display text-lg font-semibold text-text-primary">
            {title}
          </h3>
          {price ? <Badge variant="neutral">{price}</Badge> : null}
        </div>
        {description ? (
          <p className="mb-4 line-clamp-2 text-sm text-text-muted">{description}</p>
        ) : null}
        {badge ? (
          <div className="mb-4">
            <Badge variant="lime">{badge}</Badge>
          </div>
        ) : null}
        <Button variant="outline" className="w-full" onClick={onAddToCart}>
          Add to Cart
        </Button>
      </div>
    </article>
  );
}
