import React from "react";
import { Link } from "react-router-dom";

const SHOWCASE_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAstQz9m3qkTG76vVliGt73NKYcxpOjtAgZkTyK-GzukeTngH5fly3UoBojAGSgtZyNONpXUIkkPbxmolz1t92A2hXBY46-BFhGdRrpYqlv8Yxic_taIXSmrmNCLFdOhOjtsGz835NuN8fQ_GdtpMGMm21gIiaAlxgqmbBi6H4jvNAqlPiBttF_i-mZnyiwDDRwyraC4yB5YR3WPAN75IORQQZcWrSwA1LdY2udbsb8fruRIIM8mIsbdg";

export default function SellOnNuvora() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-[716px] flex flex-col items-center justify-center text-center mb-32 z-10">
        <div className="absolute inset-0 -z-10 overflow-hidden rounded-[2rem] opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-lime/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-surface-tint/10 rounded-full blur-[100px]" />
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-lime/20 mb-8">
          <span className="h-2 w-2 rounded-full bg-lime animate-pulse" />
          <span className="font-label-sm text-label-sm text-accent">
            Seller Portal V2 Live
          </span>
        </div>

        <h1 className="font-display text-[44px] md:text-display text-text-primary mb-6 max-w-4xl tracking-tight leading-tight">
          Bring your products into the{" "}
          <span className="text-lime">dimension.</span>
        </h1>

        <p className="font-body-lg text-body-lg text-text-muted mb-12 max-w-2xl mx-auto">
          Join NUVORA's curated marketplace. Leverage AI-powered discovery to
          connect your premium goods with discerning buyers across the digital
          landscape.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/seller/launchpad"
            className="px-8 py-4 rounded-full bg-lime text-obsidian font-label-sm text-label-sm shadow-[0_0_20px_rgba(184,243,74,0.2)] transition-colors hover:brightness-110"
          >
            Become a Seller
          </Link>
          <Link
            to="/seller/intelligence"
            className="px-8 py-4 rounded-full glass-panel text-text-primary font-label-sm text-label-sm transition-colors hover:bg-surface-high flex items-center gap-2"
          >
            Explore Analytics
            <span className="material-symbols text-sm">arrow_forward</span>
          </Link>
        </div>
      </section>

      {/* Value Prop / Bento Grid */}
      <section className="mb-32">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[minmax(300px,auto)]">
          {/* Feature 1: AI Discovery */}
          <div className="md:col-span-8 glass-panel rounded-3xl p-8 hover-lift flex flex-col justify-between overflow-hidden relative group ai-glow">
            <div className="absolute top-0 right-0 w-64 h-64 bg-lime/5 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/4" />
            <div className="z-10">
              <span className="material-symbols text-accent mb-4 text-4xl">
                auto_awesome
              </span>
              <h3 className="font-h3 text-h3 text-text-primary mb-2">
                Algorithmic Matchmaking
              </h3>
              <p className="font-body-md text-body-md text-text-muted max-w-md">
                Our AI doesn't just list products; it understands them. We connect
                your inventory with buyers exhibiting high-intent behavioral
                patterns, minimizing acquisition costs.
              </p>
            </div>
            <div className="mt-8 rounded-xl border border-outline-variant/20 overflow-hidden relative h-48 bg-surface-container">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full opacity-50 flex items-center justify-around px-12">
                  <div className="w-16 h-16 rounded-full border border-lime/30 flex items-center justify-center">
                    <span className="material-symbols text-text-muted">
                      person
                    </span>
                  </div>
                  <div className="relative h-[2px] flex-grow bg-gradient-to-r from-transparent via-lime/50 to-transparent">
                    <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime shadow-[0_0_10px_#b8f34a]" />
                  </div>
                  <div className="w-16 h-16 rounded-lg border border-lime/30 flex items-center justify-center rotate-12">
                    <span className="material-symbols text-text-muted">
                      inventory_2
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2: Secure Infrastructure */}
          <div className="md:col-span-4 glass-panel rounded-3xl p-8 hover-lift flex flex-col justify-between group">
            <div>
              <span className="material-symbols text-text-primary mb-4 text-4xl transition-colors group-hover:text-accent">
                verified_user
              </span>
              <h3 className="font-h3 text-h3 text-text-primary mb-2">
                Ironclad Security
              </h3>
              <p className="font-body-md text-body-md text-text-muted">
                Enterprise-grade encryption and automated fraud prevention protect
                every transaction in the dimension.
              </p>
            </div>
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3">
                <span className="material-symbols text-accent text-sm">
                  check_circle
                </span>
                <span className="text-sm text-text-muted">
                  Zero-knowledge proofs
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols text-accent text-sm">
                  check_circle
                </span>
                <span className="text-sm text-text-muted">
                  Instant settlements
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols text-accent text-sm">
                  check_circle
                </span>
                <span className="text-sm text-text-muted">
                  Dispute resolution protocol
                </span>
              </div>
            </div>
          </div>

          {/* Feature 3: Editorial Showcase */}
          <div className="md:col-span-12 glass-panel rounded-3xl p-8 hover-lift overflow-hidden relative min-h-[400px] flex items-center">
            <div className="w-full md:w-1/2 z-10 pr-0 md:pr-12 pl-4 md:pl-12">
              <span className="material-symbols text-accent mb-4 text-4xl">
                view_in_ar
              </span>
              <h3 className="font-h2 text-h2 text-text-primary mb-4">
                Premium Presentation Canvas
              </h3>
              <p className="font-body-lg text-body-lg text-text-muted mb-6">
                Your products deserve better than a flat white background. NUVORA
                provides an immersive, customizable environment that respects your
                brand's aesthetic.
              </p>
              <Link
                to="/marketplace"
                className="text-accent font-label-sm text-label-sm hover:underline flex items-center gap-1"
              >
                View Showcase Gallery
                <span className="material-symbols text-sm">arrow_forward</span>
              </Link>
            </div>
            <div className="absolute right-0 top-0 bottom-0 hidden md:block md:w-1/2">
              <div className="absolute inset-0 bg-gradient-to-r from-surface-container-high/90 to-transparent z-10" />
              <img
                src={SHOWCASE_IMAGE}
                alt="Premium product showcase"
                className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
