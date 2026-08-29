import React, { useState, useMemo } from "react";
import {
  SUPPORT_TOPICS,
  CONTACT_METHODS,
  SUBJECT_OPTIONS,
} from "../data/support.js";

export default function SupportCenter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: SUBJECT_OPTIONS[0],
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null);

  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) return SUPPORT_TOPICS;
    const q = searchQuery.toLowerCase();
    return SUPPORT_TOPICS.filter(
      (topic) =>
        topic.title.toLowerCase().includes(q) ||
        topic.description.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const validateForm = () => {
    const next = {};
    if (!formData.name.trim()) next.name = "Name is required";
    if (!formData.email.trim()) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      next.email = "Enter a valid email";
    if (formData.subject === SUBJECT_OPTIONS[0])
      next.subject = "Please select a subject";
    if (!formData.message.trim()) next.message = "Message is required";
    else if (formData.message.trim().length < 10)
      next.message = "Message must be at least 10 characters";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitStatus("success");
    setFormData({
      name: "",
      email: "",
      subject: SUBJECT_OPTIONS[0],
      message: "",
    });
    setTimeout(() => setSubmitStatus(null), 4000);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  return (
    <div className="relative">
      {/* Hero & AI Search */}
      <section className="relative text-center mb-20 mt-12">
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-lime/5 blur-[120px]" />
        </div>
        <div className="mx-auto max-w-3xl px-6 md:px-8">
          <h1 className="font-display text-h1 text-text-primary md:text-h1 mb-6">
            How can we help?
          </h1>
          <p className="text-body-lg text-text-muted mb-10 max-w-2xl mx-auto">
            Access our knowledge base or let our AI guide you to the exact
            solution.
          </p>
          <div className="relative max-w-3xl mx-auto group">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              <span className="material-symbols text-lime text-2xl">
                magic_button
              </span>
            </div>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ai-input w-full rounded-full border border-outline-variant/30 bg-surface-high py-5 pl-14 pr-32 font-body-lg text-text-primary transition-all duration-300 ai-glow placeholder:text-text-muted/50 focus:border-lime"
              placeholder="Ask NUVORA Support..."
              type="text"
            />
            <div className="absolute inset-y-2 right-2 flex items-center">
              <button
                type="button"
                className="flex items-center gap-2 rounded-full bg-lime px-6 py-2.5 font-label-sm text-obsidian transition-colors hover:brightness-110 active:scale-95"
              >
                Ask AI
                <span className="material-symbols text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Topics */}
      <section className="mb-24 relative z-10">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="flex items-end justify-between mb-8">
            <h2 className="font-h2 text-h2 text-text-primary">Popular Topics</h2>
            <button className="flex items-center gap-1 font-label-sm text-accent transition-colors hover:text-accent/80">
              View all
              <span className="material-symbols text-sm">chevron_right</span>
            </button>
          </div>
          {filteredTopics.length === 0 ? (
            <div className="rounded-xl border border-outline-variant/20 bg-surface p-10 text-center">
              <span className="material-symbols text-5xl text-text-muted mb-4">
                search_off
              </span>
              <h3 className="font-h4 text-h4 text-text-primary mb-2">
                No matches found
              </h3>
              <p className="text-body-md text-text-muted">
                Try a different search term.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTopics.map((topic) => (
                <button
                  key={topic.id}
                  className="glass-panel rounded-xl p-8 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl group relative overflow-hidden flex flex-col justify-between min-h-[240px]"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-lime/5 blur-3xl transition-all group-hover:bg-lime/10" />
                  <div>
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg border border-outline-variant/20 bg-surface-high transition-colors group-hover:bg-lime/20">
                      <span className="material-symbols text-accent text-2xl">
                        {topic.icon}
                      </span>
                    </div>
                    <h3 className="font-h4 text-h4 text-text-primary mb-3 transition-colors group-hover:text-accent">
                      {topic.title}
                    </h3>
                    <p className="font-body-md text-text-muted line-clamp-2">
                      {topic.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section className="relative z-10 pb-20">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-start">
            <div className="lg:col-span-5">
              <h2 className="font-h2 text-h2 text-text-primary mb-4">
                Still need help?
              </h2>
              <p className="text-body-lg text-text-muted mb-8">
                If you couldn&apos;t find the answer in our knowledge base, our
                support team is ready to assist you directly.
              </p>
              <div className="space-y-6">
                {CONTACT_METHODS.map((method) => (
                  <div key={method.title} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-high">
                      <span className="material-symbols text-accent">
                        {method.icon}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-label-sm text-label-sm text-text-primary">
                        {method.title}
                      </h4>
                      <p className="font-body-md text-text-muted">
                        {method.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="glass-panel rounded-xl p-8 md:p-10">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {submitStatus === "success" && (
                    <div className="rounded-lg border border-lime/40 bg-lime/10 px-4 py-3 text-sm text-accent">
                      Message sent successfully. We&apos;ll get back to you
                      soon.
                    </div>
                  )}
                  {submitStatus === "error" && (
                    <div className="rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                      Something went wrong. Please try again.
                    </div>
                  )}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label
                        className="mb-2 block font-label-sm text-label-sm text-text-muted"
                        htmlFor="support-name"
                      >
                        Name
                      </label>
                      <input
                        id="support-name"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        className={`w-full rounded-lg border bg-surface-high px-4 py-3 font-body-md text-text-primary outline-none transition-colors placeholder:text-text-muted/60 focus:border-lime ${
                          errors.name ? "border-red-400" : "border-outline-variant/30"
                        }`}
                        placeholder="Your name"
                        type="text"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-400">
                          {errors.name}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        className="mb-2 block font-label-sm text-label-sm text-text-muted"
                        htmlFor="support-email"
                      >
                        Email
                      </label>
                      <input
                        id="support-email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        className={`w-full rounded-lg border bg-surface-high px-4 py-3 font-body-md text-text-primary outline-none transition-colors placeholder:text-text-muted/60 focus:border-lime ${
                          errors.email ? "border-red-400" : "border-outline-variant/30"
                        }`}
                        placeholder="your@email.com"
                        type="email"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-400">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label
                      className="mb-2 block font-label-sm text-label-sm text-text-muted"
                      htmlFor="support-subject"
                    >
                      Subject
                    </label>
                    <div className="relative">
                      <select
                        id="support-subject"
                        value={formData.subject}
                        onChange={(e) =>
                          handleChange("subject", e.target.value)
                        }
                        className={`w-full appearance-none rounded-lg border bg-surface-high px-4 py-3 font-body-md text-text-primary outline-none transition-colors focus:border-lime ${
                          errors.subject
                            ? "border-red-400"
                            : "border-outline-variant/30"
                        }`}
                      >
                        {SUBJECT_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <span className="material-symbols absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
                        expand_more
                      </span>
                    </div>
                    {errors.subject && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.subject}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      className="mb-2 block font-label-sm text-label-sm text-text-muted"
                      htmlFor="support-message"
                    >
                      Message
                    </label>
                    <textarea
                      id="support-message"
                      value={formData.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      className={`w-full rounded-lg border bg-surface-high px-4 py-3 font-body-md text-text-primary outline-none transition-colors placeholder:text-text-muted/60 focus:border-lime ${
                        errors.message
                          ? "border-red-400"
                          : "border-outline-variant/30"
                      }`}
                      placeholder="Describe your issue in detail..."
                      rows="4"
                    />
                    {errors.message && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.message}
                      </p>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-lime py-4 font-label-sm text-obsidian transition-colors hover:brightness-110 active:scale-95"
                  >
                    Send Message
                    <span className="material-symbols text-sm">
                      send
                    </span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
