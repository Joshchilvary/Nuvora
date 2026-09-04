import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { CUSTOMER_PROFILE } from "../data/customerDashboard.js";
import { MOCK_ADDRESSES, ACCOUNT_INFO } from "../data/customerProfile.js";
import Button from "../components/ui/Button.jsx";

const GENDER_OPTIONS = [
  { value: "", label: "Prefer not to say" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non-binary", label: "Non-binary" },
  { value: "other", label: "Other" },
];

function Section({ title, description, children, className = "" }) {
  return (
    <section
      className={`glass-panel rounded-xl p-6 md:p-8 shadow-lg relative overflow-hidden ${className}`}
    >
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

function inputClass(extra = "") {
  return `block w-full rounded-lg bg-surface-container-high border border-outline-variant/30 px-4 py-3 font-body-md text-text-primary outline-none transition-all placeholder:text-text-muted/60 focus:border-lime disabled:opacity-60 disabled:cursor-not-allowed ${extra}`;
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

function AddressModal({ open, address, onSave, onCancel }) {
  const [form, setForm] = useState({
    fullName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    region: "",
    postalCode: "",
    country: "United States",
    phone: "",
    isDefault: false,
  });

  useEffect(() => {
    if (address) {
      setForm({
        fullName: address.fullName || "",
        addressLine1: address.addressLine1 || "",
        addressLine2: address.addressLine2 || "",
        city: address.city || "",
        region: address.region || "",
        postalCode: address.postalCode || "",
        country: address.country || "United States",
        phone: address.phone || "",
        isDefault: address.isDefault || false,
      });
    } else {
      setForm({
        fullName: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        region: "",
        postalCode: "",
        country: "United States",
        phone: "",
        isDefault: false,
      });
    }
  }, [address, open]);

  const update = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      id: address?.id || `addr-${Date.now()}`,
      label: address?.label || "Custom",
    });
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={address ? "Edit Address" : "Add New Address"}
    >
      <div className="absolute inset-0 bg-obsidian/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-lg rounded-xl border border-outline-variant/20 bg-surface-container p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="font-h4 text-h4 text-text-primary mb-6">
          {address ? "Edit Address" : "Add New Address"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Full Name" htmlFor="addr-name" required>
              <input
                id="addr-name"
                type="text"
                value={form.fullName}
                onChange={update("fullName")}
                className={inputClass()}
                required
              />
            </Field>
            <Field label="Phone" htmlFor="addr-phone" required>
              <input
                id="addr-phone"
                type="tel"
                value={form.phone}
                onChange={update("phone")}
                className={inputClass()}
                required
              />
            </Field>
          </div>
          <Field label="Address Line 1" htmlFor="addr-line1" required>
            <input
              id="addr-line1"
              type="text"
              value={form.addressLine1}
              onChange={update("addressLine1")}
              className={inputClass()}
              required
            />
          </Field>
          <Field label="Address Line 2" htmlFor="addr-line2">
            <input
              id="addr-line2"
              type="text"
              value={form.addressLine2}
              onChange={update("addressLine2")}
              className={inputClass()}
            />
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="City" htmlFor="addr-city" required>
              <input
                id="addr-city"
                type="text"
                value={form.city}
                onChange={update("city")}
                className={inputClass()}
                required
              />
            </Field>
            <Field label="Region" htmlFor="addr-region" required>
              <input
                id="addr-region"
                type="text"
                value={form.region}
                onChange={update("region")}
                className={inputClass()}
                required
              />
            </Field>
            <Field label="Postal Code" htmlFor="addr-postal" required>
              <input
                id="addr-postal"
                type="text"
                value={form.postalCode}
                onChange={update("postalCode")}
                className={inputClass()}
                required
              />
            </Field>
          </div>
          <Field label="Country" htmlFor="addr-country">
            <input
              id="addr-country"
              type="text"
              value={form.country}
              onChange={update("country")}
              className={inputClass()}
            />
          </Field>
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              role="switch"
              aria-checked={form.isDefault}
              onClick={() => setForm((prev) => ({ ...prev, isDefault: !prev.isDefault }))}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                form.isDefault ? "bg-lime" : "bg-surface-highest"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  form.isDefault ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className="font-label-sm text-label-sm text-text-primary">Set as default address</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Save Address</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CustomerProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState({
    firstName: user?.firstName?.split(" ")[0] || CUSTOMER_PROFILE.name.split(" ")[0],
    lastName: user?.lastName || CUSTOMER_PROFILE.name.split(" ").slice(1).join(" "),
    email: user?.email || "",
    phone: user?.phoneNumber || "",
    dob: "1990-05-15",
    gender: "male",
  });
  const [editing, setEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [addresses, setAddresses] = useState(MOCK_ADDRESSES);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState(null);

  const displayName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : CUSTOMER_PROFILE.name;
  const avatar = avatarPreview || user?.profilePicture || CUSTOMER_PROFILE.avatar;
  const isVerified = user?.isVerified ?? false;

  const handleSaveProfile = () => {
    setEditing(false);
    setSaved(true);
    showToast("Profile updated successfully.");
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCancelEdit = () => {
    setProfile({
      firstName: CUSTOMER_ACCOUNT.fullName.split(" ")[0],
      lastName: CUSTOMER_ACCOUNT.fullName.split(" ").slice(1).join(" "),
      email: CUSTOMER_ACCOUNT.email,
      phone: CUSTOMER_ACCOUNT.phone,
      dob: "1990-05-15",
      gender: "male",
    });
    setEditing(false);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
      showToast("Profile photo updated. Save changes to persist.");
    }
  };

  const handleRemovePhoto = () => {
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    showToast("Profile photo removed.");
  };

  const handleAddAddress = (address) => {
    if (editingAddress) {
      setAddresses((prev) =>
        prev.map((a) =>
          a.id === editingAddress.id
            ? { ...address, isDefault: address.isDefault }
            : address.isDefault
            ? { ...a, isDefault: false }
            : a
        )
      );
      showToast("Address updated successfully.");
    } else {
      setAddresses((prev) => {
        const next = address.isDefault ? prev.map((a) => ({ ...a, isDefault: false })) : prev;
        return [...next, address];
      });
      showToast("Address added successfully.");
    }
    setAddressModalOpen(false);
    setEditingAddress(null);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setAddressModalOpen(true);
  };

  const handleDeleteAddress = () => {
    if (deleteConfirm) {
      setAddresses((prev) => prev.filter((a) => a.id !== deleteConfirm.id));
      setDeleteConfirm(null);
      showToast("Address deleted.");
    }
  };

  const handleSetDefault = (id) => {
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, isDefault: a.id === id }))
    );
    showToast("Default address updated.");
  };

  const currentAvatar = avatarPreview || user?.profilePicture || CUSTOMER_PROFILE.avatar;

  return (
    <div className="flex flex-col min-h-full">
      {/* Toast */}
      {toast && (
        <div className="mb-6 rounded-lg border border-lime/30 bg-lime/5 p-4 flex items-center gap-3 animate-fade-rise">
          <span className="material-symbols text-accent" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
          <p className="text-sm text-text-primary">{toast}</p>
        </div>
      )}

      {/* Save Feedback */}
      {saved && (
        <div className="mb-6 rounded-lg border border-lime/30 bg-lime/5 p-4 flex items-center gap-3">
          <span className="material-symbols text-accent" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
          <p className="text-sm text-text-primary">
            Profile saved locally. Backend persistence is not yet connected.
          </p>
        </div>
      )}

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
            <h1 className="font-display text-h2 text-text-primary">My Profile</h1>
            <p className="font-body-md text-body-md text-text-muted mt-1">
              Manage your personal information and account details.
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
          <li className="text-text-primary font-medium">Profile</li>
        </ol>
      </nav>

      <div className="space-y-6">
        {/* Profile Overview */}
        <Section title="Profile Overview">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="shrink-0">
              <div className="relative h-24 w-24 md:h-32 md:w-32 rounded-full overflow-hidden border-2 border-lime/30 shadow-[0_0_20px_rgba(184,243,74,0.15)]">
                 <img
                   src={currentAvatar}
                   alt={displayName}
                   className="h-full w-full object-cover"
                 />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="font-h4 text-h4 text-text-primary">{displayName}</h3>
                  <p className="font-body-md text-body-md text-text-muted mt-1">
                    {profile.email}
                  </p>
                  <p className="font-body-md text-body-md text-text-muted">
                    {profile.phone}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {isVerified ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-lime/30 bg-lime/10 px-2.5 py-1 text-xs font-semibold text-accent">
                        <span
                          className="material-symbols text-xs"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          verified_user
                        </span>
                        Verified Account
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-outline-variant/30 bg-surface-high px-2.5 py-1 text-xs font-semibold text-text-muted">
                        Unverified
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 rounded-full border border-outline-variant/20 bg-surface-high px-2.5 py-1 text-xs font-semibold text-text-muted">
                      <span
                        className="material-symbols text-xs"
                        style={{ fontVariationSettings: "'FILL' 0" }}
                      >
                        calendar_today
                      </span>
                      Member since {ACCOUNT_INFO.memberSince}
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const el = document.getElementById("personal-info");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <span
                    className="material-symbols text-sm"
                    style={{ fontVariationSettings: "'FILL' 0" }}
                  >
                    edit
                  </span>
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>
        </Section>

        {/* Profile Picture */}
        <Section title="Profile Picture" description="Update your profile photo.">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative h-28 w-28 shrink-0 rounded-full overflow-hidden border-2 border-outline-variant/30 shadow-lg">
                 <img
                   src={currentAvatar}
                   alt={displayName}
                   className="h-full w-full object-cover"
                 />
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                <span
                  className="material-symbols text-sm"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  photo_camera
                </span>
                Change Photo
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={handleRemovePhoto}
                disabled={!avatarPreview}
              >
                <span
                  className="material-symbols text-sm"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  delete
                </span>
                Remove Photo
              </Button>
            </div>
          </div>
        </Section>

        {/* Personal Information */}
        <Section id="personal-info" title="Personal Information" description="Your basic account details.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="First Name" htmlFor="profile-firstName" required>
              {editing ? (
                <input
                  id="profile-firstName"
                  type="text"
                  value={profile.firstName}
                  onChange={(e) => handleProfileChange("firstName", e.target.value)}
                  className={inputClass()}
                />
              ) : (
                <p className="font-body-md text-body-md text-text-primary pt-2.5">{profile.firstName}</p>
              )}
            </Field>
            <Field label="Last Name" htmlFor="profile-lastName" required>
              {editing ? (
                <input
                  id="profile-lastName"
                  type="text"
                  value={profile.lastName}
                  onChange={(e) => handleProfileChange("lastName", e.target.value)}
                  className={inputClass()}
                />
              ) : (
                <p className="font-body-md text-body-md text-text-primary pt-2.5">{profile.lastName}</p>
              )}
            </Field>
            <Field label="Email address" htmlFor="profile-email" required>
              {editing ? (
                <div className="relative">
                  <input
                    id="profile-email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleProfileChange("email", e.target.value)}
                    className={inputClass("pr-10")}
                  />
                  <span
                    className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols text-text-muted"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                    title="Account identifier"
                  >
                    lock
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 pt-2.5">
                  <p className="font-body-md text-body-md text-text-primary">{profile.email}</p>
                  <span className="inline-flex items-center gap-1 rounded-full border border-outline-variant/20 bg-surface-high px-2 py-0.5 text-[10px] font-semibold text-text-muted">
                    <span
                      className="material-symbols text-[10px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      lock
                    </span>
                    Account ID
                  </span>
                </div>
              )}
            </Field>
            <Field label="Phone number" htmlFor="profile-phone">
              {editing ? (
                <input
                  id="profile-phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => handleProfileChange("phone", e.target.value)}
                  className={inputClass()}
                />
              ) : (
                <p className="font-body-md text-body-md text-text-primary pt-2.5">{profile.phone}</p>
              )}
            </Field>
            <Field label="Date of Birth" htmlFor="profile-dob">
              {editing ? (
                <input
                  id="profile-dob"
                  type="date"
                  value={profile.dob}
                  onChange={(e) => handleProfileChange("dob", e.target.value)}
                  className={inputClass()}
                />
              ) : (
                <p className="font-body-md text-body-md text-text-primary pt-2.5">
                  {new Date(profile.dob).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              )}
            </Field>
            <Field label="Gender" htmlFor="profile-gender">
              {editing ? (
                <select
                  id="profile-gender"
                  value={profile.gender}
                  onChange={(e) => handleProfileChange("gender", e.target.value)}
                  className={inputClass()}
                >
                  {GENDER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="font-body-md text-body-md text-text-primary pt-2.5 capitalize">
                  {profile.gender === "" ? "Prefer not to say" : profile.gender.replace("-", " ")}
                </p>
              )}
            </Field>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            {editing ? (
              <>
                <Button type="button" onClick={handleSaveProfile}>
                  <span
                    className="material-symbols text-sm"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    save
                  </span>
                  Save Changes
                </Button>
                <Button type="button" variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button type="button" variant="outline" size="sm" onClick={() => setEditing(true)}>
                <span
                  className="material-symbols text-sm"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  edit
                </span>
                Edit Information
              </Button>
            )}
          </div>
        </Section>

        {/* Contact Information */}
        <Section title="Contact Information" description="Manage your verified contact details.">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-outline-variant/20 bg-surface-container p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-high">
                  <span
                    className="material-symbols text-accent"
                    style={{ fontVariationSettings: "'FILL' 0" }}
                  >
                    mail
                  </span>
                </div>
                <div>
                  <p className="font-label-sm text-label-sm text-text-primary">Email Address</p>
                  <p className="font-body-md text-sm text-text-muted">{profile.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:justify-end">
                <span className="inline-flex items-center gap-1 rounded-full border border-lime/30 bg-lime/10 px-2.5 py-1 text-xs font-semibold text-accent">
                  <span
                    className="material-symbols text-xs"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified_user
                  </span>
                  Verified
                </span>
                <span className="text-xs text-text-muted">Verify Email</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-outline-variant/20 bg-surface-container p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-high">
                  <span
                    className="material-symbols text-accent"
                    style={{ fontVariationSettings: "'FILL' 0" }}
                  >
                    phone
                  </span>
                </div>
                <div>
                  <p className="font-label-sm text-label-sm text-text-primary">Phone Number</p>
                  <p className="font-body-md text-sm text-text-muted">{profile.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:justify-end">
                <span className="inline-flex items-center gap-1 rounded-full border border-outline-variant/30 bg-surface-high px-2.5 py-1 text-xs font-semibold text-text-muted">
                  Unverified
                </span>
                <Link to="/verify-phone">
                  <Button type="button" variant="outline" size="sm">
                    Verify Phone
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Section>

        {/* Address Book */}
        <Section title="Address Book" description="Manage your saved addresses.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="relative rounded-xl border border-outline-variant/20 bg-surface-container p-5 shadow-lg transition-all hover:border-outline-variant/40"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-label-sm text-label-sm text-text-primary">{addr.label}</span>
                    {addr.isDefault && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-lime/30 bg-lime/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleEditAddress(addr)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:text-accent hover:bg-surface-high"
                      aria-label={`Edit ${addr.label} address`}
                    >
                      <span
                        className="material-symbols text-[18px]"
                        style={{ fontVariationSettings: "'FILL' 0" }}
                      >
                        edit
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm(addr)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:text-red-400 hover:bg-surface-high"
                      aria-label={`Delete ${addr.label} address`}
                    >
                      <span
                        className="material-symbols text-[18px]"
                        style={{ fontVariationSettings: "'FILL' 0" }}
                      >
                        delete
                      </span>
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="font-body-md text-body-md text-text-primary">{addr.fullName}</p>
                  <p className="font-body-md text-sm text-text-muted">{addr.addressLine1}</p>
                  {addr.addressLine2 && (
                    <p className="font-body-md text-sm text-text-muted">{addr.addressLine2}</p>
                  )}
                  <p className="font-body-md text-sm text-text-muted">
                    {addr.city}, {addr.region} {addr.postalCode}
                  </p>
                  <p className="font-body-md text-sm text-text-muted">{addr.country}</p>
                  <p className="font-body-md text-sm text-text-muted">{addr.phone}</p>
                </div>
                {!addr.isDefault && (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(addr.id)}
                    className="mt-4 font-label-sm text-label-sm text-accent transition-colors hover:text-accent/80"
                  >
                    Set as Default
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditingAddress(null);
                setAddressModalOpen(true);
              }}
            >
              <span
                className="material-symbols text-sm"
                style={{ fontVariationSettings: "'FILL' 0" }}
              >
                add
              </span>
              Add New Address
            </Button>
          </div>
        </Section>

        {/* Account Information */}
        <Section title="Account Information" description="Your account reference details.">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-lg border border-outline-variant/20 bg-surface-container p-4">
              <p className="font-label-sm text-label-sm text-text-muted mb-1">Account ID</p>
              <p className="font-body-md text-body-md text-text-primary font-mono tracking-wider">
                {ACCOUNT_INFO.accountId}
              </p>
            </div>
            <div className="rounded-lg border border-outline-variant/20 bg-surface-container p-4">
              <p className="font-label-sm text-label-sm text-text-muted mb-1">Member Since</p>
              <p className="font-body-md text-body-md text-text-primary">{ACCOUNT_INFO.memberSince}</p>
            </div>
            <div className="rounded-lg border border-outline-variant/20 bg-surface-container p-4">
              <p className="font-label-sm text-label-sm text-text-muted mb-1">Account Status</p>
              <p className="font-body-md text-body-md text-text-primary">{ACCOUNT_INFO.status}</p>
            </div>
            <div className="rounded-lg border border-outline-variant/20 bg-surface-container p-4">
              <p className="font-label-sm text-label-sm text-text-muted mb-1">Verification Status</p>
              <p className="font-body-md text-body-md text-accent">{ACCOUNT_INFO.verificationStatus}</p>
            </div>
          </div>
        </Section>

        {/* Account Actions */}
        <Section title="Account Actions" description="Manage your account security and sessions.">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link to="/forgot-password" className="block">
              <div className="rounded-xl border border-outline-variant/20 bg-surface-container p-5 text-center transition-all hover:border-outline-variant/40 hover:bg-surface-high cursor-pointer group">
                <span
                  className="material-symbols text-3xl text-accent mb-3 group-hover:scale-110 transition-transform inline-block"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  lock
                </span>
                <p className="font-label-sm text-label-sm text-text-primary">Change Password</p>
                <p className="font-body-md text-xs text-text-muted mt-1">
                  Update your account password
                </p>
              </div>
            </Link>
            <Link to="/customer/settings" className="block">
              <div className="rounded-xl border border-outline-variant/20 bg-surface-container p-5 text-center transition-all hover:border-outline-variant/40 hover:bg-surface-high cursor-pointer group">
                <span
                  className="material-symbols text-3xl text-accent mb-3 group-hover:scale-110 transition-transform inline-block"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  shield
                </span>
                <p className="font-label-sm text-label-sm text-text-primary">Security Settings</p>
                <p className="font-body-md text-xs text-text-muted mt-1">
                  Manage security preferences
                </p>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => {
                showToast("Signed out successfully.");
                setTimeout(() => navigate("/login"), 800);
              }}
              className="w-full text-left"
            >
              <div className="rounded-xl border border-outline-variant/20 bg-surface-container p-5 text-center transition-all hover:border-red-400/30 hover:bg-surface-high cursor-pointer group">
                <span
                  className="material-symbols text-3xl text-red-400 mb-3 group-hover:scale-110 transition-transform inline-block"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  logout
                </span>
                <p className="font-label-sm text-label-sm text-text-primary">Sign Out</p>
                <p className="font-body-md text-xs text-text-muted mt-1">
                  End your current session
                </p>
              </div>
            </button>
          </div>
        </Section>
      </div>

      {/* Address Modal */}
      <AddressModal
        open={addressModalOpen}
        address={editingAddress}
        onSave={handleAddAddress}
        onCancel={() => {
          setAddressModalOpen(false);
          setEditingAddress(null);
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        open={!!deleteConfirm}
        title="Delete Address?"
        message={`Are you sure you want to delete the ${deleteConfirm?.label || ""} address? This action cannot be undone.`}
        confirmLabel="Delete Address"
        onConfirm={handleDeleteAddress}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
