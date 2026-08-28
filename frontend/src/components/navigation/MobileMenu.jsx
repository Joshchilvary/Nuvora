import React from "react";
import { NavLink } from "react-router-dom";
import Button from "../ui/Button.jsx";

function navLinkClass({ isActive }) {
  return `block py-3 font-semibold transition-colors ${
    isActive ? "text-lime" : "text-text-primary hover:text-lime"
  }`;
}

export default function MobileMenu({ open, onClose, links }) {
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
        className={`absolute right-0 top-0 flex h-full w-72 max-w-[80%] flex-col gap-2 border-l border-outline-variant/20 bg-surface p-6 shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="Mobile navigation"
      >
        <div className="mb-4 flex items-center justify-between">
          <span className="font-display text-lg font-bold tracking-tight text-lime">
            NUVORA
          </span>
          <button
            className="text-text-muted transition-colors hover:text-lime"
            aria-label="Close menu"
            onClick={onClose}
          >
            <span className="material-symbols text-[28px]">close</span>
          </button>
        </div>

        <div className="mb-4 flex items-center rounded-full border border-outline-variant/30 bg-surface-low px-4 py-2">
          <span className="material-symbols mr-2 text-[20px] text-text-muted">search</span>
          <input
            className="w-full border-none bg-transparent text-sm text-text-primary placeholder-text-muted/60 focus:outline-none"
            placeholder="Search"
            type="text"
          />
        </div>

        <nav className="flex flex-col">
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

        <Button className="mt-4 w-full" onClick={onClose}>
          Account
        </Button>
      </aside>
    </div>
  );
}
