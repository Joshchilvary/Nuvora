import React, { useState, useEffect, useRef } from "react";

const SECTIONS = [
  {
    id: "section-1",
    number: "01",
    title: "Data Collection",
    content: [
      "We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, postal address, profile picture, payment method, items requested, and other information you choose to provide.",
      "When you use our Services, we also collect information about your transactions, including date and time, amounts charged, and other related transaction details.",
    ],
  },
  {
    id: "section-2",
    number: "02",
    title: "Use of Information",
    content: [
      "We may use the information we collect about you to provide, maintain, and improve our Services, including, for example, to facilitate payments, send receipts, provide products and services you request, develop new features, provide customer support to Users, develop safety features, authenticate users, and send product updates and administrative messages.",
      "We perform internal operations necessary to provide our Services, including to troubleshoot software bugs and operational problems, to conduct data analysis, testing, and research, and to monitor and analyze usage and activity trends.",
    ],
  },
  {
    id: "section-3",
    number: "03",
    title: "Sharing of Information",
    content: [
      "We may share the information we collect about you as described in this Statement or as described at the time of collection or sharing, including as follows:",
    ],
    list: [
      "With third parties to provide you a service you requested through a partnership or promotional offering made by a third party or us.",
      "With the general public if you submit content in a public forum, such as blog comments, social media posts, or other features of our Services that are viewable by the general public.",
      "With third parties with whom you choose to let us share information, for example other apps or websites that integrate with our API or Services, or those with an API or Service with which we integrate.",
    ],
  },
];

const SUMMARIES = [
  {
    title: "We collect basics",
    description: "Just what we need to run your account securely.",
  },
  {
    title: "Used for improvement",
    description: "Your data helps train our AI models for a better experience.",
  },
  {
    title: "No selling data",
    description: "We don't sell your personal information to third parties.",
  },
];

export default function Privacy() {
  const [activeSection, setActiveSection] = useState("section-1");
  const sectionRefs = useRef({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id) => {
    const el = sectionRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto px-5 md:px-16 py-12 md:py-24">
        <header className="mb-16 md:mb-24">
          <h1 className="font-display text-h1-mobile md:text-h1 text-text-primary mb-4">
            Privacy Policy
          </h1>
          <p className="text-body-lg text-text-muted max-w-2xl">
            Last updated: October 24, 2024. This policy describes how NUVORA
            collects, uses, and shares your personal data.
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8 relative">
          {/* Main Content */}
          <div className="lg:w-2/3 space-y-12">
            {SECTIONS.map((section) => (
              <section
                key={section.id}
                id={section.id}
                ref={(el) => (sectionRefs.current[section.id] = el)}
                className="scroll-mt-24"
              >
                <h2 className="font-h3 text-h3 text-text-primary mb-6 flex items-center gap-4">
                  <span className="text-accent font-h4 text-h4">
                    {section.number}.
                  </span>
                  {section.title}
                </h2>
                <div className="space-y-4 text-text-muted">
                  {section.content.map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                  {section.list && (
                    <ul className="list-disc pl-6 space-y-2 mt-4">
                      {section.list.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            ))}
          </div>

          {/* Summary Panel */}
          <div className="lg:w-1/3">
            <div className="sticky top-24 glass-panel rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <span
                  className="material-symbols text-accent"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  psychology
                </span>
                <h3 className="font-h4 text-h4 text-text-primary">
                  Summary for Humans
                </h3>
              </div>
              <div className="space-y-6">
                {SUMMARIES.map((summary, idx) => (
                  <div
                    key={idx}
                    className="border-l-2 border-accent pl-4"
                  >
                    <h4 className="font-label-sm text-label-sm text-text-primary mb-1">
                      {summary.title}
                    </h4>
                    <p className="font-body-md text-body-md text-text-muted text-sm">
                      {summary.description}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => alert("PDF download is not yet available.")}
                  className="w-full rounded-lg bg-surface-high px-4 py-3 font-label-sm text-label-sm text-text-primary transition-colors hover:bg-surface-bright flex items-center justify-center gap-2"
                >
                  <span className="material-symbols text-sm">download</span>
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
