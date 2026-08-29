import React, { useState } from "react";
import { Link } from "react-router-dom";

const DOC_SECTIONS = [
  { id: "discovery", label: "Discovery API", icon: "explore" },
  { id: "authentication", label: "Authentication", icon: "vpn_key" },
  { id: "inventory", label: "Inventory Sync", icon: "inventory_2" },
  { id: "orders", label: "Orders API", icon: "receipt_long" },
  { id: "webhooks", label: "Webhooks", icon: "save_as" },
];

const CODE_EXAMPLE = `curl -X POST https://api.nuvora.com/v1/discovery/search \\
  -H "Authorization: Bearer $NUVORA_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "matte black architectural ceramics",
    "spatial_context": {
      "dimensions": "3D",
      "lighting_profile": "studio_soft"
    },
    "limit": 5
  }'`;

export default function ApiDevelopers() {
  const [activeSection, setActiveSection] = useState("discovery");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(CODE_EXAMPLE.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="w-full max-w-[1440px] mx-auto px-6 md:px-16 mt-12 md:mt-24 relative z-10 flex flex-col md:flex-row gap-12">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 flex-shrink-0 flex flex-col gap-2">
          <h3 className="font-h4 text-h4 text-text-primary mb-6">
            API Reference
          </h3>
          <nav className="space-y-1">
            {DOC_SECTIONS.map((section) => {
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors ${
                    isActive
                      ? "bg-lime text-obsidian font-semibold"
                      : "text-text-muted hover:bg-surface-high hover:text-text-primary"
                  }`}
                >
                  <span
                    className="material-symbols"
                    style={{ fontVariationSettings: isActive ? "'FILL' 1" : "none" }}
                  >
                    {section.icon}
                  </span>
                  <span className="font-body-md text-body-md">
                    {section.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Documentation Content */}
        <section className="flex-grow flex flex-col gap-12">
          {/* Header Section */}
          <header className="flex flex-col gap-6 items-start">
            <div className="flex items-center gap-3 rounded-full border border-outline-variant/20 bg-surface-high px-4 py-2">
              <span className="inline-block h-2 w-2 rounded-full bg-lime shadow-[0_0_8px_rgba(184,243,74,0.5)]" />
              <span className="font-label-sm text-label-sm text-text-muted tracking-widest uppercase">
                API Status: Operational
              </span>
            </div>
            <h1 className="font-display text-h1-mobile md:text-h1 text-text-primary text-balance">
              Build with Dimensional <br className="hidden md:block" />{" "}
              <span className="text-accent">Discovery</span>
            </h1>
            <p className="text-body-lg text-text-muted max-w-2xl text-balance">
              Integrate the NUVORA AI-powered marketplace directly into your backend. Access rich product data, automate inventory, and leverage our spatial discovery engine.
            </p>
            <div className="flex flex-wrap gap-4 mt-4">
              <button className="rounded-lg bg-lime px-6 py-3 font-label-sm text-obsidian transition-opacity hover:opacity-90">
                Access Documentation
              </button>
              <button className="rounded-lg border border-outline-variant/30 px-6 py-3 font-label-sm text-text-primary transition-colors hover:bg-surface-high">
                Get API Keys
              </button>
            </div>
          </header>

          {/* Authentication & Rate Limits Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel rounded-xl p-8 flex flex-col gap-4">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-surface-high">
                <span className="material-symbols text-accent text-2xl">
                  lock
                </span>
              </div>
              <h3 className="font-h3 text-h3 text-text-primary">
                Authentication
              </h3>
              <p className="font-body-md text-text-muted">
                NUVORA uses Bearer token authentication. Include your API key in the Authorization header of every request.
              </p>
              <div className="mt-4 rounded-lg border border-outline-variant/30 bg-surface-container-low p-4 font-mono text-sm text-text-muted">
                Authorization: Bearer nv_live_xxx...
              </div>
            </div>

            <div className="glass-panel rounded-xl p-8 flex flex-col gap-4">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-surface-high">
                <span className="material-symbols text-accent text-2xl">
                  speed
                </span>
              </div>
              <h3 className="font-h3 text-h3 text-text-primary">
                Rate Limits
              </h3>
              <p className="font-body-md text-text-muted">
                Standard tier permits 100 requests per second. Premium tiers offer dedicated throughput for high-volume synchronization.
              </p>
            </div>
          </div>

          {/* Code Example */}
          <div className="mt-2">
            <div className="flex items-end justify-between mb-6">
              <h2 className="font-h2 text-h2 text-text-primary">
                Discovery Request
              </h2>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 rounded-lg border border-outline-variant/30 px-3 py-2 font-label-sm text-text-muted transition-colors hover:bg-surface-high hover:text-text-primary"
              >
                <span className="material-symbols text-sm">
                  {copied ? "check" : "content_copy"}
                </span>
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="glass-panel rounded-xl overflow-hidden shadow-2xl shadow-black/50">
              <div className="border-b border-outline-variant/20 bg-surface-container-low px-6 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-text-muted/40" />
                  <div className="h-3 w-3 rounded-full bg-text-muted/40" />
                  <div className="h-3 w-3 rounded-full bg-text-muted/40" />
                  <span className="ml-4 font-label-sm text-label-sm text-text-muted">
                    POST /v1/discovery/search
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto p-6">
                <pre className="font-mono text-sm md:text-base text-text-muted">
                  <code>{CODE_EXAMPLE.trim()}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
