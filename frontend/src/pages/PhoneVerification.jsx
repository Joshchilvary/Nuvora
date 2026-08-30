import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 45;

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function PhoneVerification() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (resendTimer <= 0) {
      setCanResend(true);
      return;
    }
    const id = setTimeout(() => setResendTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [resendTimer]);

  const focusIndex = useCallback((index) => {
    const el = inputsRef.current[index];
    if (el) el.focus();
  }, []);

  const handleChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    setError("");

    if (digit && index < OTP_LENGTH - 1) {
      focusIndex(index + 1);
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      focusIndex(index - 1);
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const paste = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!paste) return;
    const next = [...otp];
    for (let i = 0; i < paste.length; i++) {
      next[i] = paste[i];
    }
    setOtp(next);
    setError("");
    const nextEmpty = next.findIndex((v) => v === "");
    if (nextEmpty === -1) focusIndex(OTP_LENGTH - 1);
    else focusIndex(nextEmpty);
  };

  const validate = () => {
    if (otp.some((d) => d === "")) {
      setError("Please enter the full 6-digit code.");
      return false;
    }
    return true;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setError("");
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
    }, 1200);
  };

  const handleResend = () => {
    setOtp(Array(OTP_LENGTH).fill(""));
    setResendTimer(RESEND_SECONDS);
    setCanResend(false);
    setError("");
    setSuccess(false);
    setTimeout(() => focusIndex(0), 50);
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
              {success ? "Phone Verified" : "Verifying identity"}
            </h1>
            <p className="font-body-md text-body-md text-text-muted">
              {success
                ? "Your phone number has been verified."
                : "Enter the 6-digit code sent to"}
            </p>
            {!success && (
              <p className="mt-1 font-label-md text-label-md text-text-primary">
                +1 (555) 019-2834
              </p>
            )}
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
              <div className="flex justify-between gap-2">
                {Array.from({ length: OTP_LENGTH }).map((_, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputsRef.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={otp[index]}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className={`w-full rounded-lg border bg-surface-low px-2 py-3 text-center font-mono-auth text-mono-auth text-text-primary outline-none transition-all focus:border-lime ${
                      error && otp[index] === "" ? "border-red-400" : "border-outline-variant/30"
                    }`}
                  />
                ))}
              </div>

              {error && (
                <p className="text-center text-sm text-red-400">{error}</p>
              )}

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
