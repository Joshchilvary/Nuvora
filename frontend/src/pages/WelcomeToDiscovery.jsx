import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const ONBOARDING_STORAGE_KEY = "nuvora-onboarding-complete";

function loadOnboardingFlag() {
  try {
    return localStorage.getItem(ONBOARDING_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function saveOnboardingFlag(value) {
  try {
    if (value) localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
    else localStorage.removeItem(ONBOARDING_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export default function WelcomeToDiscovery() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => loadOnboardingFlag());

  const displayName = useMemo(() => {
    if (!user) return "";
    const full = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    return full || user.email || "";
  }, [user]);

  const isReturning = isAuthenticated && hasCompletedOnboarding;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!isReturning) return;
    const timeout = setTimeout(() => {
      navigate("/marketplace", { replace: true });
    }, 3500);
    return () => clearTimeout(timeout);
  }, [isReturning, navigate]);

  const completeOnboarding = () => {
    saveOnboardingFlag(true);
    setHasCompletedOnboarding(true);
  };

  const handlePersonalize = () => {
    completeOnboarding();
    navigate("/discover", { replace: true });
  };

  const handleSkip = () => {
    completeOnboarding();
    navigate("/marketplace", { replace: true });
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isReturning) {
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
                  auto_awesome
                </span>
              </div>

              <h1 className="font-headline-md text-headline-md text-text-primary mb-2 tracking-tight">
                Welcome back, {displayName}
              </h1>

              <p className="font-body-lg text-body-lg text-text-muted">
                Continuing your discovery journey...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
              Welcome to NUVORA, {displayName}
            </h1>

            <p className="font-body-lg text-body-lg text-text-muted mb-8">
              This is the start of your journey.
            </p>

            <div className="flex w-full flex-col gap-4">
              <button
                type="button"
                onClick={handlePersonalize}
                className="glow-button flex w-full items-center justify-center gap-2 rounded-lg border border-lime bg-lime/10 py-3 font-label-md text-label-md text-lime transition-all hover:brightness-110 active:scale-[0.98]"
              >
                <span>Personalize Discovery</span>
                <span
                  className="material-symbols text-sm"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  arrow_forward
                </span>
              </button>

              <button
                type="button"
                onClick={handleSkip}
                className="flex w-full items-center justify-center rounded-lg border border-outline-variant/30 bg-transparent py-3 font-label-md text-label-md text-text-muted transition-colors hover:bg-surface-high hover:text-text-primary"
              >
                Skip for now
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
