import React from "react";
import { Link } from "react-router-dom";

const HERO_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAp-7UlilO4SsPtZR8D0cw_AwzDlalTkBxPPxzeBbvg8G9oEe7ADwlQSOCejWzicrfLAxApFSLMiVSL5i6VII19RmBWOE4VyRHKe9eiuZ0ZvJlZmW877KveUma6olnlLrnksTrkAoBt_IsNh39N6arMs34NMq7l8n5iiddVG99BPWHSsrJmCYoNgKydqTldLAHWJBiGuT5_Y2TXtf_OmzW2RpRAvqemScm-_A47zeYvWiiICuR5V8N37g";

const VISION_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCcxcPmXKzVdYqPmS5wKk5ZmUYj54WeWoTOk_mAQ1jPmhSy9qbVzU0Zi-3kXU4nw-8LyG2RN4AGB6YQ3wtUPaPEupOJ_eiJs2IlAsLYVFXZuQ6-z3x98oSOYv1eSPbHTJF_FxDNx9lI7hreu41SLYS_JgTIvd1XYsmmCDjCIzKgPbVuUg977Vz8NjCNaFXQVKxsVuWoFkPxwIV-_2lWCc93DfxulN7Y4z0QhhCII_CbpS9NWWVMzVZ9Vg";

export default function OurStory() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="hero-gradient relative min-h-[716px] flex flex-col justify-center items-center text-center mb-32">
        <div className="absolute inset-0 z-[-1] opacity-20 dark:opacity-30">
          <div
            className="w-full h-full bg-cover bg-center dark:mix-blend-screen"
            style={{ backgroundImage: `url('${HERO_IMAGE}')` }}
          />
        </div>
        <h1 className="font-display text-[40px] font-semibold leading-tight text-text-primary md:text-h1 lg:text-display max-w-4xl mx-auto mb-6">
          The Architecture of <br />
          <span className="text-lime">Intelligent Discovery.</span>
        </h1>
        <p className="text-body-lg text-text-muted max-w-2xl mx-auto">
          Merging the precision of high-end technology with the tactility of
          premium physical goods. NUVORA is a dimensional marketplace powered by
          AI, designed for effortless navigation and secure transactions.
        </p>
      </section>

      {/* Vision Section */}
      <section className="mb-32">
        <h2 className="font-display text-h2 text-text-primary mb-12">
          The Physical Digital Vision
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
          {/* Main Feature */}
          <div className="glass-panel md:col-span-2 md:row-span-2 glow-border group relative overflow-hidden rounded-xl p-8 flex flex-col justify-end">
            <div className="absolute inset-0 z-[-1] transition-transform duration-700 group-hover:scale-105">
              <div
                className="h-full w-full bg-cover bg-center opacity-40"
                style={{ backgroundImage: `url('${VISION_IMAGE}')` }}
              />
            </div>
            <div className="relative z-10">
              <h3 className="font-h3 text-h3 text-lime mb-4">Tactile AI</h3>
              <p className="font-body-md text-text-muted max-w-md">
                Our algorithms don&apos;t just sort data; they understand the
                dimensional qualities of objects, bringing the physical sensation
                of premium goods into the digital space.
              </p>
            </div>
          </div>

          {/* Secondary Feature 1 */}
          <div className="glass-panel glow-border group relative overflow-hidden rounded-xl p-8 flex flex-col justify-between">
            <span className="material-symbols text-4xl text-lime mb-6">
              security
            </span>
            <div>
              <h4 className="font-h4 text-h4 text-text-primary mb-2">
                Cryptographic Security
              </h4>
              <p className="font-body-md text-text-muted text-sm">
                Every interaction is locked within a secure, distributed ledger,
                ensuring trust across all dimensions.
              </p>
            </div>
          </div>

          {/* Secondary Feature 2 */}
          <div className="glass-panel glow-border group relative overflow-hidden rounded-xl bg-surface-container/50 p-8 flex flex-col justify-between">
            <span className="material-symbols text-4xl text-lime mb-6">
              language
            </span>
            <div>
              <h4 className="font-h4 text-h4 text-text-primary mb-2">
                Global Scale
              </h4>
              <p className="font-body-md text-text-muted text-sm">
                Borderless infrastructure built for seamless high-value
                transactions worldwide.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
