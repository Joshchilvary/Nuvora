import React, { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import SellerSidebar from "../seller/SellerSidebar.jsx";
import SellerHeader from "../seller/SellerHeader.jsx";
import { MOBILE_NAV_ITEMS } from "../seller/SellerSidebar.jsx";

function navLinkClass({ isActive }) {
  return `flex flex-col items-center justify-center w-full h-full text-xs transition-colors ${
    isActive
      ? "text-accent"
      : "text-text-muted hover:text-text-primary"
  }`;
}

export default function SellerLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-background">
      {/* Desktop sidebar + Mobile drawer */}
      <SellerSidebar
        mobileOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      <main className="md:ml-72 min-h-screen flex flex-col">
        <SellerHeader onMenuClick={() => setMobileNavOpen(true)} />

        <div className="px-4 pb-16 md:px-8 flex-1">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-[20px] border-t border-outline-variant/20 flex justify-around items-center h-16">
        {MOBILE_NAV_ITEMS.map((item) => (
          <NavLink
            key={item.id}
            to={item.href}
            end={item.exact}
            className={navLinkClass}
            onClick={() => setMobileNavOpen(false)}
          >
            <span
              className="material-symbols text-2xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {item.icon}
            </span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
