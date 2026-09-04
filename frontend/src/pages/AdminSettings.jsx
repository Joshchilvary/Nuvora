import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext.jsx";
import Button from "../components/ui/Button.jsx";
import Badge from "../components/ui/Badge.jsx";
import {
  INITIAL_SETTINGS,
  ADMIN_ACCOUNT,
  SETTINGS_TABS,
} from "../data/adminDashboard.js";

function Switch({ checked, onChange, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-lime/60 focus:ring-offset-2 focus:ring-offset-background ${
        checked ? "bg-lime" : "bg-surface-high"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow duration-200 ease-in-out ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-outline-variant/10 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="font-body-md text-sm text-text-primary">{label}</p>
        {description && (
          <p className="font-body-md text-xs text-text-muted mt-1">{description}</p>
        )}
      </div>
      <Switch checked={checked} onChange={onChange} />
    </div>
  );
}

function ConfirmModal({ open, title, message, confirmLabel, onConfirm, onCancel, danger = false }) {
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
        <p className="font-body-md text-body-md text-text-muted mb-4">{message}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={onConfirm}
            className={danger ? "!bg-red-500 hover:!bg-red-600 text-white" : ""}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, description }) {
  return (
    <div className="mb-6">
      <h2 className="font-h3 text-h3 text-text-primary">{title}</h2>
      {description && (
        <p className="font-body-md text-body-md text-text-muted mt-1">{description}</p>
      )}
    </div>
  );
}

export default function AdminSettings() {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [originalSettings, setOriginalSettings] = useState(INITIAL_SETTINGS);
  const [hasChanges, setHasChanges] = useState(false);
  const [toast, setToast] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [confirmAction, setConfirmAction] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    setHasChanges(JSON.stringify(settings) !== JSON.stringify(originalSettings));
  }, [settings, originalSettings]);

  const update = (path, value) => {
    setSettings((prev) => {
      const next = { ...prev };
      const keys = path.split(".");
      let current = next;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const validate = () => {
    const errors = {};
    if (!settings.general.platformName.trim()) errors.platformName = "Platform name is required";
    if (!settings.general.supportEmail.trim()) {
      errors.supportEmail = "Support email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.general.supportEmail)) {
      errors.supportEmail = "Invalid email format";
    }
    if (settings.security.sessionTimeout < 1) errors.sessionTimeout = "Timeout must be at least 1 minute";
    if (settings.security.maxActiveSessions < 1) errors.maxActiveSessions = "Must allow at least 1 session";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveSettings = () => {
    if (!validate()) return;
    setOriginalSettings(settings);
    setHasChanges(false);
    setValidationErrors({});
    showToast("Settings saved successfully.");
  };

  const discardChanges = () => {
    setSettings(originalSettings);
    setHasChanges(false);
    setValidationErrors({});
    showToast("Changes discarded.");
  };

  const confirmDangerAction = () => {
    if (confirmAction === "disable-marketplace") {
      update("marketplace.status", "Maintenance");
      showToast("Marketplace placed in maintenance mode.");
    } else if (confirmAction === "reset-demo") {
      setSettings(INITIAL_SETTINGS);
      setOriginalSettings(INITIAL_SETTINGS);
      setHasChanges(false);
      showToast("Demo configuration reset to defaults.");
    } else if (confirmAction === "signout-sessions") {
      showToast("All admin sessions have been signed out.");
    }
    setConfirmAction(null);
  };

  const renderGeneral = () => (
    <div className="glass-panel rounded-xl p-6 md:p-8 shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 h-64 w-64 bg-lime/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" aria-hidden="true" />
      <div className="relative z-10">
        <SectionHeader title="General Settings" description="Basic platform configuration and contact information." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-label-sm text-label-sm text-text-primary mb-2">Platform Name</label>
            <input
              type="text"
              value={settings.general.platformName}
              onChange={(e) => update("general.platformName", e.target.value)}
              className={`block w-full rounded-lg bg-surface-container-high border px-4 py-2.5 font-body-md text-text-primary outline-none transition-all focus:border-lime ${
                validationErrors.platformName ? "border-red-400" : "border-outline-variant/30"
              }`}
            />
            {validationErrors.platformName && <p className="mt-1 text-xs text-red-400">{validationErrors.platformName}</p>}
          </div>
          <div>
            <label className="block font-label-sm text-label-sm text-text-primary mb-2">Platform Description</label>
            <input
              type="text"
              value={settings.general.platformDescription}
              onChange={(e) => update("general.platformDescription", e.target.value)}
              className="block w-full rounded-lg bg-surface-container-high border border-outline-variant/30 px-4 py-2.5 font-body-md text-text-primary outline-none transition-all focus:border-lime"
            />
          </div>
          <div>
            <label className="block font-label-sm text-label-sm text-text-primary mb-2">Support Email</label>
            <input
              type="email"
              value={settings.general.supportEmail}
              onChange={(e) => update("general.supportEmail", e.target.value)}
              className={`block w-full rounded-lg bg-surface-container-high border px-4 py-2.5 font-body-md text-text-primary outline-none transition-all focus:border-lime ${
                validationErrors.supportEmail ? "border-red-400" : "border-outline-variant/30"
              }`}
            />
            {validationErrors.supportEmail && <p className="mt-1 text-xs text-red-400">{validationErrors.supportEmail}</p>}
          </div>
          <div>
            <label className="block font-label-sm text-label-sm text-text-primary mb-2">Default Currency</label>
            <select
              value={settings.general.defaultCurrency}
              onChange={(e) => update("general.defaultCurrency", e.target.value)}
              className="block w-full rounded-lg bg-surface-container-high border border-outline-variant/30 px-4 py-2.5 font-body-md text-text-primary outline-none transition-all focus:border-lime"
            >
              <option value="NGN">NGN (₦)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
          <div>
            <label className="block font-label-sm text-label-sm text-text-primary mb-2">Default Language</label>
            <select
              value={settings.general.defaultLanguage}
              onChange={(e) => update("general.defaultLanguage", e.target.value)}
              className="block w-full rounded-lg bg-surface-container-high border border-outline-variant/30 px-4 py-2.5 font-body-md text-text-primary outline-none transition-all focus:border-lime"
            >
              <option value="English">English</option>
              <option value="French">French</option>
              <option value="Spanish">Spanish</option>
              <option value="German">German</option>
            </select>
          </div>
          <div>
            <label className="block font-label-sm text-label-sm text-text-primary mb-2">Time Zone</label>
            <select
              value={settings.general.timeZone}
              onChange={(e) => update("general.timeZone", e.target.value)}
              className="block w-full rounded-lg bg-surface-container-high border border-outline-variant/30 px-4 py-2.5 font-body-md text-text-primary outline-none transition-all focus:border-lime"
            >
              <option value="Africa/Lagos">Africa/Lagos</option>
              <option value="America/New_York">America/New_York</option>
              <option value="Europe/London">Europe/London</option>
              <option value="Asia/Tokyo">Asia/Tokyo</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMarketplace = () => (
    <div className="glass-panel rounded-xl p-6 md:p-8 shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 h-64 w-64 bg-lime/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" aria-hidden="true" />
      <div className="relative z-10">
        <SectionHeader title="Marketplace Settings" description="Control marketplace availability and seller onboarding." />
        <div className="space-y-0">
          <ToggleRow label="Marketplace Status" description="Open allows buying and selling. Maintenance mode restricts access." checked={settings.marketplace.status === "Open"} onChange={(val) => update("marketplace.status", val ? "Open" : "Maintenance")} />
          <ToggleRow label="New Seller Registration" description="Allow new sellers to create accounts and apply to sell." checked={settings.marketplace.newSellerRegistration} onChange={(val) => update("marketplace.newSellerRegistration", val)} />
          <ToggleRow label="Product Approval Required" description="All new products must be reviewed and approved before going live." checked={settings.marketplace.productApprovalRequired} onChange={(val) => update("marketplace.productApprovalRequired", val)} />
          <ToggleRow label="Customer Reviews Enabled" description="Allow customers to leave reviews on products and sellers." checked={settings.marketplace.customerReviewsEnabled} onChange={(val) => update("marketplace.customerReviewsEnabled", val)} />
          <ToggleRow label="Seller Verification Required" description="Sellers must complete identity verification before listing products." checked={settings.marketplace.sellerVerificationRequired} onChange={(val) => update("marketplace.sellerVerificationRequired", val)} />
          <ToggleRow label="Wishlist Enabled" description="Allow customers to save products to a wishlist." checked={settings.marketplace.wishlistEnabled} onChange={(val) => update("marketplace.wishlistEnabled", val)} />
        </div>
      </div>
    </div>
  );

  const renderOrdersPayments = () => (
    <div className="glass-panel rounded-xl p-6 md:p-8 shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 h-64 w-64 bg-lime/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" aria-hidden="true" />
      <div className="relative z-10">
        <SectionHeader title="Orders & Payments" description="Order processing and payment configuration." />
        <div className="space-y-0 mb-8">
          <ToggleRow label="Allow Order Cancellation" description="Customers may cancel orders before they are fulfilled." checked={settings.ordersPayments.allowOrderCancellation} onChange={(val) => update("ordersPayments.allowOrderCancellation", val)} />
          <ToggleRow label="Allow Refund Requests" description="Customers may request refunds for delivered orders." checked={settings.ordersPayments.allowRefundRequests} onChange={(val) => update("ordersPayments.allowRefundRequests", val)} />
          <ToggleRow label="Auto-Confirm Delivered Orders" description="Automatically mark orders as confirmed after delivery." checked={settings.ordersPayments.autoConfirmDeliveredOrders} onChange={(val) => update("ordersPayments.autoConfirmDeliveredOrders", val)} />
          <ToggleRow label="Require Seller Fulfillment Confirmation" description="Sellers must confirm fulfillment before an order is marked complete." checked={settings.ordersPayments.requireSellerFulfillmentConfirmation} onChange={(val) => update("ordersPayments.requireSellerFulfillmentConfirmation", val)} />
        </div>
        <div className="border-t border-outline-variant/20 pt-6">
          <h3 className="font-h4 text-h4 text-text-primary mb-4">Payment Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-lg border border-outline-variant/20 bg-surface-container-high p-4">
              <p className="font-label-sm text-label-sm text-text-muted mb-1">Payment Provider</p>
              <div className="flex items-center gap-2">
                <Badge variant="success">{settings.ordersPayments.paymentProvider}</Badge>
                <span className="font-body-md text-xs text-text-muted">Demo configuration</span>
              </div>
            </div>
            <div className="rounded-lg border border-outline-variant/20 bg-surface-container-high p-4">
              <p className="font-label-sm text-label-sm text-text-muted mb-1">Test Mode</p>
              <div className="flex items-center gap-2">
                <Switch checked={settings.ordersPayments.testMode} onChange={(val) => update("ordersPayments.testMode", val)} />
                <span className="font-body-md text-xs text-text-muted">{settings.ordersPayments.testMode ? "Enabled" : "Disabled"}</span>
              </div>
            </div>
          </div>
          <p className="font-body-md text-xs text-text-muted mt-3">Payment credentials are not stored in the frontend. Backend integration required.</p>
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="glass-panel rounded-xl p-6 md:p-8 shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 h-64 w-64 bg-lime/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" aria-hidden="true" />
      <div className="relative z-10">
        <SectionHeader title="Notification Settings" description="Configure email and in-app notifications for different user roles." />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div>
            <h3 className="font-h4 text-h4 text-text-primary mb-4">Customer Notifications</h3>
            <div className="space-y-0">
              <ToggleRow label="Order Confirmation" checked={settings.notifications.customer.orderConfirmation} onChange={(val) => update("notifications.customer.orderConfirmation", val)} />
              <ToggleRow label="Order Shipped" checked={settings.notifications.customer.orderShipped} onChange={(val) => update("notifications.customer.orderShipped", val)} />
              <ToggleRow label="Order Delivered" checked={settings.notifications.customer.orderDelivered} onChange={(val) => update("notifications.customer.orderDelivered", val)} />
              <ToggleRow label="Refund Updates" checked={settings.notifications.customer.refundUpdates} onChange={(val) => update("notifications.customer.refundUpdates", val)} />
              <ToggleRow label="Review Reminders" checked={settings.notifications.customer.reviewReminders} onChange={(val) => update("notifications.customer.reviewReminders", val)} />
            </div>
          </div>
          <div>
            <h3 className="font-h4 text-h4 text-text-primary mb-4">Seller Notifications</h3>
            <div className="space-y-0">
              <ToggleRow label="New Order" checked={settings.notifications.seller.newOrder} onChange={(val) => update("notifications.seller.newOrder", val)} />
              <ToggleRow label="Product Approval" checked={settings.notifications.seller.productApproval} onChange={(val) => update("notifications.seller.productApproval", val)} />
              <ToggleRow label="Product Rejection" checked={settings.notifications.seller.productRejection} onChange={(val) => update("notifications.seller.productRejection", val)} />
              <ToggleRow label="Seller Application Status" checked={settings.notifications.seller.sellerApplicationStatus} onChange={(val) => update("notifications.seller.sellerApplicationStatus", val)} />
              <ToggleRow label="Payout Notification" checked={settings.notifications.seller.payoutNotification} onChange={(val) => update("notifications.seller.payoutNotification", val)} />
            </div>
          </div>
          <div>
            <h3 className="font-h4 text-h4 text-text-primary mb-4">Admin Notifications</h3>
            <div className="space-y-0">
              <ToggleRow label="Security Alerts" checked={settings.notifications.admin.securityAlerts} onChange={(val) => update("notifications.admin.securityAlerts", val)} />
              <ToggleRow label="Failed Admin Login" checked={settings.notifications.admin.failedAdminLogin} onChange={(val) => update("notifications.admin.failedAdminLogin", val)} />
              <ToggleRow label="Seller Applications" checked={settings.notifications.admin.sellerApplications} onChange={(val) => update("notifications.admin.sellerApplications", val)} />
              <ToggleRow label="Reported Products" checked={settings.notifications.admin.reportedProducts} onChange={(val) => update("notifications.admin.reportedProducts", val)} />
              <ToggleRow label="Reported Reviews" checked={settings.notifications.admin.reportedReviews} onChange={(val) => update("notifications.admin.reportedReviews", val)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderModeration = () => (
    <div className="glass-panel rounded-xl p-6 md:p-8 shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 h-64 w-64 bg-lime/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" aria-hidden="true" />
      <div className="relative z-10">
        <SectionHeader title="Moderation Settings" description="Content and listing moderation controls for the marketplace." />
        <div className="space-y-0">
          <ToggleRow label="Require Product Approval" description="All products must be reviewed before appearing on the marketplace." checked={settings.moderation.requireProductApproval} onChange={(val) => update("moderation.requireProductApproval", val)} />
          <ToggleRow label="Automatically Flag Reported Products" description="Products with multiple reports are automatically hidden pending review." checked={settings.moderation.autoFlagReportedProducts} onChange={(val) => update("moderation.autoFlagReportedProducts", val)} />
          <ToggleRow label="Automatically Flag Reported Reviews" description="Reviews with multiple reports are automatically removed pending review." checked={settings.moderation.autoFlagReportedReviews} onChange={(val) => update("moderation.autoFlagReportedReviews", val)} />
          <ToggleRow label="Allow Seller Response to Reviews" description="Sellers may publicly respond to customer reviews." checked={settings.moderation.allowSellerResponseToReviews} onChange={(val) => update("moderation.allowSellerResponseToReviews", val)} />
          <ToggleRow label="Require Review Verification" description="Only verified purchasers may leave reviews." checked={settings.moderation.requireReviewVerification} onChange={(val) => update("moderation.requireReviewVerification", val)} />
          <ToggleRow label="Enable Marketplace Content Reporting" description="Allow users to report products, reviews, and sellers." checked={settings.moderation.enableContentReporting} onChange={(val) => update("moderation.enableContentReporting", val)} />
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="glass-panel rounded-xl p-6 md:p-8 shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 h-64 w-64 bg-lime/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" aria-hidden="true" />
      <div className="relative z-10">
        <SectionHeader title="Security Settings" description="Platform security and authentication configuration. Backend enforcement required for all controls." />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="font-h4 text-h4 text-text-primary mb-4">Authentication</h3>
            <div className="space-y-0">
              <ToggleRow label="Require Email Verification" checked={settings.security.requireEmailVerification} onChange={(val) => update("security.requireEmailVerification", val)} />
              <ToggleRow label="Require Phone Verification" checked={settings.security.requirePhoneVerification} onChange={(val) => update("security.requirePhoneVerification", val)} />
              <ToggleRow label="Enable MFA for Administrators" checked={settings.security.enableMfaForAdmins} onChange={(val) => update("security.enableMfaForAdmins", val)} />
              <ToggleRow label="Enforce Strong Passwords" checked={settings.security.enforceStrongPasswords} onChange={(val) => update("security.enforceStrongPasswords", val)} />
              <ToggleRow label="Account Lockout After Failures" checked={settings.security.accountLockoutAfterFailures} onChange={(val) => update("security.accountLockoutAfterFailures", val)} />
            </div>
          </div>
          <div>
            <h3 className="font-h4 text-h4 text-text-primary mb-4">Session Security</h3>
            <div className="space-y-0">
              <div className="py-4 border-b border-outline-variant/10">
                <p className="font-body-md text-sm text-text-primary mb-2">Session Timeout (minutes)</p>
                <input
                  type="number"
                  min="1"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => update("security.sessionTimeout", parseInt(e.target.value) || 0)}
                  className={`block w-full rounded-lg bg-surface-container-high border px-4 py-2.5 font-body-md text-text-primary outline-none transition-all focus:border-lime ${
                    validationErrors.sessionTimeout ? "border-red-400" : "border-outline-variant/30"
                  }`}
                />
                {validationErrors.sessionTimeout && <p className="mt-1 text-xs text-red-400">{validationErrors.sessionTimeout}</p>}
              </div>
              <div className="py-4 border-b border-outline-variant/10">
                <p className="font-body-md text-sm text-text-primary mb-2">Maximum Active Sessions</p>
                <input
                  type="number"
                  min="1"
                  value={settings.security.maxActiveSessions}
                  onChange={(e) => update("security.maxActiveSessions", parseInt(e.target.value) || 0)}
                  className={`block w-full rounded-lg bg-surface-container-high border px-4 py-2.5 font-body-md text-text-primary outline-none transition-all focus:border-lime ${
                    validationErrors.maxActiveSessions ? "border-red-400" : "border-outline-variant/30"
                  }`}
                />
                {validationErrors.maxActiveSessions && <p className="mt-1 text-xs text-red-400">{validationErrors.maxActiveSessions}</p>}
              </div>
              <ToggleRow label="Revoke Sessions on Password Change" checked={settings.security.revokeSessionsOnPasswordChange} onChange={(val) => update("security.revokeSessionsOnPasswordChange", val)} />
            </div>
          </div>
          <div>
            <h3 className="font-h4 text-h4 text-text-primary mb-4">API Security</h3>
            <div className="space-y-0">
              <ToggleRow label="Rate Limiting" description="Limit API requests per client." checked={settings.security.rateLimiting} onChange={(val) => update("security.rateLimiting", val)} />
              <ToggleRow label="API Authentication" description="Require authentication tokens for API access." checked={settings.security.apiAuthentication} onChange={(val) => update("security.apiAuthentication", val)} />
              <ToggleRow label="Request Monitoring" description="Log and monitor incoming API requests." checked={settings.security.requestMonitoring} onChange={(val) => update("security.requestMonitoring", val)} />
            </div>
          </div>
          <div>
            <h3 className="font-h4 text-h4 text-text-primary mb-4">Security Monitoring</h3>
            <div className="space-y-0">
              <ToggleRow label="Security Alerts" description="Send alerts for critical security events." checked={settings.security.securityAlerts} onChange={(val) => update("security.securityAlerts", val)} />
              <ToggleRow label="Suspicious Activity Detection" description="Detect and flag unusual account behavior." checked={settings.security.suspiciousActivityDetection} onChange={(val) => update("security.suspiciousActivityDetection", val)} />
              <ToggleRow label="Audit Logging" description="Record administrative and security actions for compliance." checked={settings.security.auditLogging} onChange={(val) => update("security.auditLogging", val)} />
            </div>
          </div>
        </div>
        <div className="mt-6 rounded-lg border border-lime/20 bg-lime/5 p-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols text-accent text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
              info
            </span>
            <p className="font-body-md text-sm text-text-primary">
              Backend enforcement required — these settings are managed in the frontend for demonstration only. The Django backend will enforce security policies server-side.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppearance = () => (
    <div className="glass-panel rounded-xl p-6 md:p-8 shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 h-64 w-64 bg-lime/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" aria-hidden="true" />
      <div className="relative z-10">
        <SectionHeader title="Appearance" description="Interface preferences and display configuration." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-h4 text-h4 text-text-primary mb-4">Theme</h3>
            <div className="flex flex-wrap gap-3">
              {["system", "light", "dark"].map((t) => {
                const active = (t === "system" ? "dark" : t) === theme;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      const next = t === "system" ? "dark" : t;
                      setTheme(next);
                      update("appearance.theme", t);
                    }}
                    className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 font-label-sm text-label-sm transition-all ${
                      active ? "border-lime bg-lime/10 text-accent" : "border-outline-variant/30 text-text-muted hover:text-text-primary hover:bg-surface-high"
                    }`}
                  >
                    <span className="material-symbols text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>
                      {t === "light" ? "light_mode" : t === "dark" ? "dark_mode" : "computer"}
                    </span>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <h3 className="font-h4 text-h4 text-text-primary mb-4">Interface Density</h3>
            <div className="flex flex-wrap gap-3">
              {["comfortable", "compact"].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    update("appearance.interfaceDensity", d);
                  }}
                  className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 font-label-sm text-label-sm transition-all ${
                    settings.appearance.interfaceDensity === d
                      ? "border-lime bg-lime/10 text-accent"
                      : "border-outline-variant/30 text-text-muted hover:text-text-primary hover:bg-surface-high"
                  }`}
                >
                  <span className="material-symbols text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>
                    {d === "comfortable" ? "zoom_out_map" : "zoom_in"}
                  </span>
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
            <p className="font-body-md text-xs text-text-muted mt-2">
              Interface density is a local preference only. Backend integration required for persistence.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdminAccount = () => (
    <div className="glass-panel rounded-xl p-6 md:p-8 shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 h-64 w-64 bg-lime/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" aria-hidden="true" />
      <div className="relative z-10">
        <SectionHeader title="Admin Account" description="Your administrator profile and session information." />
        <div className="flex flex-col sm:flex-row gap-6 mb-8">
          <div className="shrink-0">
            <div className="h-20 w-20 rounded-full overflow-hidden border border-outline-variant/30">
              <img src={ADMIN_ACCOUNT.avatar} alt="Admin" className="h-full w-full object-cover" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="font-label-sm text-label-sm text-text-muted">Name</p>
                <p className="font-body-md text-sm text-text-primary">{ADMIN_ACCOUNT.name}</p>
              </div>
              <div>
                <p className="font-label-sm text-label-sm text-text-muted">Email</p>
                <p className="font-body-md text-sm text-text-primary">{ADMIN_ACCOUNT.email}</p>
              </div>
              <div>
                <p className="font-label-sm text-label-sm text-text-muted">Role</p>
                <p className="font-body-md text-sm text-text-primary">{ADMIN_ACCOUNT.role}</p>
              </div>
              <div>
                <p className="font-label-sm text-label-sm text-text-muted">Account Status</p>
                <Badge variant="success">{ADMIN_ACCOUNT.status}</Badge>
              </div>
              <div>
                <p className="font-label-sm text-label-sm text-text-muted">Last Login</p>
                <p className="font-body-md text-sm text-text-primary">{ADMIN_ACCOUNT.lastLogin}</p>
              </div>
              <div>
                <p className="font-label-sm text-label-sm text-text-muted">MFA Status</p>
                <Badge variant={ADMIN_ACCOUNT.mfaEnabled ? "success" : "default"}>
                  {ADMIN_ACCOUNT.mfaEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-outline-variant/20 pt-6">
          <h3 className="font-h4 text-h4 text-text-primary mb-4">Account Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="outline" onClick={() => showToast("Profile editor would open here.")}>Edit Profile</Button>
            <Button type="button" variant="outline" onClick={() => showToast("Password change flow would open here.")}>Change Password</Button>
            <Button type="button" variant="outline" onClick={() => showToast("MFA management would open here.")}>Manage MFA</Button>
            <Button type="button" variant="ghost" onClick={() => showToast("You have been signed out.")}>Sign Out</Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDangerZone = () => (
    <div className="glass-panel rounded-xl p-6 md:p-8 shadow-lg relative overflow-hidden border-red-400/20">
      <div className="absolute top-0 right-0 h-64 w-64 bg-red-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" aria-hidden="true" />
      <div className="relative z-10">
        <SectionHeader title="Danger Zone" description="Irreversible and potentially disruptive actions. Proceed with caution." />
        <div className="space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-outline-variant/10">
            <div>
              <p className="font-body-md text-sm text-text-primary">Disable Marketplace</p>
              <p className="font-body-md text-xs text-text-muted mt-1">Put the marketplace into maintenance mode. Buyers and sellers will be unable to access the platform.</p>
            </div>
            <Button type="button" variant="outline" className="!border-red-400/40 !text-red-400 hover:!bg-red-400/10" onClick={() => setConfirmAction("disable-marketplace")}>Disable Marketplace</Button>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-outline-variant/10">
            <div>
              <p className="font-body-md text-sm text-text-primary">Reset Demo Configuration</p>
              <p className="font-body-md text-xs text-text-muted mt-1">Reset all settings to their default demo values. This cannot be undone.</p>
            </div>
            <Button type="button" variant="outline" className="!border-red-400/40 !text-red-400 hover:!bg-red-400/10" onClick={() => setConfirmAction("reset-demo")}>Reset Demo</Button>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4">
            <div>
              <p className="font-body-md text-sm text-text-primary">Sign Out All Admin Sessions</p>
              <p className="font-body-md text-xs text-text-muted mt-1">Revoke every active admin session. All administrators will need to log in again.</p>
            </div>
            <Button type="button" variant="outline" className="!border-red-400/40 !text-red-400 hover:!bg-red-400/10" onClick={() => setConfirmAction("signout-sessions")}>Sign Out All Sessions</Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "general": return renderGeneral();
      case "marketplace": return renderMarketplace();
      case "orders-payments": return renderOrdersPayments();
      case "notifications": return renderNotifications();
      case "moderation": return renderModeration();
      case "security": return renderSecurity();
      case "appearance": return renderAppearance();
      case "admin-account": return renderAdminAccount();
      default: return renderGeneral();
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      {toast && (
        <div className="mb-6 rounded-lg border border-lime/30 bg-lime/5 p-4 flex items-center gap-3 animate-fade-rise">
          <span className="material-symbols text-accent" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
          <p className="text-sm text-text-primary">{toast}</p>
        </div>
      )}

      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-h2 text-text-primary">Admin Settings</h1>
          <p className="font-body-md text-body-md text-text-muted mt-1">Manage platform configuration, administrative preferences, and operational controls.</p>
          <p className="font-body-md text-xs text-text-muted mt-1">Current configuration is managed in the frontend for demonstration. Backend integration required for persistence.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={discardChanges} disabled={!hasChanges}>Discard</Button>
          <Button type="button" onClick={saveSettings} disabled={!hasChanges}>Save Changes</Button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {SETTINGS_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 font-label-sm text-label-sm transition-all ${
                activeTab === tab.id
                  ? "bg-lime text-obsidian"
                  : "border border-outline-variant/30 text-text-muted hover:text-text-primary hover:bg-surface-high"
              }`}
            >
              <span className="material-symbols text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {hasChanges && (
        <div className="mb-6 rounded-lg border border-lime/30 bg-lime/5 p-4 flex items-center gap-3">
          <span className="material-symbols text-accent" style={{ fontVariationSettings: "'FILL' 1" }}>
            edit
          </span>
          <p className="text-sm text-text-primary">You have unsaved changes.</p>
          <div className="ml-auto flex gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={discardChanges}>Discard</Button>
            <Button type="button" size="sm" onClick={saveSettings}>Save Changes</Button>
          </div>
        </div>
      )}

      {renderContent()}

      <div className="mt-8">
        {renderDangerZone()}
      </div>

      <ConfirmModal
        open={!!confirmAction}
        title={
          confirmAction === "disable-marketplace"
            ? "Disable marketplace?"
            : confirmAction === "reset-demo"
            ? "Reset demo configuration?"
            : "Sign out all admin sessions?"
        }
        message={
          confirmAction === "disable-marketplace"
            ? "This will place the marketplace into maintenance mode. Buyers and sellers will be unable to access the platform until re-enabled."
            : confirmAction === "reset-demo"
            ? "This will reset all settings to their default demo values. This cannot be undone."
            : "This will revoke every active admin session. All administrators will need to log in again."
        }
        confirmLabel={
          confirmAction === "disable-marketplace"
            ? "Disable Marketplace"
            : confirmAction === "reset-demo"
            ? "Reset Demo"
            : "Sign Out All Sessions"
        }
        onConfirm={confirmDangerAction}
        onCancel={() => setConfirmAction(null)}
        danger={!!confirmAction}
      />
    </div>
  );
}
