import React from "react";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import Badge from "../components/ui/Badge.jsx";
import ProductCard from "../components/product/ProductCard.jsx";

/*
 * TEMPORARY — component preview only.
 * Remove this page once real public pages (Home, Marketplace, ...) are built.
 */
export default function TempPreview() {
  return (
    <div className="space-y-12 py-8">
      <section>
        <Badge variant="lime">Temporary</Badge>
        <h1 className="mt-3 font-display text-3xl font-bold">Core UI System Preview</h1>
        <p className="mt-2 max-w-xl text-text-muted">
          Verification surface for the shared NUVORA components. This route is
          temporary and will be replaced by real pages.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Buttons</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Badges</h2>
        <div className="flex flex-wrap gap-3">
          <Badge>Default</Badge>
          <Badge variant="lime">Lime</Badge>
          <Badge variant="neutral">Neutral</Badge>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Card</h2>
        <Card className="max-w-sm">
          <p className="text-text-muted">A base surface card using the NUVORA tokens.</p>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Product Card</h2>
        <div className="max-w-xs">
          <ProductCard
            title="Sonic Prism Over-Ear"
            price="$349"
            description="Spatial audio headphones with adaptive noise cancellation and glass-touch controls."
            badge="New"
          />
        </div>
      </section>
    </div>
  );
}
