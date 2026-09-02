import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import {
  CUSTOMER_PROFILE,
  CUSTOMER_STATS,
  RECENT_ORDERS,
  SAVED_PRODUCTS,
  AI_RECOMMENDATION,
} from "../data/customerDashboard.js";
import Footer from "../components/layout/Footer.jsx";
import Button from "../components/ui/Button.jsx";

function StatCard({ stat }) {
  return (
    <div
      className={`rounded-xl border border-outline-variant/20 p-6 shadow-lg ${
        stat.glow ? "ai-glow relative overflow-hidden bg-surface-container" : "bg-surface-container"
      }`}
    >
      {stat.glow && (
        <div className="absolute inset-0 bg-gradient-to-br from-lime/5 to-transparent opacity-50" />
      )}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <span
          className="material-symbols text-2xl text-accent"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {stat.icon}
        </span>
        {stat.status && (
          <span className="text-xs font-semibold text-accent bg-lime/10 px-2 py-1 rounded-full">
            {stat.status}
          </span>
        )}
      </div>
      <p className="font-h3 text-h3 text-text-primary relative z-10">{stat.value}</p>
      <p className="font-label-sm text-label-sm text-text-muted relative z-10">{stat.label}</p>
    </div>
  );
}

function SavedProductCard({ product, onAddToCart }) {
  const [added, setAdded] = useState(false);
  const [popped, setPopped] = useState(false);
  const [flyKey, setFlyKey] = useState(0);

  const handleAddToCart = () => {
    onAddToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    setAdded(true);
    setPopped(true);
    setTimeout(() => setPopped(false), 500);
    setFlyKey((k) => k + 1);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group cursor-pointer rounded-xl border border-outline-variant/20 bg-surface-container p-4 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_30px_60px_rgba(0,0,0,0.3)]">
      <div className="relative mb-4 h-32 w-full overflow-hidden rounded-lg bg-surface-high">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <button
          type="button"
          className="absolute right-2 top-2 flex items-center justify-center rounded-full bg-obsidian/50 p-1.5 backdrop-blur-sm text-accent transition-colors hover:bg-accent hover:text-obsidian"
          aria-label="Remove from wishlist"
        >
          <span
            className="material-symbols text-sm"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            favorite
          </span>
        </button>
      </div>
      <h4 className="truncate font-label-sm text-label-sm text-text-primary">{product.name}</h4>
      <p className="font-body-md text-sm text-text-muted mt-1">${product.price.toFixed(2)}</p>
      <div className="relative">
        <button
          type="button"
          onClick={handleAddToCart}
          className={`mt-3 w-full rounded-lg border border-outline-variant/30 px-3 py-1.5 text-xs font-semibold text-text-primary transition-colors hover:border-accent hover:text-accent ${popped ? "animate-add-pop" : ""}`}
        >
          {added ? (
            <>
              <span className="material-symbols text-xs">check_circle</span>
              Added
            </>
          ) : (
            <>
              <span className="material-symbols text-xs">shopping_cart</span>
              Add to Cart
            </>
          )}
        </button>
        {added && (
          <span
            key={flyKey}
            className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg text-lime material-symbols animate-fly-to-cart"
          >
            shopping_cart
          </span>
        )}
      </div>
    </div>
  );
}

export default function CustomerHub() {
  const { addItem } = useCart();

  const handleAddToCart = (product) => {
    addItem(product, 1);
  };

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1 px-5 py-8 md:px-16 md:py-12 w-full min-w-0">
          {/* Header */}
          <header className="mb-10">
            <h2 className="font-h2 text-h2 text-text-primary mb-2">
              Welcome back, {CUSTOMER_PROFILE.name.split(" ")[0]}.
            </h2>
            <p className="font-body-lg text-body-lg text-text-muted">
              Here is your dimensional discovery overview.
            </p>
          </header>

          {/* Stats Grid */}
          <section className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-3">
            {CUSTOMER_STATS.map((stat) => (
              <StatCard key={stat.id} stat={stat} />
            ))}
          </section>

          {/* Main Bento Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Recent Discoveries (Orders) */}
            <section className="lg:col-span-2 space-y-6">
              <h3 className="font-h4 text-h4 text-text-primary">Recent Discoveries</h3>
              {RECENT_ORDERS.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-outline-variant/20 bg-surface-container py-12 text-center">
                  <span
                    className="material-symbols text-4xl text-text-muted mb-3"
                    style={{ fontVariationSettings: "'FILL' 0" }}
                  >
                    shopping_bag
                  </span>
                  <p className="font-body-md text-body-md text-text-muted mb-4">No orders yet</p>
                  <Link to="/marketplace">
                    <Button>Explore Marketplace</Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container shadow-lg backdrop-blur-[20px]">
                  {RECENT_ORDERS.map((order, index) => (
                    <Link
                      key={order.id}
                      to="/track-order"
                      className={`flex items-center justify-between p-6 transition-colors hover:bg-surface-high ${
                        index !== 0 ? "border-t border-outline-variant/10" : ""
                      }`}
                    >
                      <div className="flex items-center gap-4 md:gap-6">
                        <div className="h-14 w-14 md:h-16 md:w-16 shrink-0 rounded-lg overflow-hidden bg-surface-high">
                          <img
                            src={order.image}
                            alt={order.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div>
                          <h4 className="font-label-sm text-label-sm text-text-primary">{order.name}</h4>
                          <p className="font-body-md text-sm text-text-muted">Order #{order.id}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-label-sm text-label-sm ${
                            order.status === "In Transit" ? "text-accent" : "text-text-muted"
                          }`}
                        >
                          {order.status}
                        </p>
                        <p className="font-body-md text-xs text-text-muted">{order.date}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Saved for Later */}
            <section className="space-y-6">
              <h3 className="font-h4 text-h4 text-text-primary">Saved for Later</h3>
              {SAVED_PRODUCTS.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-outline-variant/20 bg-surface-container py-12 text-center">
                  <span
                    className="material-symbols text-4xl text-text-muted mb-3"
                    style={{ fontVariationSettings: "'FILL' 0" }}
                  >
                    favorite
                  </span>
                  <p className="font-body-md text-body-md text-text-muted mb-4">Your wishlist is empty</p>
                  <Link to="/discover">
                    <Button>Discover Products</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                  {SAVED_PRODUCTS.map((product) => (
                    <SavedProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* AI Recommendations */}
            <section className="lg:col-span-3">
              <div className="relative overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-8 shadow-[0_20px_50px_rgba(0,0,0,0.4)] md:p-12 ai-glow">
                <div className="pointer-events-none absolute inset-0 opacity-20">
                  <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-lime/20 blur-[100px]" />
                  <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-lime/10 blur-[120px]" />
                </div>
                <div className="relative z-10 flex flex-col items-center gap-8 md:flex-row">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-2 text-accent">
                      <span className="material-symbols" style={{ fontVariationSettings: "'FILL' 1" }}>
                        auto_awesome
                      </span>
                      <span className="font-label-sm text-label-sm tracking-widest uppercase">
                        {AI_RECOMMENDATION.label}
                      </span>
                    </div>
                    <h3 className="font-h2 text-h2 text-text-primary">{AI_RECOMMENDATION.title}</h3>
                    <p className="font-body-lg text-body-lg text-text-muted max-w-xl">
                      {AI_RECOMMENDATION.description}
                    </p>
                    <Link
                      to={AI_RECOMMENDATION.productId ? `/product/${AI_RECOMMENDATION.productId}` : "/discover"}
                      className="inline-flex items-center gap-2 rounded-lg border border-outline-variant/30 px-6 py-3 font-label-sm text-label-sm text-text-primary transition-colors hover:border-accent hover:text-accent"
                    >
                      View Full Analysis
                      <span className="material-symbols text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>
                        arrow_forward
                      </span>
                    </Link>
                  </div>
                  <div className="w-full md:w-1/3 flex justify-center">
                    <div className="relative h-64 w-48">
                      <div className="absolute inset-0 bg-surface border border-outline-variant/30 rounded-xl translate-x-4 translate-y-4 rotate-3 opacity-50" />
                      <div className="absolute inset-0 bg-surface-container border border-outline-variant/50 rounded-xl translate-x-2 translate-y-2 rotate-1 opacity-70" />
                      <div className="absolute inset-0 overflow-hidden rounded-xl border border-lime/30 bg-surface-container-high shadow-2xl">
                        <img
                          src={AI_RECOMMENDATION.image}
                          alt={AI_RECOMMENDATION.productName}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-obsidian/80 to-transparent p-4">
                          <h4 className="font-label-sm text-label-sm text-text-primary">
                            {AI_RECOMMENDATION.productName}
                          </h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
