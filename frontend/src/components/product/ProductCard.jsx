import React, { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../ui/Button.jsx";
import Badge from "../ui/Badge.jsx";

export default function ProductCard({
  id,
  image,
  title,
  price,
  description,
  badge,
  onAddToCart,
}) {
  const [favorite, setFavorite] = useState(false);
  const [added, setAdded] = useState(false);
  const [popped, setPopped] = useState(false);
  const [flyKey, setFlyKey] = useState(0);

  const handleAddToCart = () => {
    onAddToCart?.();
    setAdded(true);
    setPopped(true);
    setTimeout(() => setPopped(false), 500);
    setFlyKey((k) => k + 1);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <article className="group relative overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-outline-variant/20 transition-shadow hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
      {id ? (
        <Link
          to={`/product/${id}`}
          className="absolute inset-0 z-[1]"
          aria-label={`View ${title}`}
        />
      ) : null}

      <div className="relative h-64 overflow-hidden bg-deep-surface">
        {image ? (
          <img
            src={image}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-text-muted">
            <span className="material-symbols text-5xl">image</span>
          </div>
        )}
        <button
          onClick={() => setFavorite((prev) => !prev)}
          className={`absolute right-4 top-4 z-10 flex items-center justify-center rounded-full bg-deep-surface/70 p-2 backdrop-blur-sm transition-colors ${
            favorite ? "text-accent" : "text-text-muted hover:text-accent"
          }`}
          aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={favorite}
        >
          <span
            className="material-symbols text-[20px]"
            style={{ fontVariationSettings: favorite ? "'FILL' 1" : "'FILL' 0" }}
          >
            favorite
          </span>
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
        <div className="relative z-10">
          <Button
            variant="outline"
            className={`w-full ${popped ? "animate-add-pop" : ""}`}
            onClick={handleAddToCart}
          >
            {added ? (
              <>
                <span className="material-symbols text-sm">check_circle</span>
                Added!
              </>
            ) : (
              <>
                <span className="material-symbols text-sm">shopping_cart</span>
                Add to Cart
              </>
            )}
          </Button>
          {added && (
            <span
              key={flyKey}
              className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl text-lime material-symbols animate-fly-to-cart"
            >
              shopping_cart
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
