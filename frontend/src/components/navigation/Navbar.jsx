import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import Button from "../ui/Button.jsx";
import Container from "../layout/Container.jsx";
import MobileMenu from "./MobileMenu.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";

const LINKS = [
  { label: "Market", to: "/marketplace" },
  { label: "Sellers", to: "/sellers" },
  { label: "Discover", to: "/" },
  { label: "Support", to: "/support" },
];

function navLinkClass({ isActive }) {
  return `font-semibold transition-colors duration-300 ${
    isActive
      ? "text-accent border-b-2 border-lime"
      : "text-text-muted hover:text-accent"
  }`;
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed left-0 right-0 top-0 z-50 mt-4 px-4 md:mt-6 md:px-8">
      <Container className="flex items-center justify-between gap-4 rounded-full border border-outline-variant/20 bg-surface/80 px-5 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-[28px]">
        <NavLink to="/" className="flex items-center gap-3">
          <span className="material-symbols text-2xl text-accent">auto_awesome</span>
          <span className="font-display text-xl font-bold tracking-tight text-accent">
            NUVORA
          </span>
        </NavLink>

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <NavLink key={link.label} to={link.to} className={navLinkClass} end={link.to === "/"}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden items-center rounded-full border border-outline-variant/30 bg-surface-low px-4 py-2 md:flex">
            <span className="material-symbols mr-2 text-[20px] text-text-muted">search</span>
            <input
              className="w-32 border-none bg-transparent text-sm text-text-primary placeholder-text-muted/60 focus:outline-none"
              placeholder="Search"
              type="text"
            />
          </div>

          <button
            onClick={toggleTheme}
            className="hidden text-text-muted transition-colors hover:text-accent md:block"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            <span className="material-symbols text-[24px]">
              {theme === "dark" ? "light_mode" : "dark_mode"}
            </span>
          </button>

          <Button size="sm" className="hidden md:inline-flex">
            Account
          </Button>

          <button
            className="text-text-muted transition-colors hover:text-accent md:hidden"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
          >
            <span className="material-symbols text-[28px]">menu</span>
          </button>
        </div>
      </Container>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} links={LINKS} />
    </header>
  );
}
