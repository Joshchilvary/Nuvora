import React from "react";

const STEPS = [
  { id: 0, label: "Store Info" },
  { id: 1, label: "Verification" },
  { id: 2, label: "Branding" },
  { id: 3, label: "Submit" },
];

export default function SellerStepper({ currentStep, onStepClick }) {
  return (
    <nav aria-label="Progress" className="mb-12 flex flex-col items-center">
      <ol className="flex items-center" role="list">
        {STEPS.map((step, index) => (
          <li key={step.id} className="relative pr-8 sm:pr-20">
            {index < STEPS.length - 1 && (
              <div aria-hidden="true" className="absolute inset-0 flex items-center">
                <div
                  className={`h-0.5 w-full ${
                    index < currentStep ? "bg-lime" : "bg-outline-variant/30"
                  }`}
                />
              </div>
            )}
            <button
              type="button"
              onClick={() => onStepClick(step.id)}
              className={`relative flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                index < currentStep
                  ? "bg-lime text-obsidian"
                  : index === currentStep
                    ? "bg-outline-variant border-2 border-lime text-lime"
                    : "bg-surface-high text-text-muted"
              }`}
            >
              {index < currentStep ? (
                <span
                  className="material-symbols text-sm"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check
                </span>
              ) : (
                <span className="font-label-sm text-label-sm">{step.id + 1}</span>
              )}
            </button>
          </li>
        ))}
      </ol>
      <div className="flex justify-between mt-4 text-text-muted font-label-sm text-label-sm max-w-[280px] sm:max-w-[400px] mx-auto">
        {STEPS.map((step, index) => (
          <span
            key={step.id}
            className={index === currentStep ? "text-lime pl-4 sm:pl-10" : "pl-4 sm:pl-10"}
          >
            {step.label}
          </span>
        ))}
      </div>
    </nav>
  );
}
