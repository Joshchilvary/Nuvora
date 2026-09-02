import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";
import {
  CUSTOMER_ACCOUNT,
  LANGUAGE_OPTIONS,
  CURRENCY_OPTIONS,
  REGION_OPTIONS,
  DEFAULT_SETTINGS_BACKUP,
} from "../data/customerSettings.js";
import Button from "../components/ui/Button.jsx";

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
          <p className="font-body-md text-body-md text-text-muted mt-1">{description}</p>
        ) : null}
      </div>
      <div className="relative z-10">{children}</div>
    </section>
  );
}

function Field({ label, htmlFor, required, children, hint }) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="block font-label-sm text-label-sm text-text-primary">
        {label}
        {required ? <span className="text-red-400 ml-1">*</span> : null}
      </label>
      {children}
      {hint ? <p className="text-xs text-text-muted">{hint}</p> : null}
    </div>
  );
}

function inputClass() {
  return "block w-full rounded-lg bg-surface-container-high border border-outline-variant/30 px-4 py-3 font-body-md text-text-primary outline-none transition-all placeholder:text-text-muted/60 focus:border-lime";
}

function Toggle({ checked, onChange, label, description, important }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="font-label-sm text-label-sm text-text-primary flex items-center gap-2">
          {label}
          {important ? (
            <span
              className="inline-flex items-center rounded-full border border-lime/30 bg-lime/10 px-1.5 py-0.5 text-[10px] font-semibold text-accent"
              title="Essential security notifications"
            >
              <span className="material-symbols text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
                shield
              </span>
              Important
            </span>
          ) : null}
        </p>
        {description ? <p className="text-xs text-text-muted mt-0.5">{description}</p> : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-lime" : "bg-surface-highest"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

function ConfirmModal({ open, title, message, confirmLabel, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="absolute inset-0 bg-obsidian/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-xl border border-outline-variant/20 bg-surface-container p-6 shadow-2xl">
        <h3 className="font-h4 text-h4 text-text-primary mb-2">{title}</h3>
        <p className="font-body-md text-body-md text-text-muted mb-6">{message}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" variant="primary" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

function AppearanceRadio({ value, label, icon, selected, onChange }) {
  const selectedSelf = selected === value;
  return (
    <label className="flex items-center gap-3 cursor-pointer rounded-xl border border-outline-variant/30 bg-surface-container px-4 py-3 transition-all hover:border-lime/50 has-[:checked]:border-lime has-[:checked]:bg-lime/5">
      <input
        type="radio"
        name="appearance"
        value={value}
        checked={selectedSelf}
        onChange={() => onChange(value)}
        className="h-4 w-4 text-lime focus:ring-lime/50"
        aria-label={label}
      />
      <span
        className={`material-symbols text-xl ${selectedSelf ? "text-accent" : "text-text-muted"}`}
        style={{ fontVariationSettings: selectedSelf ? "'FILL' 1" : "'FILL' 0" }}
      >
        {icon}
      </span>
      <span className="font-label-sm text-label-sm text-text-primary">{label}</span>
    </label>
  );
}

export default function CustomerSettings() {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState(() => DEFAULT_SETTINGS_BACKUP());
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [profileEditing, setProfileEditing] = useState(false);
  const [profileBackup, setProfileBackup] = useState(null);
  const [manageOpen, setManageOpen] = useState(false);

  const startEditingProfile = () => {
    setProfileBackup(settings.profile);
    setProfileEditing(true);
  };

  const saveProfile = () => {
    setProfileEditing(false);
    setProfileBackup(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const cancelProfileEdit = () => {
    setSettings((prev) => ({ ...prev, profile: profileBackup }));
    setProfileEditing(false);
    setProfileBackup(null);
  };

  const toggleTwoFactor = (value) => {
    setDirty(true);
    setSaved(false);
    setSettings((prev) => ({
      ...prev,
      security: { ...prev.security, twoFactorEnabled: value },
    }));
  };

  const updateProfile = (field, value) => {
    setDirty(true);
    setSaved(false);
    setSettings((prev) => ({ ...prev, profile: { ...prev.profile, [field]: value } }));
  };

  const updateNotifPref = (field, value) => {
    setDirty(true);
    setSaved(false);
    setSettings((prev) => ({
      ...prev,
      notificationPreferences: { ...prev.notificationPreferences, [field]: value },
    }));
  };

  const updatePrivacy = (field, value) => {
    setDirty(true);
    setSaved(false);
    setSettings((prev) => ({ ...prev, privacy: { ...prev.privacy, [field]: value } }));
  };

  const updateRegional = (field, value) => {
    setDirty(true);
    setSaved(false);
    setSettings((prev) => ({ ...prev, regional: { ...prev.regional, [field]: value } }));
  };

  const handleAppearance = (value) => {
    setDirty(true);
    setSaved(false);
    setTheme(value);
  };

  const handleSaveAll = () => {
    setSaved(true);
    setDirty(false);
  };

  const handleCancel = () => {
    setSettings(() => DEFAULT_SETTINGS_BACKUP());
    setProfileBackup(null);
    setProfileEditing(false);
    setDirty(false);
    setSaved(false);
  };

  const handlePasswordReset = () => {
    setConfirmOpen(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Page Header */}
      <div className="mb-8">
        <Link
          to="/customer"
          className="inline-flex items-center gap-2 text-text-muted hover:text-accent transition-colors mb-4"
        >
          <span className="material-symbols text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>
            arrow_back
          </span>
          <span className="font-label-sm text-label-sm">Back to Dashboard</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-h2 text-text-primary">Settings</h1>
            <p className="font-body-md text-body-md text-text-muted mt-1">
              Manage your account, preferences, privacy, and security.
            </p>
          </div>
          <Link to="/marketplace">
            <Button type="button" variant="outline" size="sm">
              <span
                className="material-symbols text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                storefront
              </span>
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-2 text-sm text-text-muted">
          <li>
            <Link to="/customer" className="hover:text-accent transition-colors">
              Customer Dashboard
            </Link>
          </li>
          <span className="material-symbols text-xs" style={{ fontVariationSettings: "'FILL' 0" }}>
            chevron_right
          </span>
          <li className="text-text-primary font-medium">Settings</li>
        </ol>
      </nav>

      {/* Save Feedback */}
      {saved ? (
        <div className="mb-6 rounded-lg border border-lime/30 bg-lime/5 p-4 flex items-center gap-3">
          <span className="material-symbols text-accent" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
          <p className="text-sm text-text-primary">
            Settings saved locally. Backend persistence is not yet connected.
          </p>
        </div>
      ) : null}

      <div className="space-y-6">
        {/* Profile & Account */}
        <Section title="Profile & Account" description="Your basic account information.">
          <div className="flex items-center gap-6 mb-6">
            <div className="h-20 w-20 shrink-0 rounded-full overflow-hidden border border-outline-variant/30">
              <img
                src={CUSTOMER_ACCOUNT.avatar}
                alt={CUSTOMER_ACCOUNT.fullName}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="font-label-sm text-label-sm text-text-primary">{CUSTOMER_ACCOUNT.fullName}</p>
              <p className="text-sm text-text-muted">{CUSTOMER_ACCOUNT.tier}</p>
              <div className="mt-2 flex items-center gap-2">
                {CUSTOMER_ACCOUNT.verified ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-lime/30 bg-lime/10 px-2.5 py-1 text-xs font-semibold text-accent">
                    <span
                      className="material-symbols text-xs"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      verified_user
                    </span>
                    Verified Account
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Full Name" htmlFor="settings-name" required>
              {profileEditing ? (
                <input
                  id="settings-name"
                  type="text"
                  value={settings.profile.fullName}
                  onChange={(e) => updateProfile("fullName", e.target.value)}
                  className={inputClass()}
                />
              ) : (
                <p className="font-body-md text-body-md text-text-primary pt-2.5">{settings.profile.fullName}</p>
              )}
            </Field>
            <Field label="Email address" htmlFor="settings-email" required>
              {profileEditing ? (
                <input
                  id="settings-email"
                  type="email"
                  value={settings.profile.email}
                  onChange={(e) => updateProfile("email", e.target.value)}
                  className={inputClass()}
                />
              ) : (
                <p className="font-body-md text-body-md text-text-primary pt-2.5">{settings.profile.email}</p>
              )}
            </Field>
            <Field label="Phone number" htmlFor="settings-phone">
              {profileEditing ? (
                <input
                  id="settings-phone"
                  type="tel"
                  value={settings.profile.phone}
                  onChange={(e) => updateProfile("phone", e.target.value)}
                  className={inputClass()}
                />
              ) : (
                <p className="font-body-md text-body-md text-text-primary pt-2.5">{settings.profile.phone}</p>
              )}
            </Field>
            <Field label="Account status" htmlFor="settings-status">
              <input
                id="settings-status"
                type="text"
                value={CUSTOMER_ACCOUNT.status}
                readOnly
                className={`${inputClass()} cursor-default opacity-60`}
              />
            </Field>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            {profileEditing ? (
              <>
                <Button type="button" onClick={saveProfile}>
                  <span
                    className="material-symbols text-sm"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    save
                  </span>
                  Save Profile
                </Button>
                <Button type="button" variant="outline" onClick={cancelProfileEdit}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button type="button" variant="outline" size="sm" onClick={startEditingProfile}>
                <span
                  className="material-symbols text-sm"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  edit
                </span>
                Edit Profile
              </Button>
            )}
          </div>
        </Section>

        {/* Notification Preferences */}
        <Section
          title="Notification Preferences"
          description="Choose which notifications you receive on NUVORA."
        >
          <div className="divide-y divide-outline-variant/10">
            <Toggle
              checked={settings.notificationPreferences.orderUpdates}
              onChange={(v) => updateNotifPref("orderUpdates", v)}
              label="Order updates"
              description="Confirmation, status changes, and shipping notifications for your orders."
            />
            <Toggle
              checked={settings.notificationPreferences.deliveryUpdates}
              onChange={(v) => updateNotifPref("deliveryUpdates", v)}
              label="Delivery updates"
              description="Real-time delivery tracking and arrival reminders."
            />
            <Toggle
              checked={settings.notificationPreferences.promotionsOffers}
              onChange={(v) => updateNotifPref("promotionsOffers", v)}
              label="Promotions & offers"
              description="Exclusive deals, drops, and limited-time offers."
            />
            <Toggle
              checked={settings.notificationPreferences.wishlistAlerts}
              onChange={(v) => updateNotifPref("wishlistAlerts", v)}
              label="Wishlist alerts"
              description="Price drops and restock alerts for saved items."
            />
            <Toggle
              checked={settings.notificationPreferences.aiRecommendations}
              onChange={(v) => updateNotifPref("aiRecommendations", v)}
              label="AI recommendations"
              description="Personalized discovery suggestions from NUVORA AI."
            />
            <Toggle
              checked={settings.notificationPreferences.securityAlerts}
              onChange={(v) => updateNotifPref("securityAlerts", v)}
              label="Security alerts"
              description="Critical security notifications you should always keep on."
              important
            />
          </div>
        </Section>

        {/* Appearance */}
        <Section title="Appearance" description="Choose how NUVORA looks for you.">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <AppearanceRadio
              value="light"
              label="Light"
              icon="light_mode"
              selected={theme}
              onChange={handleAppearance}
            />
            <AppearanceRadio
              value="dark"
              label="Dark"
              icon="dark_mode"
              selected={theme}
              onChange={handleAppearance}
            />
          </div>
          <p className="text-xs text-text-muted mt-3">
            Appearance also controls the header theme toggle.
          </p>
        </Section>

        {/* Language & Regional */}
        <Section title="Language & Regional Preferences" description="Localize your NUVORA experience.">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Field label="Language" htmlFor="settings-language">
              <select
                id="settings-language"
                value={settings.regional.language}
                onChange={(e) => updateRegional("language", e.target.value)}
                className={inputClass()}
              >
                {LANGUAGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.label}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Currency" htmlFor="settings-currency">
              <select
                id="settings-currency"
                value={settings.regional.currency}
                onChange={(e) => updateRegional("currency", e.target.value)}
                className={inputClass()}
              >
                {CURRENCY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.label}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Region" htmlFor="settings-region">
              <select
                id="settings-region"
                value={settings.regional.region}
                onChange={(e) => updateRegional("region", e.target.value)}
                className={inputClass()}
              >
                {REGION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.label}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </Section>

        {/* Privacy */}
        <Section title="Privacy" description="Control how your data is used.">
          <div className="divide-y divide-outline-variant/10">
            <Toggle
              checked={settings.privacy.personalizedRecommendations}
              onChange={(v) => updatePrivacy("personalizedRecommendations", v)}
              label="Personalized recommendations"
              description="Let NUVORA tailor product discovery to your behavior."
            />
            <Toggle
              checked={settings.privacy.dataSharing}
              onChange={(v) => updatePrivacy("dataSharing", v)}
              label="Data sharing preferences"
              description="Share anonymized data to help improve NUVORA services."
            />
            <Toggle
              checked={settings.privacy.marketingPersonalization}
              onChange={(v) => updatePrivacy("marketingPersonalization", v)}
              label="Marketing personalization"
              description="Use your preferences to personalize marketing communications."
            />
          </div>
        </Section>

        {/* Security */}
        <Section title="Security" description="Protect your customer account.">
          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-lg border border-outline-variant/20 bg-surface-container p-4">
              <div>
                <p className="font-label-sm text-label-sm text-text-primary">Password</p>
                <p className="text-xs text-text-muted mt-0.5">
                  Last changed:{" "}
                  {new Date(
                    settings.security.passwordLastChanged + "T00:00:00"
                  ).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <Link to="/forgot-password">
                <Button type="button" variant="outline" size="sm">
                  Change Password
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-outline-variant/20 bg-surface-container p-4">
              <div>
                <p className="font-label-sm text-label-sm text-text-primary">
                  Two-Factor Authentication
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  {settings.security.twoFactorEnabled
                    ? "Added extra protection to your account."
                    : "Add another layer of protection to your account."}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                    settings.security.twoFactorEnabled
                      ? "bg-lime/10 text-accent border-lime/30"
                      : "bg-surface-high text-text-muted border-outline-variant/30"
                  }`}
                >
                  {settings.security.twoFactorEnabled ? "Enabled" : "Not enabled"}
                </span>
                <Button type="button" variant="outline" size="sm" onClick={() => setManageOpen((o) => !o)}>
                  <span
                    className="material-symbols text-sm"
                    style={{ fontVariationSettings: "'FILL' 0" }}
                  >
                    {manageOpen ? "expand_more" : "manage_accounts"}
                  </span>
                  Manage Security
                </Button>
              </div>
            </div>

            {manageOpen ? (
              <div className="rounded-lg border border-outline-variant/20 bg-surface-container p-4">
                <p className="font-label-sm text-label-sm text-text-primary mb-3">
                  Two-Factor Authentication
                </p>
                <div className="flex items-center justify-between py-2">
                  <p className="text-sm text-text-muted">Enable 2FA</p>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.security.twoFactorEnabled}
                    onClick={() => toggleTwoFactor(!settings.security.twoFactorEnabled)}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                      settings.security.twoFactorEnabled ? "bg-lime" : "bg-surface-highest"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                        settings.security.twoFactorEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                {settings.security.twoFactorEnabled ? (
                  <div className="mt-3 rounded-lg border border-outline-variant/20 bg-surface-container-low p-3">
                    <p className="text-xs text-text-muted mb-1">Recovery key</p>
                    <p className="font-mono text-sm text-text-primary tracking-wider break-all">
                      7F4A-9B2C-1E8D-5F03-A6C4
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      Save this key somewhere safe. It can be used to recover
                      access if you lose your device.
                    </p>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div>
              <p className="font-label-sm text-label-sm text-text-primary mb-3">
                Active Sessions
              </p>
              <div className="space-y-3">
                {settings.security.sessions.map((session, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg border border-outline-variant/20 bg-surface-container-low p-3"
                  >
                    <div>
                      <p className="font-body-md text-body-md text-text-primary">
                        {session.device}
                      </p>
                      <p className="text-xs text-text-muted">
                        {session.location} · {session.lastActive}
                      </p>
                    </div>
                    {session.current ? (
                      <span className="text-xs text-accent font-semibold">
                        Current
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmOpen("session")}
                        className="font-label-sm text-label-sm text-text-muted hover:text-accent transition-colors"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-lime/20 bg-lime/5 p-4">
              <div className="flex items-start gap-3">
                <span
                  className="material-symbols text-accent mt-0.5"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  shield
                </span>
                <div>
                  <p className="font-label-sm text-label-sm text-text-primary">
                    Security alerts are always on
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    You cannot disable critical security alerts. They keep your
                    account safe.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Section>
      </div>

      {/* Save / Reset Actions */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <Button type="button" onClick={handleSaveAll} disabled={!dirty}>
          <span
            className="material-symbols text-sm"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            save
          </span>
          Save Changes
        </Button>
        <Button type="button" variant="outline" onClick={handleCancel} disabled={!dirty}>
          Cancel / Reset
        </Button>
      </div>

      <ConfirmModal
        open={confirmOpen === "session"}
        title="Revoke Session?"
        message="This is a prototype action. In production, this would sign you out of the selected device. No real changes will be made now."
        confirmLabel="Revoke Session"
        onConfirm={handlePasswordReset}
        onCancel={() => setConfirmOpen(null)}
      />
    </div>
  );
}
