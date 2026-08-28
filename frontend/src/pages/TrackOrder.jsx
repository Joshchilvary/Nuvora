import React from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button.jsx";

export default function TrackOrder() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
      <span className="material-symbols text-6xl text-accent">track_changes</span>
      <h1 className="font-display text-h2 text-text-primary">Order Tracking</h1>
      <p className="max-w-md text-body-lg text-text-muted">
        Real-time shipment tracking is coming soon. Once your order ships you will be able
        to follow its atmospheric journey here.
      </p>
      <Link to="/marketplace">
        <Button>Continue Shopping</Button>
      </Link>
    </div>
  );
}
