import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import Badge from "../components/ui/Badge.jsx";
import TrackingTimeline from "../components/tracking/TrackingTimeline.jsx";
import { resolveTrackingOrder, getTracking } from "../services/tracking.js";

function MiniMap() {
  return (
    <div className="relative h-[300px] overflow-hidden rounded-2xl border border-outline-variant/20 bg-gradient-to-br from-surface-low to-deep-surface md:h-[420px]">
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(150,156,134,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(150,156,134,0.6) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 400 300"
        preserveAspectRatio="none"
      >
        <path
          d="M40 240 C 120 200, 140 120, 220 140 S 320 80, 360 60"
          fill="none"
          stroke="rgb(var(--nuvora-lime))"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="6 8"
          className="opacity-80"
        />
        <circle
          cx="360"
          cy="60"
          r="8"
          fill="rgb(var(--nuvora-lime))"
          className="pulse-ring"
        />
      </svg>
      <div className="absolute bottom-6 left-6 right-6 flex items-center gap-4 rounded-xl border border-outline-variant/20 bg-surface/80 p-4 backdrop-blur-xl md:right-auto md:w-80">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-obsidian text-white">
          <span
            className="material-symbols"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            directions_car
          </span>
        </div>
        <div>
          <p className="font-label-sm text-text-primary">
            Arriving in approx. 2 hours
          </p>
          <p className="text-[12px] text-text-muted">Driver is nearby</p>
        </div>
      </div>
    </div>
  );
}

export default function TrackOrder() {
  const order = resolveTrackingOrder();
  const tracking = getTracking(order);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="py-12">
      {/* Header */}
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-h2 text-h2 text-text-primary">Track Your Order</h1>
          <Badge variant="lime">{tracking.currentStatus}</Badge>
        </div>
        <p className="font-body-lg text-text-muted">
          Expected delivery by {tracking.deliveryWindow}
        </p>
        <p className="text-body-md text-text-muted">
          Order{" "}
          <span className="font-semibold text-text-primary">
            #{tracking.orderNumber}
          </span>
        </p>
      </header>

      {/* Timeline */}
      <div className="mt-10">
        <TrackingTimeline
          stages={tracking.stages}
          progressPercent={tracking.progressPercent}
        />
      </div>

      {/* Map + details */}
      <section className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MiniMap />
          <Card className="mt-6 p-6">
            <div className="flex items-start gap-3">
              <span className="material-symbols mt-0.5 text-accent">info</span>
              <div>
                <p className="font-label-sm uppercase tracking-wider text-text-muted">
                  Latest update
                </p>
                <p className="mt-1 font-h4 text-h4 text-text-primary">
                  {tracking.latestUpdate.title}
                </p>
                <p className="mt-1 text-body-md text-text-muted">
                  {tracking.latestUpdate.detail}
                </p>
                <p className="mt-2 text-[13px] text-text-muted">
                  {tracking.latestUpdate.time}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card className="p-6">
            <h3 className="font-h4 text-h4 text-text-primary">Carrier Details</h3>
            <div className="mt-4 flex items-center gap-4 border-b border-outline-variant/20 pb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-lime/15 text-accent">
                <span className="material-symbols">local_shipping</span>
              </div>
              <div>
                <p className="font-label-sm text-text-primary">
                  {tracking.carrier.name}
                </p>
                <p className="text-[13px] text-text-muted">
                  Tracking: #{tracking.carrier.tracking}
                </p>
              </div>
            </div>
            <div className="pt-4">
              <Button variant="outline" className="w-full">
                Contact Courier
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-h4 text-h4 text-text-primary">Items</h3>
            <div className="mt-4 space-y-4">
              {tracking.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 border-b border-outline-variant/20 pb-4 last:border-0 last:pb-0"
                >
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-deep-surface">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-text-muted">
                        <span className="material-symbols text-2xl">image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-label-sm text-text-primary">{item.name}</p>
                    <p className="text-[13px] text-text-muted">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-text-primary">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between border-t border-outline-variant/20 pt-4">
              <span className="font-label-sm text-text-muted">Order Total</span>
              <span className="font-h4 text-h4 text-accent">
                ${tracking.total.toFixed(2)}
              </span>
            </div>
          </Card>
        </div>
      </section>

      {/* Actions */}
      <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
        <Link to="/marketplace" className="w-full sm:w-auto">
          <Button size="lg" className="w-full px-8 py-4">
            <span className="material-symbols text-[18px]">storefront</span>
            Continue Shopping
          </Button>
        </Link>
        <Link to="/support" className="w-full sm:w-auto">
          <Button variant="secondary" size="lg" className="w-full px-8 py-4 sm:w-auto">
            <span className="material-symbols text-[18px]">support_agent</span>
            Support
          </Button>
        </Link>
      </div>

      <p className="mt-6 text-[13px] text-text-muted">
        This is a simulated tracking preview. Live carrier updates will be
        available once backend tracking is connected.
      </p>
    </div>
  );
}
