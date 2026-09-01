import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { INITIAL_STORE, STORE_CATEGORIES, STORE_STATUS } from "../data/sellerStore.js";
import { PRODUCTS } from "../data/products.js";
import Button from "../components/ui/Button.jsx";

function Field({ label, htmlFor, required, error, children, hint }) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={htmlFor}
        className="block font-label-sm text-label-sm text-text-primary"
      >
        {label}
        {required ? <span className="text-red-400 ml-1">*</span> : null}
      </label>
      {children}
      {hint && !error ? (
        <p className="text-xs text-text-muted">{hint}</p>
      ) : null}
      {error ? (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function inputClass(hasError) {
  return `block w-full rounded-lg bg-surface-container-high border px-4 py-3 font-body-md text-text-primary outline-none transition-all placeholder:text-text-muted/60 focus:border-lime ${
    hasError ? "border-red-400" : "border-outline-variant/30"
  }`;
}

function Section({ title, description, children }) {
  return (
    <section className="glass-panel rounded-xl p-6 md:p-8 shadow-lg relative overflow-hidden">
      <div
        className="absolute top-0 right-0 h-64 w-64 bg-lime/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"
        aria-hidden="true"
      />
      <div className="mb-6 relative z-10">
        <h2 className="font-h3 text-h3 text-text-primary">{title}</h2>
        {description ? (
          <p className="font-body-md text-body-md text-text-muted mt-1">
            {description}
          </p>
        ) : null}
      </div>
      <div className="relative z-10">{children}</div>
    </section>
  );
}

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = "Store name is required";
  else if (form.name.trim().length < 3)
    errors.name = "Store name must be at least 3 characters";
  if (!form.description.trim())
    errors.description = "Description is required";
  else if (form.description.trim().length < 10)
    errors.description = "Description must be at least 10 characters";
  if (!form.category) errors.category = "Category is required";
  if (!form.email.trim()) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = "Enter a valid email address";
  if (!form.phone.trim()) errors.phone = "Phone number is required";
  if (!form.location.trim()) errors.location = "Location is required";
  return errors;
}

export default function SellerStore() {
  const [form, setForm] = useState({ ...INITIAL_STORE });
  const [status, setStatus] = useState(INITIAL_STORE.status);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const logoInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const update = (field, value) => {
    setDirty(true);
    setSaved(false);
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      setErrors(validate({ ...form, [field]: value }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate(form));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        update("logo", ev.target.result);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleBannerChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        update("banner", ev.target.result);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleSave = (e) => {
    e.preventDefault();
    const allErrors = validate(form);
    setErrors(allErrors);
    setTouched({
      name: true,
      description: true,
      category: true,
      email: true,
      phone: true,
      location: true,
    });
    if (Object.keys(allErrors).length > 0) {
      const firstErrorField = document.querySelector("[data-error='true']");
      firstErrorField?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setSaved(true);
    setDirty(false);
  };

  const handleCancel = () => {
    setForm({ ...INITIAL_STORE });
    setStatus(INITIAL_STORE.status);
    setErrors({});
    setTouched({});
    setDirty(false);
    setSaved(false);
  };

  const featuredProducts = PRODUCTS.slice(0, 4);
  const statusConfig = STORE_STATUS[status] ?? STORE_STATUS.active;

  return (
    <div className="flex flex-col min-h-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <Link
            to="/seller"
            className="inline-flex items-center gap-2 text-text-muted hover:text-accent transition-colors mb-4"
          >
            <span
              className="material-symbols text-sm"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              arrow_back
            </span>
            <span className="font-label-sm text-label-sm">Back to Dashboard</span>
          </Link>
          <h1 className="font-display text-h2 text-text-primary">Store</h1>
          <p className="font-body-md text-body-md text-text-muted mt-1">
            Manage how your store appears to customers on NUVORA.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusConfig.className}`}
          >
            <span
              className="material-symbols text-xs"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {statusConfig.icon}
            </span>
            {statusConfig.label}
          </span>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6" noValidate>
        {/* Store Banner + Logo */}
        <Section
          title="Store Identity"
          description="The visual face of your storefront."
        >
          <div className="space-y-6">
            {/* Banner */}
            <div className="relative">
              <div className="h-32 md:h-48 w-full rounded-lg overflow-hidden border border-outline-variant/30 bg-surface">
                <img
                  src={form.banner}
                  alt="Store banner"
                  className="h-full w-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => bannerInputRef.current?.click()}
                className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-lg bg-obsidian/80 px-3 py-1.5 text-xs font-semibold text-text-primary hover:bg-obsidian transition-colors"
              >
                <span
                  className="material-symbols text-[14px]"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  edit
                </span>
                Change Cover
              </button>
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                onChange={handleBannerChange}
                className="sr-only"
                aria-label="Change store banner"
              />
            </div>

            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 shrink-0 rounded-full overflow-hidden border-2 border-outline-variant/30 bg-surface">
                <img
                  src={form.logo}
                  alt="Store logo"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant/30 bg-surface-high px-3 py-1.5 text-xs font-semibold text-text-primary hover:text-accent transition-colors"
                >
                  <span
                    className="material-symbols text-[14px]"
                    style={{ fontVariationSettings: "'FILL' 0" }}
                  >
                    edit
                  </span>
                  Change Logo
                </button>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="sr-only"
                  aria-label="Change store logo"
                />
                <p className="text-xs text-text-muted mt-1">
                  Recommended: 400x400px, square.
                </p>
              </div>
            </div>
          </div>
        </Section>

        {/* Store Details Form */}
        <Section
          title="Store Details"
          description="Basic information about your store."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2" data-error={!!errors.name}>
              <Field
                label="Store Name"
                htmlFor="store-name"
                required
                error={touched.name ? errors.name : undefined}
              >
                <input
                  id="store-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  onBlur={() => handleBlur("name")}
                  placeholder="Aether Collective"
                  className={inputClass(touched.name && errors.name)}
                  maxLength={60}
                />
              </Field>
            </div>

            <div className="md:col-span-2" data-error={!!errors.description}>
              <Field
                label="Description"
                htmlFor="store-description"
                required
                error={touched.description ? errors.description : undefined}
                hint="Tell customers what your store is about."
              >
                <textarea
                  id="store-description"
                  rows={3}
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  onBlur={() => handleBlur("description")}
                  placeholder="Curated technology and lifestyle products..."
                  className={inputClass(touched.description && errors.description)}
                  maxLength={280}
                />
              </Field>
            </div>

            <div data-error={!!errors.category}>
              <Field
                label="Category"
                htmlFor="store-category"
                required
                error={touched.category ? errors.category : undefined}
              >
                <select
                  id="store-category"
                  value={form.category}
                  onChange={(e) => update("category", e.target.value)}
                  onBlur={() => handleBlur("category")}
                  className={inputClass(touched.category && errors.category)}
                >
                  <option value="">Select a category</option>
                  {STORE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div data-error={!!errors.email}>
              <Field
                label="Email"
                htmlFor="store-email"
                required
                error={touched.email ? errors.email : undefined}
              >
                <input
                  id="store-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  placeholder="hello@store.com"
                  className={inputClass(touched.email && errors.email)}
                />
              </Field>
            </div>

            <div data-error={!!errors.phone}>
              <Field
                label="Phone"
                htmlFor="store-phone"
                required
                error={touched.phone ? errors.phone : undefined}
              >
                <input
                  id="store-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  onBlur={() => handleBlur("phone")}
                  placeholder="+1 (555) 000-0000"
                  className={inputClass(touched.phone && errors.phone)}
                />
              </Field>
            </div>

            <div data-error={!!errors.location}>
              <Field
                label="Location"
                htmlFor="store-location"
                required
                error={touched.location ? errors.location : undefined}
              >
                <input
                  id="store-location"
                  type="text"
                  value={form.location}
                  onChange={(e) => update("location", e.target.value)}
                  onBlur={() => handleBlur("location")}
                  placeholder="City, Country"
                  className={inputClass(touched.location && errors.location)}
                />
              </Field>
            </div>
          </div>
        </Section>

        {/* Store Status */}
        <Section
          title="Store Status"
          description="Control whether your storefront is visible to customers."
        >
          <div className="space-y-3">
            {Object.entries(STORE_STATUS).map(([key, cfg]) => (
              <label
                key={key}
                className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                  status === key
                    ? "border-lime/40 bg-lime/5"
                    : "border-outline-variant/20 bg-surface-container-low hover:border-outline-variant/40"
                }`}
              >
                <input
                  type="radio"
                  name="store-status"
                  value={key}
                  checked={status === key}
                  onChange={() => {
                    setStatus(key);
                    setDirty(true);
                    setSaved(false);
                  }}
                  className="mt-0.5 accent-lime"
                />
                <div>
                  <p className="font-label-sm text-label-sm text-text-primary">{cfg.label}</p>
                  <p className="text-xs text-text-muted mt-0.5">{cfg.description}</p>
                </div>
              </label>
            ))}
          </div>
        </Section>

        {/* Store Preview */}
        <Section
          title="Store Preview"
          description="How your store will appear to customers."
        >
          <div className="rounded-xl border border-outline-variant/20 overflow-hidden bg-surface">
            {/* Preview Banner */}
            <div className="h-28 md:h-36 w-full relative">
              <img
                src={form.banner}
                alt="Preview banner"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/60 to-transparent" />
            </div>
            {/* Preview Info */}
            <div className="p-5 -mt-10 relative">
              <div className="flex items-end gap-4 mb-4">
                <div className="h-16 w-16 shrink-0 rounded-full overflow-hidden border-4 border-surface-container shadow-lg">
                  <img
                    src={form.logo}
                    alt="Preview logo"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="pb-1">
                  <p className="font-h4 text-h4 text-text-primary">{form.name || "Store Name"}</p>
                  <p className="text-xs text-text-muted">{form.category || "Category"}</p>
                </div>
              </div>
              <p className="font-body-md text-body-md text-text-muted mb-4">
                {form.description || "Store description will appear here."}
              </p>
              {/* Featured Products */}
              <div className="border-t border-outline-variant/20 pt-4">
                <p className="font-label-sm text-label-sm text-text-primary mb-3">Featured Products</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {featuredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="rounded-lg border border-outline-variant/20 bg-surface-container-low overflow-hidden"
                    >
                      <div className="aspect-square">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-2">
                        <p className="text-xs text-text-primary truncate">{product.name}</p>
                        <p className="text-xs text-accent font-semibold">${product.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Actions */}
        <div className="glass-panel rounded-xl p-6 md:p-8 shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sticky bottom-0 bg-surface/95 backdrop-blur">
          <div>
            {saved ? (
              <p className="text-sm text-accent flex items-center gap-1.5">
                <span
                  className="material-symbols text-sm"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                Store changes saved locally.
              </p>
            ) : dirty ? (
              <p className="text-sm text-amber-400">You have unsaved changes.</p>
            ) : (
              <p className="text-sm text-text-muted">
                Changes are saved locally. Backend persistence is not yet connected.
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:shrink-0">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={!dirty && !saved}>
              Cancel
            </Button>
            <Button type="submit" disabled={!dirty}>
              <span
                className="material-symbols text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                save
              </span>
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
