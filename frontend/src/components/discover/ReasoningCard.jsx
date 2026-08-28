import React from "react";

export default function ReasoningCard({ reasoning }) {
  return (
    <div className="ai-glow rounded-2xl border border-lime/20 bg-surface/70 p-6 backdrop-blur-[20px] md:p-8">
      <div className="mb-4 flex items-center gap-2">
        <span className="material-symbols text-accent">smart_toy</span>
        <h2 className="font-display text-h4 text-text-primary">Why these match</h2>
      </div>
      <ul className="space-y-3">
        {reasoning.map((point, index) => (
          <li key={index} className="flex items-start gap-3 text-body-md text-text-muted">
            <span className="material-symbols mt-0.5 text-[20px] text-accent">
              check_circle
            </span>
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
