import React, { useState, useCallback } from "react";
import { NavLink, Link, Outlet } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext.jsx";
import { ADMIN_NAV_ITEMS, ADMIN_PROFILE } from "../../data/adminDashboard.js";

function navLinkClass({ isActive }) {
  return `flex items-center px-4 py-3 rounded-lg mx-2 transition-all duration-200 ${
    isActive
      ? "bg-lime text-obsidian"
      : "text-text-muted hover:text-text-primary hover:bg-surface-high hover:translate-x-1"
  }`;
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
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
            {sidebarOpen ? "close" : "menu" }
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
          <p className="font-label-sm text-label-sm text-text-muted mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 px-6">
          <ul className="flex flex-col gap-2">
            {ADMIN_NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <NavLink
                  to={item.href}
                  end={item.id === "dashboard"}
                  className={navLinkClass}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span
                    className="material-symbols mr-4"
                    style={{ fontVariationSettings: item.id === "dashboard" ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {item.icon}
                  </span>
                  <span className="font-label-sm text-label-sm">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="px-8 flex flex-col gap-3">
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
            {/* Search */}
            <button
              type="button"
              className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant/30 bg-surface-high text-text-muted transition-colors hover:text-accent hover:bg-surface-highest"
              aria-label="Search"
            >
              <span className="material-symbols text-xl" style={{ fontVariationSettings: "'FILL' 0" }}>
                search
              </span>
            </button>

            {/* Notifications */}
            <button
              type="button"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant/30 bg-surface-high text-text-muted transition-colors hover:text-accent hover:bg-surface-highest"
              aria-label="Notifications"
            >
              <span className="material-symbols text-xl" style={{ fontVariationSettings: "'FILL' 0" }}>
                notifications
              </span>
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-lime px-1 text-[10px] font-bold text-obsidian">
                3
              </span>
            </button>

            {/* Theme Toggle */}
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

            {/* Admin Avatar */}
            <div className="h-9 w-9 rounded-full overflow-hidden border border-outline-variant/30">
              <img src={ADMIN_PROFILE.avatar} alt="Admin" className="h-full w-full object-cover" />
            </div>
          </div>
        </header>

        <div className="flex-1 px-5 py-6 md:px-8 md:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
