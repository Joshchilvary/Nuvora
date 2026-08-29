import React from "react";
import Container from "./Container.jsx";
import { Link } from "react-router-dom";

const LINKS = [
  { label: "About", href: "/our-story" },
  { label: "FAQ", href: "/faq" },
  { label: "Support", href: "/support" },
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
  { label: "API", href: "#" },
  { label: "Careers", href: "#" },
];

export default function Footer() {
  return (
    <footer className="mt-20 w-full border-t border-outline-variant/30 bg-deep-surface py-12">
      <Container className="flex flex-col items-center justify-between gap-6 md:flex-row">
        <div>
          <span className="font-display text-xl font-bold tracking-tight text-accent">
            NUVORA
          </span>
          <p className="mt-2 text-sm text-text-muted opacity-80">
            &copy; 2024 NUVORA. Dimensional Discovery.
          </p>
        </div>
        <nav className="flex gap-8 text-sm">
          {LINKS.map((link) =>
            link.href.startsWith("/") ? (
              <Link
                key={link.label}
                to={link.href}
                className="text-text-muted transition-colors hover:text-accent"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="text-text-muted transition-colors hover:text-accent"
              >
                {link.label}
              </a>
            )
          )}
        </nav>
      </Container>
    </footer>
  );
}
