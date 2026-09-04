import React, { useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import Button from "../ui/Button.jsx";
import Avatar from "../ui/Avatar.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

function navLinkClass({ isActive }) {
  return `block py-3 font-semibold transition-colors ${
    isActive ? "text-accent" : "text-text-primary hover:text-accent"
  }`;
}

const CUSTOMER_ITEMS = [
  { label: "Customer Dashboard", icon: "dashboard", to: "/customer" },
  { label: "Orders", icon: "local_shipping", to: "/customer/orders" },
  { label: "Wishlist", icon: "favorite", to: "/customer/wishlist" },
  { label: "Notifications", icon: "notifications", to: "/customer/notifications" },
  { label: "Profile", icon: "person", to: "/customer/profile" },
  { label: "Settings", icon: "settings", to: "/customer/settings" },
];

export default function MobileMenu({ open, onClose, links }) {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const firstName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
  const displayName = firstName || user?.email || "";
  const isVerified = Boolean(user?.isVerified);
  const showSeller = Boolean(user?.isSeller);

  const accountItems = [...CUSTOMER_ITEMS];
  if (showSeller) {
    accountItems.splice(1, 0, {
      label: "Seller Dashboard",
      icon: "storefront",
      to: "/seller",
    });
  }

  const handleAccountClick = (to) => {
    onClose();
    navigate(to);
  };

  const handleLogout = async () => {
    onClose();
    try {
      await logout();
    } finally {
      navigate("/", { replace: true });
    }
  };

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-[60] md:hidden ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <div
        className={`absolute inset-0 bg-obsidian/70 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      <aside
        className={`absolute right-0 top-0 flex h-full w-72 max-w-[80%] flex-col gap-2 border-l border-outline-variant/20 bg-surface p-6 shadow-2xl transition-transform duration-300 overflow-y-auto ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="Mobile navigation"
      >
        <div className="mb-4 flex items-center justify-between">
          <span className="font-display text-lg font-bold tracking-tight text-accent">
            NUVORA
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="text-text-muted transition-colors hover:text-accent"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              <span className="material-symbols text-[24px]">
                {theme === "dark" ? "light_mode" : "dark_mode"}
              </span>
            </button>
            <button
              className="text-text-muted transition-colors hover:text-accent"
              aria-label="Close menu"
              onClick={onClose}
            >
              <span className="material-symbols text-[28px]">close</span>
            </button>
          </div>
        </div>

        <div className="mb-4 flex items-center rounded-full border border-outline-variant/30 bg-surface-low px-4 py-2">
          <span className="material-symbols mr-2 text-[20px] text-text-muted">search</span>
          <input
            className="w-full border-none bg-transparent text-sm text-text-primary placeholder-text-muted/60 focus:outline-none"
            placeholder="Search"
            type="text"
          />
        </div>

        {isAuthenticated && (
          <div className="mb-2 rounded-xl border border-outline-variant/30 bg-surface-low p-4">
            <div className="flex items-center gap-3">
              <Avatar src={user?.profilePicture} name={displayName} size="md" />
              <div className="min-w-0 flex-1 overflow-hidden">
                <div className="flex items-center gap-2">
                  <span className="font-label-sm text-label-sm text-text-primary truncate">
                    {displayName}
                  </span>
                  {isVerified && (
                    <span
                      className="material-symbols text-[14px] text-lime"
                      title="Verified"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      verified_user
                    </span>
                  )}
                </div>
                <span className="font-body-md text-xs text-text-muted truncate block">
                  {user?.email}
                </span>
              </div>
            </div>
          </div>
        )}

        <nav className={`flex flex-col ${isAuthenticated ? "border-t border-outline-variant/30 pt-2" : ""}`}>
          {links.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              className={navLinkClass}
              end={link.to === "/"}
              onClick={onClose}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {isAuthenticated && (
          <nav className="mt-2 flex flex-col border-t border-outline-variant/30 pt-2">
            {accountItems.map((item) => (
              <button
                key={item.to}
                type="button"
                onClick={() => handleAccountClick(item.to)}
                className="flex items-center gap-3 px-2 py-3 text-left text-sm text-text-muted hover:text-text-primary transition-colors"
              >
                <span
                  className="material-symbols text-[20px]"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                {item.label}
              </button>
            ))}
            <div className="my-1 h-px bg-outline-variant/30" />
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-3 px-2 py-3 text-left text-sm text-text-muted hover:text-text-primary transition-colors"
            >
              <span
                className="material-symbols text-[20px]"
                style={{ fontVariationSettings: "'FILL' 0" }}
              >
                logout
              </span>
              Sign Out
            </button>
          </nav>
        )}

        {!isAuthenticated && (
          <div className="mt-auto pt-4">
            <Link to="/login" className="block" onClick={onClose}>
              <Button className="w-full">Account</Button>
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
