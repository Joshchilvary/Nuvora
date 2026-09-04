import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../ui/Button.jsx";
import Avatar from "../ui/Avatar.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const CUSTOMER_ITEMS = [
  { label: "Customer Dashboard", icon: "dashboard", to: "/customer" },
  { label: "Orders", icon: "local_shipping", to: "/customer/orders" },
  { label: "Wishlist", icon: "favorite", to: "/customer/wishlist" },
  { label: "Notifications", icon: "notifications", to: "/customer/notifications" },
  { label: "Profile", icon: "person", to: "/customer/profile" },
  { label: "Settings", icon: "settings", to: "/customer/settings" },
];

const ADMIN_ITEMS = [
  { label: "Admin Dashboard", icon: "admin_panel_settings", to: "/admin" },
];

const CLOSE_TIMEOUT = 150;

function AccountMenu({ className = "" }) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const openMenu = () => {
    setMounted(true);
    requestAnimationFrame(() => setOpen(true));
  };
  const close = () => {
    setOpen(false);
    setTimeout(() => setMounted(false), CLOSE_TIMEOUT);
  };
  const toggle = () => (open ? close() : openMenu());

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event) => {
      const target = event.target;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        close();
      }
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        const menu = menuRef.current;
        if (!menu) return;
        const items = Array.from(
          menu.querySelectorAll('[role="menuitem"]')
        ).filter((el) => !el.hasAttribute("disabled"));
        const index = items.indexOf(document.activeElement);
        if (items.length === 0) return;
        event.preventDefault();
        const next =
          event.key === "ArrowDown"
            ? (index + 1) % items.length
            : (index - 1 + items.length) % items.length;
        items[next].focus();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown, { passive: true });
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const navigateTo = (to) => {
    close();
    navigate(to, { replace: true });
  };

  const handleLogout = async () => {
    close();
    try {
      await logout();
    } finally {
      navigate("/", { replace: true });
    }
  };

  if (!isAuthenticated) {
    return (
      <Link to="/login" className={className}>
        <Button size="sm">Account</Button>
      </Link>
    );
  }

  const firstName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  const displayName = firstName || user.email;
  const isVerified = Boolean(user?.isVerified);

  const showSeller = Boolean(user?.isSeller);
  const showAdmin = Boolean(user?.isStaff);

  const menuItems = [];
  const customerItems = [...CUSTOMER_ITEMS];
  if (showSeller) {
    customerItems.splice(1, 0, {
      label: "Seller Dashboard",
      icon: "storefront",
      to: "/seller",
    });
  }
  menuItems.push(...customerItems);
  if (showAdmin) {
    menuItems.push({ type: "separator" });
    menuItems.push(...ADMIN_ITEMS);
  }
  menuItems.push({ type: "separator" });

  const renderItem = (item) => (
    <Link
      key={item.to}
      to={item.to}
      role="menuitem"
      onClick={() => navigateTo(item.to)}
      className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-muted hover:bg-surface-high hover:text-text-primary focus-visible:bg-surface-high focus-visible:text-text-primary outline-none transition-colors"
    >
      <span
        className="material-symbols text-[20px]"
        style={{ fontVariationSettings: "'FILL' 0" }}
      >
        {item.icon}
      </span>
      {item.label}
    </Link>
  );

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={mounted ? "nuvora-account-menu" : undefined}
        onClick={toggle}
        className="flex items-center gap-2 rounded-full border border-outline-variant/30 bg-surface-low px-2.5 py-1.5 text-sm text-text-muted hover:bg-surface-high hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-lime/60 transition-colors"
      >
        <Avatar src={user?.profilePicture} name={displayName} size="sm" />
        <span className="hidden sm:inline">{firstName || "Account"}</span>
        <span
          className="material-symbols text-[20px]"
          style={{ fontVariationSettings: "'FILL' 0" }}
        >
          {open ? "arrow_drop_up" : "arrow_drop_down"}
        </span>
      </button>

      {mounted && (
        <div
          id="nuvora-account-menu"
          ref={menuRef}
          role="menu"
          aria-orientation="vertical"
          tabIndex={-1}
          className={`absolute right-0 top-full mt-2 z-50 w-72 max-w-[calc(100vw-1.5rem)] origin-top-right rounded-xl border border-outline-variant/30 bg-surface-container/80 shadow-2xl backdrop-blur-[20px] ring-1 ring-black/5 transition-all duration-150 ease-out ${
            open
              ? "opacity-100 scale-100"
              : "opacity-0 scale-95 pointer-events-none"
          }`}
        >
          <div className="flex items-center gap-3 px-4 py-3">
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

          <nav className="flex flex-col py-1" role="none">
            {menuItems.map((item, index) =>
              item.type === "separator" ? (
                <div
                  key={`sep-${index}`}
                  className="my-1 h-px bg-outline-variant/30"
                  role="separator"
                />
              ) : (
                renderItem(item)
              )
            )}
          </nav>

          <div className="border-t border-outline-variant/30">
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-text-muted hover:bg-surface-high hover:text-text-primary focus-visible:bg-surface-high focus-visible:text-text-primary outline-none transition-colors"
            >
              <span
                className="material-symbols text-[20px]"
                style={{ fontVariationSettings: "'FILL' 0" }}
              >
                logout
              </span>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AccountMenu;
