import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  CUSTOMER_NAME,
  CUSTOMER_STATS,
  RECENT_ORDERS,
  SAVED_PRODUCTS,
  AI_RECOMMENDATION,
} from "../data/customer.js";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: "dashboard", href: "/customer" },
  { id: "orders", label: "Orders", icon: "local_shipping", href: "#" },
  { id: "wishlist", label: "Wishlist", icon: "favorite", href: "#" },
  { id: "notifications", label: "Notifications", icon: "notifications", href: "#" },
  { id: "settings", label: "Settings", icon: "settings", href: "#" },
];

export default function CustomerHub() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-background">
      {/* Mobile top bar */}
      <div className="flex items-center justify-between px-5 py-4 md:hidden">
        <Link to="/" className="font-headline-md text-headline-md text-text-primary tracking-tight">
          NUVORA
        </Link>
        <button
          type="button"
          onClick={() => setSidebarOpen((prev) => !prev)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant/30 bg-surface-low"
          aria-label="Toggle menu"
        >
          <span
            className="material-symbols text-text-primary"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            {sidebarOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-outline-variant/20 bg-surface/90 py-8 backdrop-blur-[20px] transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-8 mb-12">
          <Link to="/" className="font-headline-md text-headline-md text-accent tracking-tight">
            NUVORA
          </Link>
        </div>

        <div className="px-8 mb-8 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full border border-outline-variant/30 bg-surface-high" />
          <div>
            <p className="font-label-sm text-label-sm text-text-primary">{CUSTOMER_NAME}</p>
            <p className="font-body-md text-xs text-text-muted">Premium Member</p>
          </div>
        </div>

        <nav className="flex-1 px-6">
          <ul className="flex flex-col gap-2">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.href}
                  className={`flex items-center gap-4 rounded-lg px-4 py-3 transition-all ${
                    item.id === "overview"
                      ? "bg-lime/10 text-lime"
                      : "text-text-muted hover:bg-surface-high hover:text-text-primary"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span
                    className="material-symbols text-[20px]"
                    style={{ fontVariationSettings: item.id === "overview" ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {item.icon}
                  </span>
                  <span className="font-label-sm text-label-sm">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="px-8">
          <Link
            to="/marketplace"
            className="flex w-full items-center justify-center rounded-lg border border-outline-variant/30 py-3 font-label-sm text-label-sm text-text-primary transition-colors hover:bg-surface-high"
            onClick={() => setSidebarOpen(false)}
          >
            Explore Market
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-72 flex flex-col min-h-screen">
        <div className="flex-1 px-5 py-12 md:px-16 md:py-16">
          {/* Header */}
          <header className="mb-12">
            <h2 className="font-h2 text-h2 text-text-primary mb-2">Welcome back, {CUSTOMER_NAME.split(" ")[0]}.</h2>
            <p className="font-body-lg text-body-lg text-text-muted">
              Here is your dimensional discovery overview.
            </p>
          </header>

          {/* Stats Grid */}
          <section className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {CUSTOMER_STATS.map((stat) => (
              <div
                key={stat.id}
                className={`rounded-xl border border-outline-variant/20 p-6 shadow-lg ${
                  stat.glow ? "ai-glow relative overflow-hidden bg-surface-container" : "bg-surface-container"
                }`}
              >
                {stat.glow && (
                  <div className="absolute inset-0 bg-gradient-to-br from-lime/5 to-transparent opacity-50" />
                )}
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <span
                    className={`material-symbols text-2xl ${
                      stat.glow ? "text-lime" : "text-accent"
                    }`}
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
            ))}
          </section>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Recent Discoveries (Orders) */}
            <section className="lg:col-span-2 space-y-6">
              <h3 className="font-h4 text-h4 text-text-primary">Recent Discoveries</h3>
              <div className="overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container shadow-lg backdrop-blur-[20px]">
                {RECENT_ORDERS.map((order, index) => (
                  <Link
                    key={order.id}
                    to="/track-order"
                    className={`flex items-center justify-between p-6 transition-colors hover:bg-surface-high ${
                      index !== 0 ? "border-t border-outline-variant/10" : ""
                    }`}
                  >
                    <div className="flex items-center gap-6">
                      <div className="h-16 w-16 rounded-lg overflow-hidden bg-surface-high">
                        <img
                          src={order.image}
                          alt={order.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div>
                        <h4 className="font-label-sm text-label-sm text-text-primary transition-colors group-hover:text-accent">
                          {order.name}
                        </h4>
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
            </section>

            {/* Saved for Later */}
            <section className="space-y-6">
              <h3 className="font-h4 text-h4 text-text-primary">Saved for Later</h3>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-6">
                {SAVED_PRODUCTS.map((product) => (
                  <div
                    key={product.id}
                    className="group cursor-pointer rounded-xl border border-outline-variant/20 bg-surface-container p-4 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_30px_60px_rgba(0,0,0,0.3)]"
                  >
                    <div className="relative mb-4 h-32 w-full overflow-hidden rounded-lg bg-surface-high">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-2 flex items-center justify-center rounded-full bg-surface-low/70 p-1.5 backdrop-blur-sm text-accent transition-colors hover:bg-accent hover:text-obsidian"
                        aria-label="Remove from favorites"
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
                    <p className="font-body-md text-sm text-text-muted">{product.price}</p>
                  </div>
                ))}
              </div>
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
                    <div className="mb-2 flex items-center gap-2 text-accent">
                      <span className="material-symbols">auto_awesome</span>
                      <span className="font-label-sm text-label-sm tracking-widest uppercase">
                        {AI_RECOMMENDATION.label}
                      </span>
                    </div>
                    <h3 className="font-h2 text-h2 text-text-primary">{AI_RECOMMENDATION.title}</h3>
                    <p className="font-body-lg text-body-lg text-text-muted max-w-xl">
                      {AI_RECOMMENDATION.description}
                    </p>
                    <button
                      type="button"
                      className="mt-4 flex items-center gap-2 rounded-lg border border-outline-variant/30 px-6 py-3 font-label-sm text-label-sm text-text-primary transition-colors hover:border-accent hover:text-accent"
                    >
                      View Full Analysis
                      <span className="material-symbols text-sm">arrow_forward</span>
                    </button>
                  </div>
                  <div className="w-full md:w-1/3 flex justify-center">
                    <div className="relative h-64 w-48">
                      <div className="absolute inset-0 bg-surface border border-outline-variant/30 rounded-xl translate-x-4 translate-y-4 rotate-3 opacity-50 transition-transform group-hover:translate-x-6 group-hover:translate-y-6 group-hover:rotate-6" />
                      <div className="absolute inset-0 bg-surface-container border border-outline-variant/50 rounded-xl translate-x-2 translate-y-2 rotate-1 opacity-70 transition-transform group-hover:translate-x-3 group-hover:translate-y-3 group-hover:rotate-3" />
                      <div className="absolute inset-0 overflow-hidden rounded-xl border border-lime/30 bg-surface-container-high shadow-2xl transition-transform group-hover:-translate-y-2 group-hover:-translate-x-2">
                        <img
                          src={AI_RECOMMENDATION.image}
                          alt={AI_RECOMMENDATION.productName}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-surface-container-lowest to-transparent p-4">
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
        </div>

        {/* Footer */}
        <footer className="border-t border-outline-variant/30 bg-surface-container-lowest px-5 py-12 md:px-16">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div>
              <span className="font-display text-h3 text-accent">NUVORA</span>
              <p className="mt-2 text-sm text-text-muted">&copy; 2024 NUVORA. Dimensional Discovery.</p>
            </div>
            <nav className="flex flex-wrap justify-center gap-6 text-sm">
              <Link to="/privacy" className="text-text-muted transition-colors hover:text-accent">
                Privacy
              </Link>
              <Link to="/terms" className="text-text-muted transition-colors hover:text-accent">
                Terms
              </Link>
              <Link to="/developers" className="text-text-muted transition-colors hover:text-accent">
                API
              </Link>
              <Link to="/careers" className="text-text-muted transition-colors hover:text-accent">
                Careers
              </Link>
            </nav>
          </div>
        </footer>
      </main>
    </div>
  );
}
