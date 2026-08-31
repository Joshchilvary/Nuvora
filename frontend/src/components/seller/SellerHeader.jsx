import React from "react";
import { Link, useLocation } from "react-router-dom";
import { SELLER_PROFILE } from "../../data/seller.js";

const PAGE_TITLES = {
  "/seller": { title: "Overview", subtitle: "Your store's performance today." },
  "/seller/inventory": { title: "Inventory", subtitle: "Manage your products and stock levels." },
  "/seller/orders": { title: "Orders", subtitle: "Track and fulfill customer orders." },
  "/seller/analytics": { title: "Analytics", subtitle: "Performance insights and metrics." },
  "/seller/store": { title: "Store", subtitle: "Customize your storefront." },
  "/seller/payouts": { title: "Payouts", subtitle: "View your earnings and transactions." },
  "/seller/notifications": { title: "Notifications", subtitle: "Recent alerts and updates." },
  "/seller/settings": { title: "Settings", subtitle: "Store and account preferences." },
};

export default function SellerHeader({ onMenuClick }) {
  const location = useLocation();
  const page = PAGE_TITLES[location.pathname] || PAGE_TITLES["/seller"];

  return (
    <header className="flex justify-between items-center px-5 py-4 md:py-6 md:px-16 border-b border-outline-variant/20">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="md:hidden text-text-muted hover:text-text-primary transition-colors"
          aria-label="Open navigation"
        >
          <span className="material-symbols text-2xl">menu</span>
        </button>
        <div className="hidden md:block">
          <h1 className="font-display text-h2 text-text-primary">{page.title}</h1>
          <p className="font-body-md text-body-md text-text-muted mt-1">{page.subtitle}</p>
        </div>
        <div className="md:hidden">
          <h1 className="font-display text-h4 text-text-primary">{page.title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* View Store */}
        <Link
          to="/store"
          className="hidden sm:flex items-center gap-2 rounded-lg border border-outline-variant/30 bg-surface-high px-3 py-2 font-label-sm text-label-sm text-text-muted transition-colors hover:text-accent hover:bg-surface-highest"
        >
          <span
            className="material-symbols text-sm"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            open_in_new
          </span>
          <span>View Store</span>
          <span className="text-xs text-text-muted/60">Soon</span>
        </Link>

        {/* Notifications */}
        <div className="relative">
          <span
            className="material-symbols text-text-muted hover:text-accent cursor-pointer transition-colors text-2xl"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            notifications
          </span>
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-400" />
        </div>

        {/* Profile */}
        <div className="h-10 w-10 rounded-full bg-surface-variant border border-outline-variant/30 overflow-hidden">
          <img
            src={SELLER_PROFILE.avatar}
            alt="Seller"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </header>
  );
}
