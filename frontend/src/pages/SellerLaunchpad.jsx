import React, { useState } from "react";
import { Link } from "react-router-dom";
import SellerStepper from "../components/seller/SellerStepper.jsx";
import SellerFileUpload from "../components/seller/SellerFileUpload.jsx";

const STEPS = [
  {
    title: "Store Information",
    description: "Tell us about your business.",
  },
  {
    title: "Verification",
    description: "Upload documents to verify your business.",
  },
  {
    title: "Branding",
    description: "Customize your store appearance.",
  },
  {
    title: "Review & Submit",
    description: "Review your application before submitting.",
  },
];

export default function SellerLaunchpad() {
  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [application, setApplication] = useState({
    storeName: "",
    registrationNumber: "",
    businessInfo: "",
    verificationDocument: null,
    logo: null,
    brandingInfo: "",
  });
  const [errors, setErrors] = useState({});

  const update = (field, value) => {
    setApplication((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validateStep = (step) => {
    const next = {};
    if (step === 0) {
      if (!application.storeName.trim()) next.storeName = "Store name is required";
      if (!application.registrationNumber.trim()) next.registrationNumber = "Registration number is required";
    }
    if (step === 1) {
      if (!application.verificationDocument) next.verificationDocument = "Please upload a business document";
    }
    if (step === 2) {
      if (!application.logo) next.logo = "Please upload a store logo";
      if (!application.brandingInfo.trim()) next.brandingInfo = "Branding information is required";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    if (!validateStep(currentStep)) return;
    setSubmitted(true);
  };

  const handleStepClick = (step) => {
    if (step <= currentStep) {
      setCurrentStep(step);
    }
  };

  if (submitted) {
    return (
      <div className="relative min-h-screen bg-background">
        <main className="flex flex-grow w-full max-w-container-max mx-auto px-5 py-12 md:px-16 md:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-lime/10 mx-auto border border-lime/20">
              <span
                className="material-symbols text-lime text-[32px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
            </div>
            <h1 className="font-display text-h2 text-text-primary mb-4">Application Submitted</h1>
            <p className="font-body-lg text-body-lg text-text-muted mb-8">
              Thank you for applying to become a NUVORA seller. Our team will review your application and get back to you
              within 2-3 business days.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/customer"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-lime py-3 px-6 font-label-md text-label-md text-obsidian transition-all hover:brightness-110 active:scale-[0.98]"
              >
                Go to Customer Hub
              </Link>
              <Link
                to="/marketplace"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-outline-variant/30 py-3 px-6 font-label-md text-label-md text-text-primary transition-colors hover:bg-surface-high"
              >
                Browse Marketplace
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background">
      <main className="flex flex-grow w-full max-w-container-max mx-auto px-5 py-12 md:px-16 md:py-24">
        <div className="mx-auto w-full max-w-3xl">
          <SellerStepper currentStep={currentStep} onStepClick={handleStepClick} />

          <section className="glass-panel rounded-xl p-8 shadow-2xl relative overflow-hidden">
            <div
              className="absolute top-0 right-0 h-64 w-64 bg-lime/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"
              aria-hidden="true"
            />
            <div className="mb-8 relative z-10">
              <h2 className="font-h3 text-h3 text-text-primary mb-2">{STEPS[currentStep].title}</h2>
              <p className="font-body-md text-body-md text-text-muted">{STEPS[currentStep].description}</p>
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-6 relative z-10">
              {currentStep === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label
                      className="block font-label-sm text-label-sm text-text-primary"
                      htmlFor="store-name"
                    >
                      Store Name
                    </label>
                    <input
                      id="store-name"
                      type="text"
                      value={application.storeName}
                      onChange={(e) => update("storeName", e.target.value)}
                      placeholder="Nuvora Enterprises LLC"
                      className={`block w-full rounded-lg bg-surface-container-high border px-4 py-3 font-body-md text-text-primary outline-none transition-all placeholder:text-text-muted/60 focus:border-lime ${
                        errors.storeName ? "border-red-400" : "border-outline-variant/30"
                      }`}
                    />
                    {errors.storeName && (
                      <p className="mt-1 text-sm text-red-400">{errors.storeName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label
                      className="block font-label-sm text-label-sm text-text-primary"
                      htmlFor="registration-number"
                    >
                      Registration Number
                    </label>
                    <input
                      id="registration-number"
                      type="text"
                      value={application.registrationNumber}
                      onChange={(e) => update("registrationNumber", e.target.value)}
                      placeholder="Enter registration ID"
                      className={`block w-full rounded-lg bg-surface-container-high border px-4 py-3 font-body-md text-text-primary outline-none transition-all placeholder:text-text-muted/60 focus:border-lime ${
                        errors.registrationNumber ? "border-red-400" : "border-outline-variant/30"
                      }`}
                    />
                    {errors.registrationNumber && (
                      <p className="mt-1 text-sm text-red-400">{errors.registrationNumber}</p>
                    )}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label
                      className="block font-label-sm text-label-sm text-text-primary"
                      htmlFor="business-info"
                    >
                      Business Information
                    </label>
                    <textarea
                      id="business-info"
                      rows={4}
                      value={application.businessInfo}
                      onChange={(e) => update("businessInfo", e.target.value)}
                      placeholder="Describe your business..."
                      className="block w-full rounded-lg bg-surface-container-high border border-outline-variant/30 px-4 py-3 font-body-md text-text-primary outline-none transition-all placeholder:text-text-muted/60 focus:border-lime"
                    />
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-6">
                  <SellerFileUpload
                    label="Business License / Verification Document"
                    accept=".pdf,.png,.jpg,.jpeg"
                    file={application.verificationDocument}
                    onFileChange={(file) => update("verificationDocument", file)}
                  />
                  {errors.verificationDocument && (
                    <p className="mt-1 text-sm text-red-400">{errors.verificationDocument}</p>
                  )}
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <SellerFileUpload
                    label="Store Logo"
                    accept=".png,.jpg,.jpeg"
                    file={application.logo}
                    onFileChange={(file) => update("logo", file)}
                  />
                  {errors.logo && <p className="mt-1 text-sm text-red-400">{errors.logo}</p>}
                  <div className="space-y-2">
                    <label
                      className="block font-label-sm text-label-sm text-text-primary"
                      htmlFor="branding-info"
                    >
                      Branding Information
                    </label>
                    <textarea
                      id="branding-info"
                      rows={4}
                      value={application.brandingInfo}
                      onChange={(e) => update("brandingInfo", e.target.value)}
                      placeholder="Describe your brand..."
                      className={`block w-full rounded-lg bg-surface-container-high border px-4 py-3 font-body-md text-text-primary outline-none transition-all placeholder:text-text-muted/60 focus:border-lime ${
                        errors.brandingInfo ? "border-red-400" : "border-outline-variant/30"
                      }`}
                    />
                    {errors.brandingInfo && (
                      <p className="mt-1 text-sm text-red-400">{errors.brandingInfo}</p>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="rounded-xl border border-outline-variant/20 bg-surface-container p-6">
                    <h3 className="font-h4 text-h4 text-text-primary mb-4">Application Summary</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="font-label-sm text-label-sm text-text-muted">Store Name</p>
                        <p className="font-body-md text-body-md text-text-primary">{application.storeName}</p>
                      </div>
                      <div>
                        <p className="font-label-sm text-label-sm text-text-muted">Registration Number</p>
                        <p className="font-body-md text-body-md text-text-primary">
                          {application.registrationNumber}
                        </p>
                      </div>
                      <div>
                        <p className="font-label-sm text-label-sm text-text-muted">Business Information</p>
                        <p className="font-body-md text-body-md text-text-primary">
                          {application.businessInfo || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="font-label-sm text-label-sm text-text-muted">Verification Document</p>
                        <p className="font-body-md text-body-md text-text-primary">
                          {application.verificationDocument
                            ? application.verificationDocument.name
                            : "Not uploaded"}
                        </p>
                      </div>
                      <div>
                        <p className="font-label-sm text-label-sm text-text-muted">Store Logo</p>
                        <p className="font-body-md text-body-md text-text-primary">
                          {application.logo ? application.logo.name : "Not uploaded"}
                        </p>
                      </div>
                      <div>
                        <p className="font-label-sm text-label-sm text-text-muted">Branding Information</p>
                        <p className="font-body-md text-body-md text-text-primary">
                          {application.brandingInfo || "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-8 flex items-center justify-between border-t border-outline-variant/30 mt-8">
                {currentStep > 0 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="font-label-sm text-label-sm text-text-muted hover:text-text-primary transition-colors px-4 py-2"
                  >
                    Back
                  </button>
                ) : (
                  <Link
                    to="/customer"
                    className="font-label-sm text-label-sm text-text-muted hover:text-text-primary transition-colors px-4 py-2"
                  >
                    Cancel
                  </Link>
                )}
                {currentStep < STEPS.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-lime py-3 px-8 font-label-sm text-label-sm font-semibold text-obsidian transition-all hover:brightness-110 active:scale-[0.98]"
                  >
                    Continue
                    <span
                      className="material-symbols text-sm"
                      style={{ fontVariationSettings: "'FILL' 0" }}
                    >
                      arrow_forward
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-lime py-3 px-8 font-label-sm text-label-sm font-semibold text-obsidian transition-all hover:brightness-110 active:scale-[0.98]"
                  >
                    Submit Application
                  </button>
                )}
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
