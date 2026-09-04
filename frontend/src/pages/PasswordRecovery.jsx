import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { requestPasswordReset, confirmPasswordReset } from "../services/api/auth.js";

function getPasswordStrength(password) {
  if (!password) return { level: 0, label: "", bars: [false, false, false, false] };
  let strength = 0;
  if (password.length > 5) strength++;
  if (password.length > 8) strength++;
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  if (strength === 1 || password.length < 6) {
    return { level: 1, label: "Weak", bars: [true, false, false, false] };
  }
  if (strength === 2) {
    return { level: 2, label: "Fair", bars: [true, true, false, false] };
  }
  if (strength === 3) {
    return { level: 3, label: "Good", bars: [true, true, true, false] };
  }
  return { level: 4, label: "Strong", bars: [true, true, true, true] };
}

export default function PasswordRecovery() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState("request");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ email: "", token: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");

  const strength = useMemo(() => getPasswordStrength(form.password), [form.password]);

  const validateEmail = () => {
    const next = {};
    if (!form.email.trim()) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Enter a valid email";
    setErrors(next);
    setGeneralError("");
    return Object.keys(next).length === 0;
  };

  const validatePassword = () => {
    const next = {};
    if (!form.password) next.password = "Password is required";
    else if (form.password.length < 6) next.password = "Password must be at least 6 characters";
    if (!form.confirmPassword) next.confirmPassword = "Please confirm your password";
    else if (form.confirmPassword !== form.password) next.confirmPassword = "Passwords do not match";
    if (!form.token.trim()) next.token = "Verification code is required";
    setErrors(next);
    setGeneralError("");
    return Object.keys(next).length === 0;
  };

  const handleRequest = async (event) => {
    event.preventDefault();
    if (!validateEmail()) return;
    setSubmitting(true);
    setGeneralError("");
    try {
      await requestPasswordReset({ email: form.email });
      setScreen("sent");
    } catch (error) {
      if (error.message) {
        setGeneralError(error.message);
      } else {
        setGeneralError("Unable to send recovery link. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = async (event) => {
    event.preventDefault();
    if (!validatePassword()) return;
    setSubmitting(true);
    setGeneralError("");
    try {
      await confirmPasswordReset({
        token: form.token.trim(),
        password: form.password,
        passwordConfirm: form.confirmPassword,
      });
      setScreen("confirmed");
    } catch (error) {
      const data = error.data;
      if (data) {
        const next = {};
        if (data.token) next.token = Array.isArray(data.token) ? data.token[0] : data.token;
        if (data.password) next.password = Array.isArray(data.password) ? data.password[0] : data.password;
        if (data.password_confirm) next.confirmPassword = Array.isArray(data.password_confirm) ? data.password_confirm[0] : data.password_confirm;
        setErrors(next);
        setGeneralError(next.token || next.password || next.confirmPassword || "Unable to reset password. Please try again.");
      } else if (error.message) {
        setGeneralError(error.message);
      } else {
        setGeneralError("Unable to reset password. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const update = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setGeneralError("");
  };

  const strengthColor =
    strength.level <= 1
      ? "bg-red-400"
      : strength.level === 2
        ? "bg-yellow-400"
        : strength.level === 3
          ? "bg-yellow-400"
          : "bg-lime";

  const strengthTextColor =
    strength.level <= 1
      ? "text-red-400"
      : strength.level === 2
        ? "text-yellow-400"
        : strength.level === 3
          ? "text-yellow-400"
          : "text-lime";

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
              {screen === "request" && "Reset Password"}
              {screen === "sent" && "Check your inbox"}
              {screen === "reset" && "New Password"}
              {screen === "confirmed" && "Password Updated"}
            </h1>
            <p className="font-body-md text-body-md text-text-muted">
              {screen === "request" && "Enter your email address to receive a recovery link."}
              {screen === "sent" && "We've sent a recovery link to:"}
              {screen === "reset" && "Create a strong password for your account."}
              {screen === "confirmed" && "Your password has been successfully reset. You can now log in with your new credentials."}
            </p>
          </div>

          {screen === "request" && (
            <form onSubmit={handleRequest} className="space-y-5">
              {generalError ? (
                <div className="rounded-lg border border-red-400/50 bg-red-500/10 p-3">
                  <p className="font-label-sm text-label-sm text-red-400">{generalError}</p>
                </div>
              ) : null}
              <div className="space-y-2">
                <label
                  className="font-label-sm text-label-sm text-text-muted ml-1"
                  htmlFor="recovery-email"
                >
                  Email Address
                </label>
                <input
                  id="recovery-email"
                  type="email"
                  value={form.email}
                  onChange={update("email")}
                  placeholder="name@company.com"
                  className={`w-full rounded-lg border bg-surface-low px-4 py-3 font-body-md text-text-primary outline-none transition-all placeholder:text-text-muted/60 focus:border-lime ${
                    errors.email ? "border-red-400" : "border-outline-variant/30"
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-lime py-3 font-label-md text-label-md text-obsidian transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-70"
              >
                {submitting ? "Sending..." : "Send Recovery Link"}
                {!submitting && (
                  <span
                    className="material-symbols text-[18px]"
                    style={{ fontVariationSettings: "'FILL' 0" }}
                  >
                    arrow_forward
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-outline-variant/30 py-3 font-label-md text-label-md text-text-primary transition-colors hover:bg-surface-high"
              >
                <span
                  className="material-symbols text-[18px]"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  arrow_back
                </span>
                Back to Login
              </button>
            </form>
          )}

          {screen === "sent" && (
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-lime/10 flex items-center justify-center mb-4 border border-lime/20">
                <span
                  className="material-symbols text-[32px] text-lime"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  mark_email_read
                </span>
              </div>

              <div className="w-full mb-6 rounded-lg border border-outline-variant/30 bg-surface-low px-4 py-3">
                <p className="font-label-md text-label-md text-text-primary break-all">
                  {form.email}
                </p>
              </div>

              <div className="flex flex-col gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setScreen("reset")}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-lime py-3 font-label-md text-label-md text-obsidian transition-all hover:brightness-110 active:scale-[0.98]"
                >
                  Open Email App
                </button>

                <div className="text-center mt-2">
                  <p className="font-label-sm text-label-sm text-text-muted mb-2">
                    Didn&apos;t receive the email?
                  </p>
                  <button
                    type="button"
                    onClick={() => setScreen("request")}
                    className="font-label-md text-label-md text-accent transition-colors hover:text-accent/80"
                  >
                    Resend link
                  </button>
                </div>
              </div>
            </div>
          )}

          {screen === "reset" && (
            <form onSubmit={handleReset} className="space-y-5">
              {generalError ? (
                <div className="rounded-lg border border-red-400/50 bg-red-500/10 p-3">
                  <p className="font-label-sm text-label-sm text-red-400">{generalError}</p>
                </div>
              ) : null}
              <div className="space-y-2">
                <label
                  className="font-label-sm text-label-sm text-text-muted ml-1"
                  htmlFor="reset-token"
                >
                  Verification Code
                </label>
                <input
                  id="reset-token"
                  type="text"
                  value={form.token}
                  onChange={update("token")}
                  placeholder="Paste code from email"
                  className={`w-full rounded-lg border bg-surface-low px-4 py-3 font-body-md text-text-primary outline-none transition-all placeholder:text-text-muted/60 focus:border-lime ${
                    errors.token ? "border-red-400" : "border-outline-variant/30"
                  }`}
                />
                {errors.token && (
                  <p className="mt-1 text-sm text-red-400">{errors.token}</p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  className="font-label-sm text-label-sm text-text-muted ml-1"
                  htmlFor="new-password"
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={update("password")}
                    placeholder="••••••••"
                    className={`w-full rounded-lg border bg-surface-low px-4 py-3 font-body-md text-text-primary outline-none transition-all placeholder:text-text-muted/60 focus:border-lime ${
                      errors.password ? "border-red-400" : "border-outline-variant/30"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-accent"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <span
                      className="material-symbols text-[20px]"
                      style={{ fontVariationSettings: "'FILL' 0" }}
                    >
                      {showPassword ? "visibility" : "visibility_off"}
                    </span>
                  </button>
                </div>

                <div className="flex gap-1 mt-2">
                  {[0, 1, 2, 3].map((bar) => (
                    <div
                      key={bar}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        strength.bars[bar] ? strengthColor : "bg-surface-high"
                      }`}
                    />
                  ))}
                </div>
                <p className={`font-label-sm text-label-sm mt-1 text-right ${strengthTextColor}`}>
                  {form.password ? strength.label : "Password strength"}
                </p>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  className="font-label-sm text-label-sm text-text-muted ml-1"
                  htmlFor="confirm-password"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    type={showConfirm ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={update("confirmPassword")}
                    placeholder="••••••••"
                    className={`w-full rounded-lg border bg-surface-low px-4 py-3 font-body-md text-text-primary outline-none transition-all placeholder:text-text-muted/60 focus:border-lime ${
                      errors.confirmPassword ? "border-red-400" : "border-outline-variant/30"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-accent"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    <span
                      className="material-symbols text-[20px]"
                      style={{ fontVariationSettings: "'FILL' 0" }}
                    >
                      {showConfirm ? "visibility" : "visibility_off"}
                    </span>
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-lime py-3 font-label-md text-label-md text-obsidian transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-70"
              >
                {submitting ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}

          {screen === "confirmed" && (
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-lime/10 flex items-center justify-center mb-4 border border-lime/20">
                <span
                  className="material-symbols text-[32px] text-lime"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  check_circle
                </span>
              </div>

              <Link
                to="/login"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-lime py-3 font-label-md text-label-md text-obsidian transition-all hover:brightness-110 active:scale-[0.98]"
              >
                Proceed to Login
                <span
                  className="material-symbols text-[18px]"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  login
                </span>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
