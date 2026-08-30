import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import ProductCard from "../components/product/ProductCard.jsx";
import { getProductById, getRelatedProducts } from "../services/products.js";
import { useCart } from "../context/CartContext.jsx";

function QuantityStepper({ value, onChange }) {
  return (
    <div className="flex items-center rounded-xl border border-outline-variant/30 bg-surface-low">
      <button
        onClick={() => onChange(Math.max(1, value - 1))}
        className="flex h-11 w-11 items-center justify-center text-text-muted transition-colors hover:text-accent"
        aria-label="Decrease quantity"
      >
        <span className="material-symbols">remove</span>
      </button>
      <span className="w-10 text-center font-semibold text-text-primary">
        {value}
      </span>
      <button
        onClick={() => onChange(value + 1)}
        className="flex h-11 w-11 items-center justify-center text-text-muted transition-colors hover:text-accent"
        aria-label="Increase quantity"
      >
        <span className="material-symbols">add</span>
      </button>
    </div>
  );
}

export default function ProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState(undefined);
  const [related, setRelated] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [favorite, setFavorite] = useState(false);
  const { addItem } = useCart();

  const handleBack = () => {
    if (location.key === "default") {
      navigate("/marketplace");
    } else {
      navigate(-1);
    }
  };

  useEffect(() => {
    let active = true;
    setProduct(undefined);
    setSelectedImage(0);
    setQuantity(1);
    setFavorite(false);

    (async () => {
      const found = await getProductById(productId);
      if (!active) return;
      setProduct(found);
      if (found) {
        const relatedProducts = await getRelatedProducts(found);
        if (active) setRelated(relatedProducts);
      }
    })();

    return () => {
      active = false;
    };
  }, [productId]);

  if (product === undefined) {
    return (
      <div className="flex flex-col items-center gap-4 py-32 text-text-muted">
        <span className="material-symbols animate-pulse text-4xl text-accent">
          progress_activity
        </span>
        <p className="text-body-lg">Loading product…</p>
      </div>
    );
  }

  if (product === null) {
    return (
      <div className="flex flex-col items-center gap-4 py-32 text-center">
        <span className="material-symbols text-5xl text-text-muted">
          search_off
        </span>
        <h1 className="font-display text-h2 text-text-primary">
          Product not found
        </h1>
        <p className="text-text-muted">
          We couldn't find the product you were looking for.
        </p>
        <Link
          to="/marketplace"
          className="mt-2 font-label-sm text-accent hover:underline"
        >
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [product.image];

  return (
    <div>
      <button
        onClick={handleBack}
        className="mb-8 inline-flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-accent"
      >
        <span className="material-symbols text-[20px]">arrow_back</span>
        Back
      </button>
      <div className="space-y-32">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
        <div className="relative flex h-[420px] items-center justify-center overflow-visible rounded-2xl glass-panel lg:col-span-7 lg:h-[600px]">
          <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-surface-highest/30 to-deep-surface/50" />
          <img
            src={images[selectedImage]}
            alt={product.name}
            className="product-float z-10 w-[110%] max-w-[640px] object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,0.5)]"
          />
          {images.length > 1 ? (
            <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-4">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`h-16 w-16 overflow-hidden rounded-lg border bg-surface ${
                    index === selectedImage
                      ? "border-lime"
                      : "border-outline-variant/30 hover:border-lime/50"
                  }`}
                  aria-label={`View image ${index + 1}`}
                >
                  <img
                    src={image}
                    alt=""
                    className="h-full w-full object-cover opacity-80"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col justify-center lg:col-span-5">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant="lime">
              <span className="material-symbols text-[16px]">check_circle</span>
              In Stock
            </Badge>
            {product.badge ? <Badge variant="lime">{product.badge}</Badge> : null}
            <Badge variant="neutral">{product.category}</Badge>
          </div>

          <h1 className="mb-4 font-display text-[40px] font-semibold leading-tight text-text-primary md:text-h1">
            {product.name}
          </h1>
          <p className="mb-8 text-body-lg text-text-muted">
            {product.description}
          </p>

          <div className="mb-10 flex items-end gap-4">
            <span className="font-display text-h2 text-accent">
              ${product.price}
            </span>
            {product.oldPrice ? (
              <span className="pb-1 text-body-md text-text-muted line-through">
                ${product.oldPrice}
              </span>
            ) : null}
          </div>

          <div className="mb-12 flex flex-wrap items-center gap-4">
            <QuantityStepper value={quantity} onChange={setQuantity} />
            <Button
              className="flex-1 rounded-xl px-8 py-4"
              onClick={() => addItem(product, quantity)}
            >
              Add to Cart
            </Button>
            <button
              onClick={() => setFavorite((prev) => !prev)}
              className={`flex h-14 w-14 items-center justify-center rounded-xl border transition-colors ${
                favorite
                  ? "border-lime/40 text-accent"
                  : "border-outline-variant/30 text-text-muted hover:text-accent"
              }`}
              aria-label={favorite ? "Remove from wishlist" : "Add to wishlist"}
              aria-pressed={favorite}
            >
              <span
                className="material-symbols text-[24px]"
                style={{ fontVariationSettings: favorite ? "'FILL' 1" : "'FILL' 0" }}
              >
                favorite
              </span>
            </button>
          </div>

          {product.specs?.length ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-6 border-t border-outline-variant/20 pt-8">
              {product.specs.map((spec) => (
                <div key={spec.label}>
                  <div className="mb-1 text-label-sm text-text-muted">
                    {spec.label}
                  </div>
                  <div className="font-body-md text-text-primary">{spec.value}</div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <section>
        <div className="ai-glow relative overflow-hidden rounded-2xl border border-lime/20 bg-surface/70 p-8 backdrop-blur-[20px]">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-lime/5 blur-3xl" />
          <div className="flex flex-col items-start gap-8 md:flex-row md:items-center">
            <div className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border border-lime/30 bg-surface-high">
              <span className="material-symbols text-3xl text-accent">smart_toy</span>
              <div className="absolute inset-0 animate-ping rounded-full border border-lime opacity-20" />
            </div>
            <div className="flex-grow">
              <h3 className="mb-2 font-display text-h3 text-text-primary">
                Ask NUVORA
              </h3>
              <p className="mb-4 text-body-md text-text-muted">
                Have questions about compatibility, features, or setup? Our AI
                assistant knows everything about {product.name}.
              </p>
              <form
                onSubmit={(event) => event.preventDefault()}
                className="relative w-full max-w-2xl"
              >
                <input
                  className="w-full rounded-lg border border-outline-variant/50 bg-surface-low py-4 pl-4 pr-12 font-body-md text-text-primary outline-none transition-all placeholder:text-text-muted/50 focus:border-lime"
                  placeholder="e.g., How does the adaptive cancellation work?"
                  type="text"
                  aria-label="Ask NUVORA"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-accent transition-colors hover:bg-surface-high"
                  aria-label="Send question"
                >
                  <span className="material-symbols">send</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {related.length ? (
        <section>
          <div className="mb-8 flex items-end justify-between border-b border-outline-variant/20 pb-4">
            <h2 className="font-display text-h2 text-text-primary">
              Related Discoveries
            </h2>
            <Link
              to="/marketplace"
              className="flex items-center gap-1 font-label-sm text-accent hover:underline"
            >
              View All
              <span className="material-symbols text-[18px]">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard
                key={item.id}
                id={item.id}
                image={item.image}
                title={item.name}
                price={`$${item.price}`}
                description={item.description}
                badge={item.badge}
                onAddToCart={() => addItem(item, 1)}
              />
            ))}
          </div>
        </section>
      ) : null}
      </div>
    </div>
  );
}
