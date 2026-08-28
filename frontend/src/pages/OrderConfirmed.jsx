import React from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button.jsx";

export default function OrderConfirmed() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
      <span className="material-symbols text-6xl text-accent">check_circle</span>
      <h1 className="font-display text-h2 text-text-primary">
        Order Confirmed
      </h1>
      <p className="text-body-lg text-text-muted max-w-md">
        Thank you for your purchase. This is a frontend placeholder for the
        order confirmation page.
      </p>
      <Link to="/marketplace">
        <Button>Continue Shopping</Button>
      </Link>
    </div>
  );
}
