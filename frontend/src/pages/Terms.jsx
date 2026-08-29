import React, { useState, useEffect, useRef } from "react";

const SECTIONS = [
  {
    id: "acceptance",
    number: "1",
    title: "Acceptance of Terms",
    content: [
      "By accessing or using the NUVORA platform, services, or related applications (collectively, the 'Services'), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Services.",
      "These terms constitute a legally binding agreement between you and NUVORA. We reserve the right to modify these terms at any time, and such modifications shall be effective immediately upon posting.",
    ],
  },
  {
    id: "accounts",
    number: "2",
    title: "Account Responsibilities",
    content: [
      "When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.",
    ],
    callout: {
      title: "Security Obligation",
      text: "You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. You agree not to disclose your password to any third party.",
    },
  },
  {
    id: "intellectual-property",
    number: "3",
    title: "Intellectual Property",
    content: [
      "The Service and its original content, features, and functionality are and will remain the exclusive property of NUVORA and its licensors. The Service is protected by copyright, trademark, and other laws.",
    ],
    list: [
      "Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of NUVORA.",
      "Users retain ownership of content they upload, but grant NUVORA a license to use, store, and display such content.",
    ],
  },
  {
    id: "user-conduct",
    number: "4",
    title: "User Conduct",
    content: [
      "You agree not to use the Service for any unlawful purpose or in any way that could damage, disable, or impair the Service. This includes attempting to gain unauthorized access to our systems or networks.",
      "You are solely responsible for any content you post or transmit through the Service. We reserve the right to remove any content that violates these Terms.",
    ],
  },
  {
    id: "disclaimers",
    number: "5",
    title: "Disclaimers",
    content: [
      "The Service is provided on an 'as is' and 'as available' basis without warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, or non-infringement.",
      "We do not warrant that the Service will be uninterrupted, secure, or error-free, or that defects will be corrected. We are not responsible for any delays, failures, or data loss arising from your use of the Service.",
    ],
  },
];

const SUMMARIES = [
  {
    title: "Agreement to terms",
    description: "Using NUVORA means you accept these terms.",
  },
  {
    title: "Your responsibility",
    description: "Keep your account accurate and your credentials secure.",
  },
  {
    title: "Our content",
    description: "NUVORA owns the platform; you keep rights to your uploads.",
  },
  {
    title: "Acceptable use",
    description: "No unlawful or harmful activity on our platform.",
  },
  {
    title: "No warranties",
    description: "The service is provided as-is without guarantees.",
  },
];

export default function Terms() {
  const [activeSection, setActiveSection] = useState("acceptance");
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
          <h1 className="font-display text-h1-mobile md:text-h1 text-text-primary mb-6">
            Terms of Service
          </h1>
          <p className="text-body-lg text-text-muted max-w-2xl">
            Last updated: October 24, 2024
          </p>
          <div className="h-px w-full bg-gradient-to-r from-outline-variant/50 to-transparent mt-12" />
        </header>

        <div className="flex flex-col lg:flex-row gap-8 relative">
          {/* Sidebar Navigation */}
          <aside className="hidden lg:block w-64 shrink-0 relative">
            <div className="sticky top-[160px] flex flex-col gap-2 glass-panel p-6 rounded-xl">
              <h4 className="font-label-sm text-label-sm text-text-muted uppercase tracking-wider mb-4">
                Contents
              </h4>
              <nav className="flex flex-col gap-1">
                {SECTIONS.map((section) => {
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`font-body-md text-body-md text-left px-4 py-2 rounded-lg transition-colors border-l-2 ${
                        isActive
                          ? "text-accent bg-surface-high border-accent"
                          : "text-text-muted hover:text-text-primary hover:bg-surface-high border-transparent"
                      }`}
                    >
                      {section.number}. {section.title}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 max-w-3xl pb-32">
            <article className="space-y-16">
              {SECTIONS.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  ref={(el) => (sectionRefs.current[section.id] = el)}
                  className="scroll-mt-[160px]"
                >
                  <h2 className="font-h3 text-h3 text-text-primary mb-6 flex items-center gap-4">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-high font-label-sm text-label-sm text-accent">
                      {section.number}
                    </span>
                    {section.title}
                  </h2>
                  <div className="space-y-6 text-text-muted font-body-md text-body-md">
                    {section.content.map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))}
                    {section.callout && (
                      <div className="glass-panel my-8 rounded-lg border-l-4 border-l-accent p-6">
                        <h4 className="font-h4 text-h4 text-text-primary mb-2">
                          {section.callout.title}
                        </h4>
                        <p>{section.callout.text}</p>
                      </div>
                    )}
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
            </article>
          </main>
        </div>
      </main>
    </div>
  );
}
