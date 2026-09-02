import React, { useState, useCallback } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useCart } from "../../context/CartContext.jsx";
import { CUSTOMER_PROFILE } from "../../data/customerDashboard.js";
import { INITIAL_CUSTOMER_NOTIFICATIONS } from "../../data/customerNotifications.js";
import { CustomerNotificationContext } from "../../pages/CustomerNotifications.jsx";

const CUSTOMER_NAV = [
  { id: "overview", label: "Overview", icon: "dashboard", href: "/customer" },
  { id: "orders", label: "Orders", icon: "local_shipping", href: "/customer/orders" },
  { id: "wishlist", label: "Wishlist", icon: "favorite", href: "/customer/wishlist" },
  { id: "reviews", label: "Reviews", icon: "rate_review", href: "/customer/reviews" },
  { id: "notifications", label: "Notifications", icon: "notifications", href: "/customer/notifications" },
  { id: "profile", label: "Profile", icon: "person", href: "/customer/profile" },
  { id: "settings", label: "Settings", icon: "settings", href: "/customer/settings" },
];

function navLinkClass({ isActive }) {
  return `flex items-center px-4 py-3 rounded-lg mx-2 transition-all duration-200 ${
    isActive
      ? "bg-lime text-obsidian"
      : "text-text-muted hover:text-text-primary hover:bg-surface-high hover:translate-x-1"
  }`;
}

export default function CustomerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { totalItems } = useCart();
  const [notifications, setNotifications] = useState(INITIAL_CUSTOMER_NOTIFICATIONS);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const dismissNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <CustomerNotificationContext.Provider value={{ notifications, markAsRead, markAllAsRead, dismissNotification }}>
    <div className="relative min-h-screen bg-background">
      {/* Mobile top bar */}
      <div className="flex items-center justify-between px-5 py-4 md:hidden">
        <Link to="/" className="font-display text-xl font-bold tracking-tight text-accent">
          NUVORA
        </Link>
        <button
          type="button"
          onClick={() => setSidebarOpen((prev) => !prev)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant/30 bg-surface-high"
          aria-label="Toggle menu"
        >
          <span className="material-symbols text-text-primary" style={{ fontVariationSettings: "'FILL' 0" }}>
            {sidebarOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-outline-variant/20 bg-surface/90 py-8 backdrop-blur-[20px] transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-8 mb-12">
          <Link to="/" className="font-display text-xl font-bold tracking-tight text-accent">
            NUVORA
          </Link>
        </div>

        <div className="px-8 mb-8 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full overflow-hidden border border-outline-variant/30">
            <img src={CUSTOMER_PROFILE.avatar} alt="Profile" className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="font-label-sm text-label-sm text-text-primary">{CUSTOMER_PROFILE.name}</p>
            <p className="font-body-md text-xs text-text-muted">{CUSTOMER_PROFILE.tier}</p>
          </div>
        </div>

        <nav className="flex-1 px-6">
          <ul className="flex flex-col gap-2">
            {CUSTOMER_NAV.map((item) => (
              <li key={item.id}>
                {item.href ? (
                  <NavLink
                    to={item.href}
                    end={item.id === "overview"}
                    className={navLinkClass}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span
                      className="material-symbols mr-4"
                      style={{ fontVariationSettings: item.id === "overview" ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      {item.icon}
                    </span>
                    <span className="font-label-sm text-label-sm">{item.label}</span>
                  </NavLink>
                ) : (
                  <span className="flex items-center gap-4 rounded-lg px-4 py-3 mx-2 text-text-muted/50 cursor-not-allowed">
                    <span className="material-symbols mr-4" style={{ fontVariationSettings: "'FILL' 0" }}>
                      {item.icon}
                    </span>
                    <span className="font-label-sm text-label-sm">{item.label}</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="px-8 flex flex-col gap-3">
          <Link
            to="/marketplace"
            className="flex w-full items-center justify-center rounded-lg bg-lime py-3 font-label-sm text-label-sm text-obsidian hover:brightness-110 transition-all"
            onClick={() => setSidebarOpen(false)}
          >
            Explore Market
          </Link>
          <Link
            to="/"
            className="flex w-full items-center justify-center rounded-lg border border-outline-variant/30 py-3 font-label-sm text-label-sm text-text-muted transition-colors hover:text-accent hover:bg-surface-high"
            onClick={() => setSidebarOpen(false)}
          >
            Back to NUVORA
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-72 min-h-screen flex flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-outline-variant/20 bg-background/90 px-5 py-3 backdrop-blur-md md:px-8">
          <div className="md:hidden" />
          <div className="hidden md:block" />
          <div className="flex items-center gap-3">
            <Link
              to="/cart"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant/30 bg-surface-high text-text-muted transition-colors hover:text-accent hover:bg-surface-highest"
              aria-label="Shopping cart"
            >
              <span className="material-symbols text-xl" style={{ fontVariationSettings: "'FILL' 0" }}>
                shopping_cart
              </span>
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-lime px-1 text-[10px] font-bold text-obsidian">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Link>
            <Link
              to="/customer/notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant/30 bg-surface-high text-text-muted transition-colors hover:text-accent hover:bg-surface-highest"
              aria-label="Notifications"
            >
              <span className="material-symbols text-xl" style={{ fontVariationSettings: "'FILL' 0" }}>
                notifications
              </span>
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-lime px-1 text-[10px] font-bold text-obsidian">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant/30 bg-surface-high text-text-muted transition-colors hover:text-accent hover:bg-surface-highest"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              <span
                className="material-symbols text-xl"
                style={{ fontVariationSettings: theme === "dark" ? "'FILL' 0" : "'FILL' 1" }}
              >
                {theme === "dark" ? "light_mode" : "dark_mode"}
              </span>
            </button>
            <div className="h-9 w-9 rounded-full overflow-hidden border border-outline-variant/30">
              <img src={CUSTOMER_PROFILE.avatar} alt="Profile" className="h-full w-full object-cover" />
            </div>
          </div>
        </header>

        <div className="flex-1 px-5 py-6 md:px-8 md:py-8">
          <Outlet />
        </div>
      </main>
    </div>
    </CustomerNotificationContext.Provider>
  );
}
