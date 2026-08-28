import React from "react";

const SUGGESTIONS = [
  "Comfortable headphones for noisy environments",
  "Minimalist desk setup",
  "Warm reading lamp",
  "Cozy knit for cold days",
  "Premium audio gift",
];

export default function DiscoveryPanel({ value, onChange, onSubmit, onPick }) {
  const handleSubmit = (event) => {
    event.preventDefault();
    if (value.trim()) onSubmit(value.trim());
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="ai-glow w-full rounded-2xl border border-lime/20 bg-surface/70 p-6 backdrop-blur-[20px] transition-all duration-500 md:p-10"
    >
      <div className="mb-5 flex flex-wrap gap-2">
        <span className="mr-1 self-center text-label-sm text-text-muted">
          Try:
        </span>
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => onPick(suggestion)}
            className="rounded-full border border-outline-variant/30 bg-surface-low px-3 py-1 text-sm text-text-muted transition-colors hover:border-lime/40 hover:text-accent"
          >
            {suggestion}
          </button>
        ))}
      </div>

      <div className="relative">
        <span className="material-symbols absolute left-6 top-5 text-lg text-accent opacity-70 transition-opacity">
          auto_awesome
        </span>
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="What are you looking for?"
          className="min-h-[120px] w-full resize-none rounded-xl border border-outline-variant/30 bg-surface-low py-5 pl-16 pr-6 font-body-lg text-text-primary outline-none transition-all duration-300 placeholder:text-text-muted/50 focus:border-lime"
          aria-label="Describe what you're looking for"
        />
        <button
          type="submit"
          className="absolute bottom-5 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-lime text-obsidian transition-transform hover:scale-105"
          aria-label="Start discovery"
        >
          <span className="material-symbols" style={{ fontVariationSettings: "'FILL' 1" }}>
            send
          </span>
        </button>
      </div>
    </form>
  );
}
