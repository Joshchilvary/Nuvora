import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";

function getPasswordStrength(password) {
  if (!password) return { level: 0, label: "", width: "0%" };
  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 2) return { level: 1, label: "Weak", width: "33%" };
  if (score === 3) return { level: 2, label: "Fair", width: "66%" };
  return { level: 3, label: "Strong", width: "100%" };
}

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [terms, setTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const strength = useMemo(() => getPasswordStrength(form.password), [form.password]);

  const validate = () => {
    const next = {};
    if (!form.fullName.trim()) next.fullName = "Full name is required";
    if (!form.email.trim()) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = "Enter a valid email";
    if (!form.password) next.password = "Password is required";
    else if (form.password.length < 6)
      next.password = "Password must be at least 6 characters";
    if (!form.confirmPassword) next.confirmPassword = "Please confirm your password";
    else if (form.confirmPassword !== form.password)
      next.confirmPassword = "Passwords do not match";
    if (!terms) next.terms = "You must agree to the terms";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setTimeout(() => setSubmitting(false), 1200);
  };

  const update = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const strengthColor =
    strength.level === 1
      ? "bg-red-400"
      : strength.level === 2
        ? "bg-yellow-400"
        : "bg-lime";

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
              Join the discovery
            </h1>
            <p className="font-body-md text-body-md text-text-muted">
              Create an account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label
                className="font-label-sm text-label-sm text-text-muted ml-1"
                htmlFor="register-name"
              >
                Full Name
              </label>
              <input
                id="register-name"
                type="text"
                value={form.fullName}
                onChange={update("fullName")}
                placeholder="Enter your full name"
                className={`w-full rounded-lg border bg-surface-low px-4 py-3 font-body-md text-text-primary outline-none transition-all placeholder:text-text-muted/60 focus:border-lime ${
                  errors.fullName ? "border-red-400" : "border-outline-variant/30"
                }`}
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-400">{errors.fullName}</p>
              )}
            </div>

            <div className="space-y-2">
              <label
                className="font-label-sm text-label-sm text-text-muted ml-1"
                htmlFor="register-email"
              >
                Email Address
              </label>
              <input
                id="register-email"
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

            <div className="space-y-2">
              <label
                className="font-label-sm text-label-sm text-text-muted ml-1"
                htmlFor="register-password"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={update("password")}
                  placeholder="Create a password"
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
              {form.password ? (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex flex-1 gap-1">
                    {[1, 2, 3].map((bar) => (
                      <div
                        key={bar}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          bar <= strength.level ? strengthColor : "bg-surface-high"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-label-sm text-label-sm text-text-muted">
                    {strength.label}
                  </span>
                </div>
              ) : null}
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <label
                className="font-label-sm text-label-sm text-text-muted ml-1"
                htmlFor="register-confirm"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="register-confirm"
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={update("confirmPassword")}
                  placeholder="Confirm your password"
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

            <div className="flex items-start gap-3 pt-1">
              <div className="flex items-center">
                <input
                  id="register-terms"
                  type="checkbox"
                  checked={terms}
                  onChange={(event) => setTerms(event.target.checked)}
                  className="h-4 w-4 rounded border-outline-variant bg-surface-low text-lime focus:ring-lime"
                />
              </div>
              <label
                htmlFor="register-terms"
                className="font-label-sm text-label-sm text-text-muted"
              >
                I agree to the{" "}
                <Link
                  to="/terms"
                  className="text-accent transition-colors hover:text-accent/80"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  to="/privacy"
                  className="text-accent transition-colors hover:text-accent/80"
                >
                  Privacy Policy
                </Link>
                .
              </label>
            </div>
            {errors.terms && (
              <p className="mt-1 text-sm text-red-400">{errors.terms}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-lime py-3 font-label-md text-label-md text-obsidian transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-70"
            >
              {submitting ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="font-label-sm text-label-sm text-text-muted">
              Already have an account?{" "}
            </span>
            <Link
              to="/login"
              className="font-label-sm text-label-sm text-accent transition-colors hover:text-accent/80"
            >
              Log in
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
