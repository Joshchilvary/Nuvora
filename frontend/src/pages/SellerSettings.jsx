import React, { useState } from "react";
import { Link } from "react-router-dom";
import { INITIAL_SETTINGS } from "../data/sellerSettings.js";
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

function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="font-label-sm text-label-sm text-text-primary">{label}</p>
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
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
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

export default function SellerSettings() {
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [dangerAction, setDangerAction] = useState(null);

  const updateProfile = (field, value) => {
    setDirty(true);
    setSaved(false);
    setSettings((prev) => ({ ...prev, profile: { ...prev.profile, [field]: value } }));
  };

  const updateStorePref = (field, value) => {
    setDirty(true);
    setSaved(false);
    setSettings((prev) => ({ ...prev, storePreferences: { ...prev.storePreferences, [field]: value } }));
  };

  const updateNotifPref = (field, value) => {
    setDirty(true);
    setSaved(false);
    setSettings((prev) => ({ ...prev, notificationPreferences: { ...prev.notificationPreferences, [field]: value } }));
  };

  const handleSaveProfile = () => {
    setSaved(true);
    setDirty(false);
  };

  const handleCancelProfile = () => {
    setSettings((prev) => ({ ...prev, profile: { ...INITIAL_SETTINGS.profile } }));
    setDirty(false);
    setSaved(false);
  };

  const handleDangerConfirm = () => {
    setDangerAction(null);
    setSaved(true);
    setDirty(false);
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Page Header */}
      <div className="mb-8">
        <Link
          to="/seller"
          className="inline-flex items-center gap-2 text-text-muted hover:text-accent transition-colors mb-4"
        >
          <span className="material-symbols text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>
            arrow_back
          </span>
          <span className="font-label-sm text-label-sm">Back to Dashboard</span>
        </Link>
        <h1 className="font-display text-h2 text-text-primary">Settings</h1>
        <p className="font-body-md text-body-md text-text-muted mt-1">
          Manage your seller account, store preferences, notifications, and security.
        </p>
      </div>

      {saved ? (
        <div className="mb-6 rounded-lg border border-lime/30 bg-lime/5 p-4 flex items-center gap-3">
          <span className="material-symbols text-accent" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
          <p className="text-sm text-text-primary">Settings saved locally. Backend persistence is not yet connected.</p>
        </div>
      ) : null}

      <div className="space-y-6">
        {/* Account */}
        <Section title="Account" description="Your personal seller account information.">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 shrink-0 rounded-full overflow-hidden border border-outline-variant/30">
              <img src={settings.profile.avatar} alt="Profile" className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="font-label-sm text-label-sm text-text-primary">{settings.profile.fullName}</p>
              <p className="text-xs text-text-muted">{settings.profile.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Full Name" htmlFor="settings-name" required>
              <input
                id="settings-name"
                type="text"
                value={settings.profile.fullName}
                onChange={(e) => updateProfile("fullName", e.target.value)}
                className={inputClass()}
              />
            </Field>
            <Field label="Email" htmlFor="settings-email" required>
              <input
                id="settings-email"
                type="email"
                value={settings.profile.email}
                onChange={(e) => updateProfile("email", e.target.value)}
                className={inputClass()}
              />
            </Field>
            <Field label="Phone" htmlFor="settings-phone" required>
              <input
                id="settings-phone"
                type="tel"
                value={settings.profile.phone}
                onChange={(e) => updateProfile("phone", e.target.value)}
                className={inputClass()}
              />
            </Field>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button type="button" onClick={handleSaveProfile} disabled={!dirty}>
              <span className="material-symbols text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>save</span>
              Save Changes
            </Button>
            <Button type="button" variant="outline" onClick={handleCancelProfile} disabled={!dirty}>
              Cancel
            </Button>
          </div>
        </Section>

        {/* Store Preferences */}
        <Section title="Store Preferences" description="Quick access to your store configuration.">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-label-sm text-label-sm text-text-primary">Store Status</p>
                <p className="text-xs text-text-muted mt-0.5">
                  {settings.storePreferences.status === "active"
                    ? "Customers can discover and purchase from your store."
                    : "Your storefront is temporarily hidden."}
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                  settings.storePreferences.status === "active"
                    ? "bg-lime/10 text-accent border-lime/30"
                    : "bg-amber-400/10 text-amber-400 border-amber-400/30"
                }`}
              >
                {settings.storePreferences.status === "active" ? "Active" : "Paused"}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-label-sm text-label-sm text-text-muted">Store Name</p>
                <p className="font-body-md text-body-md text-text-primary">{settings.storePreferences.name}</p>
              </div>
              <div>
                <p className="font-label-sm text-label-sm text-text-muted">Category</p>
                <p className="font-body-md text-body-md text-text-primary">{settings.storePreferences.category}</p>
              </div>
            </div>
            <Link
              to="/seller/store"
              className="inline-flex items-center gap-1 text-sm text-accent hover:underline font-semibold"
            >
              Manage Store
              <span className="material-symbols text-[16px]" style={{ fontVariationSettings: "'FILL' 0" }}>
                arrow_forward
              </span>
            </Link>
          </div>
        </Section>

        {/* Payout Preferences */}
        <Section title="Payout Preferences" description="How you receive your earnings.">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-label-sm text-label-sm text-text-muted">Method</p>
                <p className="font-body-md text-body-md text-text-primary">{settings.payoutPreferences.method}</p>
              </div>
              <div>
                <p className="font-label-sm text-label-sm text-text-muted">Account</p>
                <p className="font-body-md text-body-md text-text-primary font-mono">{settings.payoutPreferences.accountNumber}</p>
              </div>
            </div>
            <Link
              to="/seller/payouts"
              className="inline-flex items-center gap-1 text-sm text-accent hover:underline font-semibold"
            >
              Manage Payouts
              <span className="material-symbols text-[16px]" style={{ fontVariationSettings: "'FILL' 0" }}>
                arrow_forward
              </span>
            </Link>
          </div>
        </Section>

        {/* Notification Preferences */}
        <Section title="Notification Preferences" description="Choose which notifications you receive.">
          <div className="divide-y divide-outline-variant/10">
            <Toggle
              checked={settings.notificationPreferences.newOrders}
              onChange={(v) => updateNotifPref("newOrders", v)}
              label="New Orders"
              description="Receive notifications when customers place new orders."
            />
            <Toggle
              checked={settings.notificationPreferences.lowStock}
              onChange={(v) => updateNotifPref("lowStock", v)}
              label="Low Stock Alerts"
              description="Get alerted when products are running low."
            />
            <Toggle
              checked={settings.notificationPreferences.payoutUpdates}
              onChange={(v) => updateNotifPref("payoutUpdates", v)}
              label="Payout Updates"
              description="Notifications about your payouts and earnings."
            />
            <Toggle
              checked={settings.notificationPreferences.productUpdates}
              onChange={(v) => updateNotifPref("productUpdates", v)}
              label="Product Updates"
              description="Updates about your listed products."
            />
            <Toggle
              checked={settings.notificationPreferences.securityAlerts}
              onChange={(v) => updateNotifPref("securityAlerts", v)}
              label="Security Alerts"
              description="Important security notifications."
            />
            <Toggle
              checked={settings.notificationPreferences.nuvoraAnnouncements}
              onChange={(v) => updateNotifPref("nuvoraAnnouncements", v)}
              label="NUVORA Announcements"
              description="News and updates from NUVORA."
            />
          </div>
        </Section>

        {/* Security */}
        <Section title="Security" description="Protect your seller account.">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-label-sm text-label-sm text-text-primary">Password</p>
                <p className="text-xs text-text-muted mt-0.5">
                  Last changed: {new Date(settings.security.passwordLastChanged + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
              <Link to="/forgot-password">
                <Button type="button" variant="outline" size="sm">Change Password</Button>
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-label-sm text-label-sm text-text-primary">Two-Factor Authentication</p>
                <p className="text-xs text-text-muted mt-0.5">
                  {settings.security.twoFactorEnabled ? "Enabled" : "Add another layer of protection to your seller account."}
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                  settings.security.twoFactorEnabled
                    ? "bg-lime/10 text-accent border-lime/30"
                    : "bg-surface-high text-text-muted border-outline-variant/30"
                }`}
              >
                {settings.security.twoFactorEnabled ? "Enabled" : "Not enabled"}
              </span>
            </div>
            <div>
              <p className="font-label-sm text-label-sm text-text-primary mb-3">Active Sessions</p>
              <div className="space-y-3">
                {settings.security.sessions.map((session, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg border border-outline-variant/20 bg-surface-container-low p-3">
                    <div>
                      <p className="font-body-md text-body-md text-text-primary">{session.device}</p>
                      <p className="text-xs text-text-muted">{session.location} · {session.lastActive}</p>
                    </div>
                    {session.current ? (
                      <span className="text-xs text-accent font-semibold">Current</span>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* Account Status */}
        <Section title="Seller Account Status" description="Your current standing on NUVORA.">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-label-sm text-label-sm text-text-primary">Status</p>
                <p className="text-xs text-text-muted mt-0.5">Your seller account is currently active and verified.</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full border border-lime/30 bg-lime/10 px-2.5 py-1 text-xs font-semibold text-accent">
                <span className="material-symbols text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                Verified
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-label-sm text-label-sm text-text-muted">Member Since</p>
                <p className="font-body-md text-body-md text-text-primary">
                  {new Date(settings.accountStatus.memberSince + "T00:00:00").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </p>
              </div>
              <div>
                <p className="font-label-sm text-label-sm text-text-muted">Tier</p>
                <p className="font-body-md text-body-md text-text-primary">{settings.accountStatus.tier}</p>
              </div>
            </div>
          </div>
        </Section>

        {/* Danger Zone */}
        <section className="rounded-xl border border-red-400/30 bg-red-400/5 p-6 md:p-8">
          <h2 className="font-h3 text-h3 text-red-400 mb-2">Danger Zone</h2>
          <p className="font-body-md text-body-md text-text-muted mb-6">
            These actions are irreversible. Proceed with caution.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDangerAction("pause")}
            >
              <span className="material-symbols text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>pause</span>
              Pause Store
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDangerAction("close")}
            >
              <span className="material-symbols text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>cancel</span>
              Request Account Closure
            </Button>
          </div>
        </section>
      </div>

      {/* Danger Zone Modal */}
      <ConfirmModal
        open={!!dangerAction}
        title={dangerAction === "pause" ? "Pause Store" : "Request Account Closure"}
        message={
          dangerAction === "pause"
            ? "This is a prototype action. In production, pausing your store will hide it from new customers. No real changes will be made now."
            : "This is a prototype action. In production, this will begin the account closure process. No real changes will be made now."
        }
        confirmLabel={dangerAction === "pause" ? "Pause Store" : "Request Closure"}
        onConfirm={handleDangerConfirm}
        onCancel={() => setDangerAction(null)}
      />
    </div>
  );
}
