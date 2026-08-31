import React from "react";
import { NavLink, Link } from "react-router-dom";
import { SELLER_PROFILE } from "../../data/seller.js";

const SELLER_NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard", href: "/seller", exact: true },
  { id: "inventory", label: "Inventory", icon: "inventory_2", href: "/seller/inventory" },
  { id: "orders", label: "Orders", icon: "local_shipping", href: "/seller/orders" },
  { id: "analytics", label: "Analytics", icon: "monitoring", href: "/seller/analytics" },
  { id: "store", label: "Store", icon: "storefront", href: "/seller/store" },
  { id: "payouts", label: "Payouts", icon: "payments", href: "/seller/payouts" },
  { id: "notifications", label: "Notifications", icon: "notifications", href: "/seller/notifications" },
  { id: "settings", label: "Settings", icon: "settings", href: "/seller/settings" },
];

const MOBILE_NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard", href: "/seller", exact: true },
  { id: "inventory", label: "Inventory", icon: "inventory_2", href: "/seller/inventory" },
  { id: "orders", label: "Orders", icon: "local_shipping", href: "/seller/orders" },
  { id: "analytics", label: "Analytics", icon: "monitoring", href: "/seller/analytics" },
];

function navLinkClass({ isActive }) {
  return `flex items-center px-4 py-3 rounded-lg mx-2 transition-all duration-200 ${
    isActive
      ? "bg-lime text-obsidian"
      : "text-text-muted hover:text-text-primary hover:bg-surface-high hover:translate-x-1"
  }`;
}

function SidebarContent({ mobile = false, onClose }) {
  const handleNavClick = mobile ? onClose : undefined;

  return (
    <div className="flex h-full flex-col">
      {/* Branding / Logo */}
      <div className="px-6 mb-8 mt-4 flex justify-center">
        <NavLink to="/" className="flex items-center gap-3" onClick={handleNavClick}>
          <span className="material-symbols text-2xl text-accent">auto_awesome</span>
          <span className="font-display text-xl font-bold tracking-tight text-accent">
            NUVORA
          </span>
        </NavLink>
      </div>

      {/* Store Identity */}
      <div className="px-6 mb-12 flex flex-col items-center">
        <div className="h-20 w-20 rounded-full bg-surface-variant overflow-hidden mb-4 border border-outline-variant/30">
          <img src={SELLER_PROFILE.avatar} alt="Merchant Avatar" className="h-full w-full object-cover" />
        </div>
        <h2 className="font-display text-h4 text-accent mb-1 text-center">{SELLER_PROFILE.storeName}</h2>
        <p className="font-body-md text-body-md text-text-muted text-center">{SELLER_PROFILE.tier}</p>
      </div>

      {/* Seller Navigation */}
      <nav className="flex-1 overflow-y-auto min-h-0 px-4 space-y-2">
        {SELLER_NAV_ITEMS.map((item) => (
          <NavLink
            key={item.id}
            to={item.href}
            end={item.exact}
            className={navLinkClass}
            onClick={handleNavClick}
          >
            <span
              className="material-symbols mr-4"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {item.icon}
            </span>
            <span className="font-body-md text-body-md">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Actions */}
      <div className="px-6 mt-auto space-y-3 pb-6">
        {/* View Store */}
        <Link
          to="/store"
          onClick={handleNavClick}
          className="flex items-center justify-between rounded-lg border border-outline-variant/30 bg-surface-high px-4 py-3 font-label-sm text-label-sm text-text-muted transition-colors hover:text-accent hover:bg-surface-highest"
        >
          <div className="flex items-center gap-2">
            <span
              className="material-symbols"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              open_in_new
            </span>
            <span>View Store</span>
          </div>
          <span className="text-xs text-text-muted/60">Soon</span>
        </Link>

        {/* Add Product */}
        <button
          type="button"
          className="w-full bg-lime text-obsidian font-label-sm text-label-sm py-3 px-4 rounded-full hover:brightness-110 transition-all flex items-center justify-center shadow-lg"
        >
          <span
            className="material-symbols mr-2"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            add
          </span>
          Add Product
        </button>

        {/* Back to NUVORA */}
        <Link
          to="/"
          onClick={handleNavClick}
          className="flex items-center justify-center gap-2 rounded-lg border border-outline-variant/30 py-3 px-4 font-label-sm text-label-sm text-text-muted transition-colors hover:text-accent hover:bg-surface-high"
        >
          <span
            className="material-symbols"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            arrow_back
          </span>
          <span>Back to NUVORA</span>
        </Link>
      </div>
    </div>
  );
}

export default function SellerSidebar({ mobileOpen = false, onClose = () => {} }) {
  return (
    <>
      {/* Desktop sidebar — always visible on md+ */}
      <aside className="hidden md:fixed md:left-0 md:top-0 md:bottom-0 md:z-40 md:flex md:w-72 md:flex-col md:py-8 md:bg-surface/90 md:backdrop-blur-[20px] md:rounded-r-xl md:border-r md:border-outline-variant/10 md:shadow-2xl">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <div
        className={`md:hidden fixed inset-0 z-[60] transition-all duration-300 ${
          mobileOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!mobileOpen}
      >
        <div
          className={`absolute inset-0 bg-obsidian/70 backdrop-blur-sm transition-opacity duration-300 ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={onClose}
          aria-label="Overlay"
        />
        <aside
          className={`absolute left-0 top-0 h-full w-72 max-w-[85%] overflow-y-auto transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="h-full bg-surface/90 backdrop-blur-[20px] border-r border-outline-variant/10 shadow-2xl">
            <SidebarContent mobile={true} onClose={onClose} />
          </div>
        </aside>
      </div>
    </>
  );
}

export { SELLER_NAV_ITEMS, MOBILE_NAV_ITEMS };
