import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { verifyEmail, resendVerification } from "../services/api/auth.js";

const RESEND_SECONDS = 45;

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function PhoneVerification() {
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const [generalError, setGeneralError] = useState("");

  useEffect(() => {
    if (resendTimer <= 0) {
      setCanResend(true);
      return;
    }
    const id = setTimeout(() => setResendTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [resendTimer]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!token.trim()) {
      setError("Please enter your verification code.");
      return;
    }
    setSubmitting(true);
    setError("");
    setGeneralError("");
    try {
      const data = await verifyEmail({ token: token.trim() });
      setSuccess(true);
      return data;
    } catch (err) {
      const message = err.data?.detail || err.message || "Verification failed. Please try again.";
      setGeneralError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setGeneralError("");
    setError("");
    try {
      await resendVerification({ email: "" });
    } catch {
      // ignore resend errors, backend intentionally returns generic message
    } finally {
      setResendTimer(RESEND_SECONDS);
      setCanResend(false);
      setToken("");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-5 py-12 md:px-0">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[80vw] w-[80vw] max-h-[800px] max-w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime/5 blur-[120px]"
        aria-hidden="true"
      />

      <main className="relative z-10 w-full max-w-[480px]">
        <div className="relative overflow-hidden rounded-xl border border-outline-variant/30 bg-surface/70 p-8 shadow-2xl backdrop-blur-[20px] md:p-10">
          <div
            className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-lime/40 to-transparent"
            aria-hidden="true"
          />

          <div className="flex flex-col items-center text-center mb-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-outline-variant/50 bg-surface">
              <span
                className="material-symbols text-lime"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                auto_awesome
              </span>
            </div>
            <h1 className="font-headline-sm text-headline-sm text-text-primary mb-2">
              {success ? "Email Verified" : "Verify your email"}
            </h1>
            <p className="font-body-md text-body-md text-text-muted">
              {success
                ? "Your email has been verified."
                : "Enter the verification code sent to your email."}
            </p>
          </div>

          {success && (
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-lime/10 flex items-center justify-center mb-4 border border-lime/20">
                <span
                  className="material-symbols text-[32px] text-lime"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
              </div>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-lime py-3 font-label-md text-label-md text-obsidian transition-all hover:brightness-110 active:scale-[0.98]"
              >
                Proceed to Login
                <span
                  className="material-symbols text-[18px]"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  login
                </span>
              </button>
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label
                  className="font-label-sm text-label-sm text-text-muted ml-1"
                  htmlFor="verify-token"
                >
                  Verification Code
                </label>
                <input
                  id="verify-token"
                  type="text"
                  value={token}
                  onChange={(e) => {
                    setToken(e.target.value);
                    setError("");
                    setGeneralError("");
                  }}
                  placeholder="Enter verification code"
                  className={`w-full rounded-lg border bg-surface-low px-4 py-3 font-body-md text-text-primary outline-none transition-all placeholder:text-text-muted/60 focus:border-lime ${
                    error ? "border-red-400" : "border-outline-variant/30"
                  }`}
                />
                {(error || generalError) && (
                  <p className="text-sm text-red-400">{error || generalError}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-lime py-3 font-label-md text-label-md text-obsidian transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-70"
              >
                {submitting ? "Verifying..." : "Verify Code"}
              </button>

              <div className="flex items-center justify-between text-center">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="flex items-center gap-2 font-label-sm text-label-sm text-accent transition-colors hover:text-accent/80"
                >
                  <span
                    className="material-symbols text-[18px]"
                    style={{ fontVariationSettings: "'FILL' 0" }}
                  >
                    arrow_back
                  </span>
                  Back to Login
                </button>

                <div className="font-label-sm text-label-sm">
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResend}
                      className="text-accent transition-colors hover:text-accent/80"
                    >
                      Resend Code
                    </button>
                  ) : (
                    <span className="text-text-muted">
                      Resend in {formatTime(resendTimer)}
                    </span>
                  )}
                </div>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
