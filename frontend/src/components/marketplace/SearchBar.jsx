import React from "react";

export default function SearchBar({ value, onChange }) {
  return (
    <form
      onSubmit={(event) => event.preventDefault()}
      className="ai-glow flex items-center rounded-2xl border border-lime/20 bg-surface/70 p-2 backdrop-blur-[20px]"
    >
      <span className="material-symbols p-3 text-text-muted">auto_awesome</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full border-none bg-transparent font-body-lg text-text-primary outline-none placeholder:text-text-muted/70"
        placeholder="Describe what you're looking for..."
        type="text"
        aria-label="Search products"
      />
      <button
        type="submit"
        className="rounded-xl bg-lime p-3 text-obsidian transition-colors hover:bg-lime-soft"
        aria-label="Search"
      >
        <span className="material-symbols">search</span>
      </button>
    </form>
  );
}
