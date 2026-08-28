import React, { useState } from "react";
import DiscoveryPanel from "../components/discover/DiscoveryPanel.jsx";
import ReasoningCard from "../components/discover/ReasoningCard.jsx";
import ProductGrid from "../components/marketplace/ProductGrid.jsx";
import { discover } from "../services/discovery.js";

export default function Discover() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);

  const runDiscovery = async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setQuery(trimmed);
    setStatus("loading");
    const data = await discover({ query: trimmed });
    setResult(data);
    setStatus("done");
  };

  const reset = () => {
    setStatus("idle");
    setResult(null);
    setQuery("");
  };

  return (
    <div className="relative">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-[10%] -top-[20%] h-[50%] w-[50%] rounded-full bg-surface-highest blur-[120px] opacity-40" />
        <div className="absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-lime opacity-[0.04] blur-[150px]" />
      </div>

      <div className="flex flex-col items-center">
        <div className="mb-12 max-w-3xl text-center">
          <h1 className="mb-4 font-display text-[40px] font-semibold leading-tight text-text-primary md:text-h1">
            Dimensional Discovery
          </h1>
          <p className="text-body-lg text-text-muted">
            Describe what you need, and NUVORA's intelligence will curate the
            perfect selection.
          </p>
        </div>

        {status === "idle" ? (
          <div className="w-full max-w-4xl">
            <DiscoveryPanel
              value={query}
              onChange={setQuery}
              onSubmit={runDiscovery}
              onPick={runDiscovery}
            />
          </div>
        ) : null}

        {status === "loading" ? (
          <div className="flex w-full max-w-4xl flex-col items-center gap-4 rounded-2xl border border-outline-variant/20 bg-surface/70 p-16 backdrop-blur-[20px]">
            <span className="material-symbols animate-pulse text-4xl text-accent">
              smart_toy
            </span>
            <p className="text-body-lg text-text-muted">
              NUVORA is curating your selection…
            </p>
          </div>
        ) : null}

        {status === "done" && result ? (
          <div className="w-full max-w-4xl space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 rounded-full border border-outline-variant/20 bg-surface-low px-4 py-2">
                <span className="material-symbols text-accent">search</span>
                <span className="text-sm text-text-muted">{result.query}</span>
              </div>
              <button
                onClick={reset}
                className="flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-accent"
              >
                <span className="material-symbols text-[18px]">refresh</span>
                New discovery
              </button>
            </div>

            <ReasoningCard reasoning={result.reasoning} />

            <div>
              <h2 className="mb-4 font-display text-h3 text-text-primary">
                Curated for you
              </h2>
              <ProductGrid products={result.products} />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
