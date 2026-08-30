import React from "react";
import { Link } from "react-router-dom";

export default function AuthStates() {
  return (
    <div className="relative min-h-screen bg-background">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[80vw] w-[80vw] max-h-[800px] max-w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime/5 blur-[120px]"
        aria-hidden="true"
      />

      <header className="flex justify-between items-center w-full px-5 md:px-8 py-4 fixed top-0 z-50">
        <Link to="/" className="font-headline-md text-headline-md text-text-primary tracking-tight">
          NUVORA
        </Link>
      </header>

      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-5 md:px-8 pt-24 pb-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
        {/* 1. Skeleton Loading */}
        <section className="glass-panel rounded-xl p-8 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
          <div className="w-full max-w-[320px] space-y-6">
            <div className="h-8 w-32 rounded bg-surface-high/50 animate-pulse-skeleton mx-auto mb-8" />
            <div className="h-6 w-48 rounded bg-surface-high/50 animate-pulse-skeleton mx-auto mb-2" />
            <div className="h-4 w-64 rounded bg-surface-high/50 animate-pulse-skeleton mx-auto mb-8" />
            <div className="space-y-4">
              <div className="h-12 w-full rounded border border-outline-variant/30 bg-surface-high/50 animate-pulse-skeleton" />
              <div className="h-12 w-full rounded border border-outline-variant/30 bg-surface-high/50 animate-pulse-skeleton" />
            </div>
            <div className="h-12 w-full rounded mt-6 bg-surface-high/50 animate-pulse-skeleton" />
          </div>
          <div className="absolute bottom-4 left-4 font-label-sm text-label-sm text-text-muted opacity-50">
            1. Skeleton Loading
          </div>
        </section>

        {/* 2. Invalid Credentials / Error Toast + Validation */}
        <section className="glass-panel rounded-xl p-8 flex flex-col items-center justify-center min-h-[400px] relative">
          <div className="w-full max-w-[320px] relative">
            <div className="absolute -top-16 left-0 right-0 rounded-lg border border-red-400/50 bg-red-500/10 p-3 flex items-start gap-3 shadow-[0_4px_24px_rgba(255,59,48,0.15)]">
              <span className="material-symbols text-red-400 text-[20px]">error</span>
              <div className="flex-1">
                <p className="font-label-md text-label-md text-text-primary">Authentication Failed</p>
                <p className="font-label-sm text-label-sm text-red-400 mt-0.5">Invalid credentials provided.</p>
              </div>
            </div>
            <div className="text-center mb-8">
              <h2 className="font-headline-sm text-headline-sm text-text-primary mb-2">Sign In</h2>
              <p className="font-body-md text-body-md text-text-muted">Enter your details to access the portal.</p>
            </div>
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <label className="font-label-sm text-label-sm text-text-muted">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    defaultValue="user@example.com"
                    className={`w-full rounded-lg border bg-surface-low px-4 py-3 font-body-md text-text-primary outline-none transition-all placeholder:text-text-muted/60 focus:border-lime ${
                      "border-red-400"
                    }`}
                  />
                  <span className="material-symbols absolute right-3 top-1/2 -translate-y-1/2 text-red-400 text-[20px]">
                    warning
                  </span>
                </div>
                <p className="font-label-sm text-label-sm text-red-400">
                  Email already registered to another account.
                </p>
              </div>
              <div className="space-y-2">
                <label className="font-label-sm text-label-sm text-text-muted">Password</label>
                <input
                  type="password"
                  defaultValue="********"
                  className="w-full rounded-lg border border-outline-variant/30 bg-surface-low px-4 py-3 font-body-md text-text-primary outline-none transition-all placeholder:text-text-muted/60 focus:border-lime"
                />
              </div>
              <button
                type="submit"
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-lime py-3 font-label-md text-label-md text-obsidian transition-all hover:brightness-110 active:scale-[0.98]"
              >
                Access Portal
              </button>
            </form>
          </div>
          <div className="absolute bottom-4 left-4 font-label-sm text-label-sm text-text-muted opacity-50">
            2. &amp; 5. Error States
          </div>
        </section>

        {/* 3. Google Auth Progress & 4. Session Expired */}
        <div className="flex flex-col gap-6 col-span-1 md:col-span-2 lg:col-span-1">
          {/* 3. Google Auth Progress */}
          <section className="glass-panel rounded-xl p-8 flex flex-col items-center justify-center relative min-h-[200px]">
            <div className="w-full max-w-[280px] text-center space-y-6">
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                <svg
                  className="absolute inset-0 w-full h-full animate-spin-fast"
                  viewBox="0 0 50 50"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="25"
                    cy="25"
                    r="20"
                    stroke="#CCFF00"
                    strokeDasharray="90, 150"
                    strokeDashoffset="0"
                    strokeWidth="2"
                  />
                </svg>
                <svg className="relative z-10" width="24" height="24" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-text-primary mb-1">Authenticating</h3>
                <p className="font-body-md text-body-md text-text-muted">Connecting with Google...</p>
              </div>
            </div>
            <div className="absolute bottom-4 left-4 font-label-sm text-label-sm text-text-muted opacity-50">
              3. Auth Progress
            </div>
          </section>

          {/* 4. Session Expired */}
          <section className="glass-panel rounded-xl p-6 flex flex-col items-center justify-center relative border-lime/20 bg-surface/80">
            <div className="flex items-start gap-4 w-full">
              <div className="w-10 h-10 rounded-full bg-lime/10 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols text-lime">timer_off</span>
              </div>
              <div className="flex-1">
                <h4 className="font-label-md text-label-md text-text-primary mb-1">Session Expired</h4>
                <p className="font-body-md text-body-md text-text-muted mb-4">
                  For your security, you have been logged out due to inactivity.
                </p>
                <Link
                  to="/login"
                  className="font-label-md text-label-md text-accent transition-colors hover:text-accent/80 inline-flex items-center gap-2"
                >
                  Return to Login
                  <span className="material-symbols text-[16px]">arrow_forward</span>
                </Link>
              </div>
            </div>
            <div className="absolute bottom-2 right-4 font-label-sm text-label-sm text-text-muted opacity-50">
              4. Session Expired
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
