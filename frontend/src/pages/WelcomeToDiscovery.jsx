import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function WelcomeToDiscovery() {
  const [userName] = useState("Alex");

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      <div
        className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center"
        aria-hidden="true"
      >
        <div className="geometric-portal absolute h-full w-full" />
        <div
          className="absolute h-[600px] w-[600px] rounded-full border border-lime/10 animate-spin"
          style={{ animationDuration: "60s" }}
        />
        <div
          className="absolute h-[450px] w-[450px] rounded-full border border-lime/20 animate-spin"
          style={{ animationDuration: "40s", animationDirection: "reverse" }}
        />
        <div
          className="absolute h-[300px] w-[300px] rounded-full border border-lime/30 animate-spin"
          style={{ animationDuration: "20s" }}
        />
        <div className="absolute h-2 w-2 rounded-full bg-lime shadow-[0_0_20px_#b8f34a]" />
      </div>

      <main className="relative z-10 w-full max-w-[480px] px-5 md:px-0">
        <div className="fade-rise rounded-xl border border-outline-variant/30 bg-surface/60 p-8 shadow-2xl backdrop-blur-[20px] md:p-10">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-outline-variant/50 bg-surface">
              <span
                className="material-symbols text-lime text-2xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                explore
              </span>
            </div>

            <h1 className="font-headline-md text-headline-md text-text-primary mb-2 tracking-tight">
              Welcome to NUVORA, {userName}
            </h1>

            <p className="font-body-lg text-body-lg text-text-muted mb-8">
              Your intelligent journey starts here.
            </p>

            <div className="flex w-full flex-col gap-4">
              <Link
                to="/discover"
                className="glow-button flex w-full items-center justify-center gap-2 rounded-lg border border-lime bg-lime/10 py-3 font-label-md text-label-md text-lime transition-all hover:brightness-110 active:scale-[0.98]"
              >
                <span>Personalize Discovery</span>
                <span
                  className="material-symbols text-sm"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  arrow_forward
                </span>
              </Link>

              <Link
                to="/marketplace"
                className="flex w-full items-center justify-center rounded-lg border border-outline-variant/30 bg-transparent py-3 font-label-md text-label-md text-text-muted transition-colors hover:bg-surface-high hover:text-text-primary"
              >
                Skip for now
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
