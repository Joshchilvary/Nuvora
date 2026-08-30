import React from "react";
import { Link } from "react-router-dom";
import Button from "../ui/Button.jsx";

const HERO_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAu5o8uMryLNcbfW0VQ9ISW7ZXg8fGc7YSlXUki7D2jZ8apWoJIp_04qpUIrAHlMNUfl99YhuaG79O9r86YuHodFyLcwKL3Letjkrc-ri509D9hsGZTN-xnUfROGEBPnI_jUIb88VJ3Qe3QNmsgl3LUKxegx9YltdHdzCF8vX0yW5krkXUnBNFFFdPk5tYQEhmSG7ovzxz2Asklyhdz5K6uWGizNPZ_PcnkT5vTYPOVPE18MI_ohFiWyQ";

export default function HeroSection() {
  return (
    <section className="relative mb-32">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(184,243,74,0.08),transparent_60%)]"
        aria-hidden="true"
      />
      <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-12">
        <div className="z-10 md:col-span-7">
          <h1 className="mb-6 font-display text-[40px] leading-[1.05] tracking-tight text-gradient md:text-h1 lg:text-display">
            Don't just search.
            <br />
            Discover what fits you.
          </h1>
          <p className="mb-10 max-w-xl text-body-lg text-text-muted">
            Experience a new dimension of shopping where intelligent discovery
            meets premium curated goods.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/marketplace">
              <Button className="rounded-full px-8 py-4 text-base">
                Start Exploring
              </Button>
            </Link>
            <Link to="/discover">
              <Button
                variant="outline"
                className="rounded-full bg-surface/40 px-8 py-4 text-base backdrop-blur-[20px]"
              >
                View Collections
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative mt-16 h-[360px] md:col-span-5 md:mt-0 md:h-[500px]">
          <div className="dim-card glass-panel absolute inset-0 overflow-hidden rounded-3xl border border-outline-variant/10 bg-[#1E2025] shadow-2xl">
            <div
              className="h-full w-full bg-cover bg-center opacity-80 mix-blend-screen"
              style={{ backgroundImage: `url('${HERO_IMAGE}')` }}
              role="img"
              aria-label="Premium tech gadgets floating in dark atmospheric space with lime rim lighting"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
