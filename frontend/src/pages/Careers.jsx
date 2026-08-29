import React from "react";
import { Link } from "react-router-dom";
import { DEPARTMENTS, HERO_IMAGE } from "../data/careers.js";

export default function Careers() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative py-24 mb-16 overflow-hidden rounded-2xl flex flex-col items-center justify-center text-center">
        <div className="absolute inset-0 z-0">
          <div
            className="w-full h-full object-cover opacity-40"
            style={{ backgroundImage: `url('${HERO_IMAGE}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>
        <div className="relative z-10 max-w-3xl px-6">
          <h1 className="font-display text-h1-mobile md:text-display text-text-primary mb-6">
            Shaping the Future of Discovery
          </h1>
          <p className="text-body-lg text-text-muted mb-10">
            We are builders, dreamers, and architects of the next digital
            frontier. Join us in forging the tools that empower creators and
            connect dimensions.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/careers/roles"
              className="inline-flex items-center rounded-full bg-lime px-8 py-3 font-label-sm text-obsidian shadow-[0_0_20px_rgba(184,243,74,0.3)] transition-colors hover:brightness-110"
            >
              View Open Roles
            </Link>
            <Link
              to="/careers/culture"
              className="glass-panel inline-flex items-center rounded-full px-8 py-3 font-label-sm text-text-primary transition-colors hover:bg-surface-high"
            >
              Our Culture
            </Link>
          </div>
        </div>
      </section>

      {/* Departments Bento Grid */}
      <section className="mb-32">
        <h2 className="font-h2 text-h2 text-text-primary mb-12">
          Explore Teams
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DEPARTMENTS.map((dept) => (
            <Link
              key={dept.id}
              to={`/careers/${dept.id}`}
              className={`glass-panel rounded-xl p-8 transition-transform duration-300 relative group cursor-pointer overflow-hidden hover:-translate-y-2 ${
                dept.wide ? "lg:col-span-2" : ""
              } ${dept.glow ? "ai-glow" : ""}`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-lime/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <span className="material-symbols text-4xl text-accent mb-6 block">
                {dept.icon}
              </span>
              <h3 className="font-h3 text-h3 text-text-primary mb-3">
                {dept.title}
              </h3>
              <p className="font-body-md text-text-muted mb-6 max-w-md">
                {dept.description}
              </p>
              <span className="font-label-sm text-accent flex items-center gap-2 transition-all group-hover:gap-3">
                View {dept.roles} Roles{" "}
                <span className="material-symbols text-sm">arrow_forward</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* General Application CTA */}
      <section className="glass-panel rounded-2xl p-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-lime/5" />
        <div className="relative z-10 flex flex-col items-center">
          <span className="material-symbols text-5xl text-accent mb-6">
            rocket_launch
          </span>
          <h2 className="font-h2 text-h2 text-text-primary mb-4">
            Don&apos;t see a perfect fit?
          </h2>
          <p className="text-body-lg text-text-muted mb-8 max-w-2xl">
            We are always looking for exceptional talent. Drop your resume in our
            general pool, and we&apos;ll reach out when the stars align.
          </p>
          <Link
            to="/careers/apply"
            className="inline-flex items-center gap-2 rounded-full bg-lime px-8 py-4 font-label-sm text-obsidian transition-colors hover:brightness-110"
          >
            Submit General Application
            <span className="material-symbols">send</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
