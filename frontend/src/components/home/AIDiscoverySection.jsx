import React from "react";
import { Link } from "react-router-dom";
import Badge from "../ui/Badge.jsx";

const AI_IMAGES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD1ToF2vSE7T6H6ANOB9RQye0PKZJsxuuVgRUnh9rFjDsBRLxn-MdvwxtRZBsVe4BWzjrEHefUpq2GQdCKlqlTxauTubeOnyDBv8tBZ8eZBloBtddJJCXh7ERQajnNdclgnc5aQsLfux-2Slf4www1CqmWOAbjeQKf1_kIfnbmovtPJ-nsngz6xGB-6RtEh65_aentlKlud1H4-uLZbX8V4AT__nW_STgq-v74dlSozGOEAEgQHpNJtxw",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDKA590CG2KknjZGZYpUM1qnH6ZbkoQMe34yEDQvr6sI0a67EcsgwoTfOoUQFULocZgwWDzhdbgMOyldpmH_XdscsXEN2BwH0A3nO1b79mSOiVxnNMcqhE_wjMZkxvGN-eQRqsq9uXup4-d1tqKVsWNYc4vAjQll3WGLoVvvxTN6zR5bHrLFEmegFVWihw8A1iEYELUz0WH5s6-dpURUeWTcvZh1rj9HfbhcjO1BiSmOuiDZo4OFqdy5g",
];

export default function AIDiscoverySection() {
  return (
    <section className="mb-32">
      <div className="ai-glow relative overflow-hidden rounded-3xl border border-lime/20 bg-surface-highest p-10 md:p-16">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 -translate-y-1/2 translate-x-1/3 rounded-full bg-lime/10 blur-[100px]"
          aria-hidden="true"
        />
        <div className="relative z-10 grid grid-cols-1 items-center gap-16 md:grid-cols-2">
          <div>
            <Badge variant="lime" className="mb-6">
              <span className="material-symbols text-[16px]">smart_toy</span>
              AI Curated
            </Badge>
            <h2 className="mb-4 font-display text-h2 text-text-primary">
              For your next discovery
            </h2>
            <p className="mb-8 text-body-lg text-text-muted">
              Our intelligence engine has mapped your preferences to unique items
              across the dimensional space.
            </p>
            <Link
              to="/discover"
              className="flex w-fit items-center gap-2 font-label-sm text-accent transition-all hover:gap-4"
            >
              Explore tailored picks
              <span className="material-symbols">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="dim-card aspect-square overflow-hidden rounded-xl border border-outline-variant/20 bg-surface">
              <div
                className="h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url('${AI_IMAGES[0]}')` }}
                role="img"
                aria-label="Minimalist mechanical keyboard with lime backlighting on an obsidian desk"
              />
            </div>
            <div className="dim-card aspect-square translate-y-8 overflow-hidden rounded-xl border border-outline-variant/20 bg-surface">
              <div
                className="h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url('${AI_IMAGES[1]}')` }}
                role="img"
                aria-label="Sleek modern designer desk lamp emitting warm focused light"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
