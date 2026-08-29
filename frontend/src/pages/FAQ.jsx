import React, { useState, useMemo } from "react";
import FAQS, { CATEGORIES } from "../data/faqs.js";

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState("general");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const filteredFAQs = useMemo(() => {
    return FAQS.filter((faq) => {
      const matchesCategory = faq.category === activeCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const activeCategoryLabel =
    CATEGORIES.find((c) => c.id === activeCategory)?.label ?? "FAQ";

  return (
    <div className="relative">
      {/* Hero / Search Section */}
      <section className="relative py-20 md:py-32">
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-lime/5 blur-[120px]" />
        </div>
        <div className="mx-auto max-w-3xl px-6 text-center md:px-8">
          <h1 className="font-display text-h1 text-text-primary md:text-h1 mb-6">
            How can we help?
          </h1>
          <p className="text-body-lg text-text-muted mb-10">
            Search our knowledge base or browse categories below.
          </p>
          <div className="relative max-w-2xl mx-auto group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="material-symbols text-text-muted group-focus-within:text-accent transition-colors">
                search
              </span>
            </div>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ai-glow-focus w-full rounded-xl border border-outline-variant/30 bg-surface-high py-4 pl-12 pr-4 font-body-md text-text-primary outline-none transition-all placeholder:text-text-muted/60 focus:border-lime"
              placeholder="Search for answers, features, or troubleshooting..."
              type="text"
            />
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
              <button
                type="button"
                className="bg-lime text-obsidian rounded-lg px-4 py-2 font-label-sm hover:brightness-110 transition-all"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-20">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
            {/* Sidebar */}
            <aside className="md:col-span-3 hidden md:block">
              <div className="sticky top-40 glass-panel rounded-xl p-6">
                <h3 className="font-label-sm text-label-sm text-text-muted uppercase tracking-wider mb-4">
                  Categories
                </h3>
                <nav className="space-y-2">
                  {CATEGORIES.map((category) => {
                    const isActive = activeCategory === category.id;
                    return (
                      <button
                        key={category.id}
                        onClick={() => {
                          setActiveCategory(category.id);
                          setExpandedId(null);
                        }}
                        className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                          isActive
                            ? "bg-surface-high text-text-primary"
                            : "text-text-muted hover:bg-surface-high hover:text-text-primary"
                        }`}
                      >
                        <span
                          className={`material-symbols ${
                            isActive ? "text-accent" : "text-text-muted"
                          }`}
                        >
                          {category.icon}
                        </span>
                        <span
                          className={`font-body-md ${
                            isActive ? "font-semibold" : ""
                          }`}
                        >
                          {category.label}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>

            {/* FAQ Content */}
            <div className="md:col-span-9 space-y-16">
              <section className="scroll-mt-40" id={activeCategory}>
                <h2 className="font-h3 text-h3 text-text-primary mb-8 flex items-center gap-3 border-b border-outline-variant/20 pb-4">
                  <span className="material-symbols text-3xl text-accent">
                    {CATEGORIES.find((c) => c.id === activeCategory)?.icon ??
                      "help"}
                  </span>
                  {activeCategoryLabel}
                </h2>
                {filteredFAQs.length === 0 ? (
                  <div className="rounded-xl border border-outline-variant/20 bg-surface p-10 text-center">
                    <span className="material-symbols text-5xl text-text-muted mb-4">
                      search_off
                    </span>
                    <h3 className="font-h4 text-h4 text-text-primary mb-2">
                      No matches found
                    </h3>
                    <p className="text-body-md text-text-muted">
                      Try a different search term or switch categories.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredFAQs.map((faq) => {
                      const isExpanded = expandedId === faq.id;
                      return (
                        <div
                          key={faq.id}
                          className="glass-panel rounded-xl overflow-hidden transition-shadow duration-300 hover:shadow-lg"
                        >
                          <button
                            onClick={() => toggleExpand(faq.id)}
                            className="flex w-full items-center justify-between px-6 py-5 text-left outline-none transition-colors hover:bg-surface-high/60"
                            aria-expanded={isExpanded}
                          >
                            <span className="font-body-lg text-text-primary font-semibold">
                              {faq.question}
                            </span>
                            <span
                              className={`material-symbols text-accent transition-transform duration-300 ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            >
                              expand_more
                            </span>
                          </button>
                          <div
                            className="overflow-hidden transition-all duration-300"
                            style={{
                              gridTemplateRows: isExpanded
                                ? "1fr"
                                : "0fr",
                              display: "grid",
                            }}
                          >
                            <div className="overflow-hidden">
                              <div className="border-t border-outline-variant/10 px-6 py-5 text-text-muted font-body-md">
                                {faq.answer}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
