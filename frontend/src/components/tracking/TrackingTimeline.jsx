import React from "react";
import Card from "../ui/Card.jsx";

function StepNode({ stage }) {
  const stateClasses = {
    completed: "bg-lime text-obsidian border-lime",
    current:
      "bg-lime text-obsidian border-lime shadow-[0_0_20px_rgba(184,243,74,0.5)]",
    upcoming: "bg-surface border-2 border-outline-variant text-text-muted",
  };

  return (
    <div className="relative flex items-center justify-center">
      {stage.state === "current" && (
        <span className="absolute inset-0 rounded-full bg-lime/40 pulse-ring" />
      )}
      <div
        className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border ${stateClasses[stage.state]}`}
      >
        <span
          className="material-symbols text-[22px]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {stage.icon}
        </span>
      </div>
    </div>
  );
}

function StepLabel({ stage }) {
  const labelColor =
    stage.state === "upcoming"
      ? "text-text-muted opacity-60"
      : "text-text-primary";
  const subText =
    stage.state === "current"
      ? "In transit"
      : stage.state === "upcoming"
        ? "Pending"
        : "Completed";
  return (
    <div className="text-left md:text-center">
      <p
        className={`font-label-sm ${labelColor} ${stage.state === "current" ? "font-bold" : ""}`}
      >
        {stage.label}
      </p>
      <p className="text-[12px] text-text-muted">{subText}</p>
    </div>
  );
}

export default function TrackingTimeline({ stages, progressPercent }) {
  return (
    <Card className="p-6 md:p-10">
      <h2 className="mb-8 font-h3 text-h3 text-text-primary">
        Delivery Progress
      </h2>
      <div className="relative">
        {/* Desktop horizontal track */}
        <div className="absolute left-[10%] right-[10%] top-6 hidden h-1 -translate-y-1/2 rounded-full bg-outline-variant/30 md:block" />
        <div
          className="absolute left-[10%] top-6 hidden h-1 -translate-y-1/2 rounded-full bg-lime progress-line md:block"
          style={{ width: `${progressPercent}%` }}
        />

        {/* Mobile vertical track */}
        <div className="absolute bottom-6 left-6 top-6 w-1 -translate-x-1/2 rounded-full bg-outline-variant/30 md:hidden" />
        <div
          className="absolute left-6 top-6 w-1 -translate-x-1/2 rounded-full bg-lime md:hidden"
          style={{ height: `${progressPercent}%` }}
        />

        <ol className="relative flex flex-col gap-8 md:flex-row md:justify-between md:gap-0">
          {stages.map((stage) => (
            <li
              key={stage.id}
              className="relative flex items-center gap-4 md:w-1/5 md:flex-col md:items-center md:gap-3"
            >
              <StepNode stage={stage} />
              <StepLabel stage={stage} />
            </li>
          ))}
        </ol>
      </div>
    </Card>
  );
}
