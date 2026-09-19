import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import Button from "../components/ui/Button.jsx";
import { createOrder } from "../services/api/order.js";

const DELIVERY_OPTIONS = [
  {
    id: "standard",
    label: "Standard Delivery",
    price: 0,
    description: "5-7 business days",
  },
  {
    id: "express",
    label: "Express Delivery",
    price: 25,
    description: "2-3 business days",
  },
];

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-sm text-red-400">{message}</p>;
}

function CheckoutSummary({ subtotal, shipping, total, items }) {
  return (
    <div className="rounded-2xl border border-outline-variant/20 bg-surface p-6 shadow-sm lg:p-8 lg:sticky lg:top-32">
      <h2 className="font-h3 text-h3 text-text-primary border-b border-outline-variant/20 pb-4">
        Order Summary
      </h2>

      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-4">
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-deep-surface">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-text-muted">
                  <span className="material-symbols text-4xl">image</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-label-sm text-label-sm text-text-primary">
                {item.name}
              </h3>
              <p className="mt-1 text-body-md text-text-muted">
                Qty: {item.quantity}
              </p>
              <p className="mt-1 font-semibold text-text-primary">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex justify-between text-body-md text-text-muted">
          <span>Subtotal</span>
          <span className="text-text-primary">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-body-md text-text-muted">
          <span>Shipping</span>
          <span className="text-text-primary">
            {shipping === 0 ? "Complimentary" : `$${shipping.toFixed(2)}`}
          </span>
        </div>
      </div>

      <div className="mt-6 flex justify-between items-center border-t border-outline-variant/20 pt-4">
        <span className="font-h4 text-h4 text-text-primary">Total</span>
        <div className="text-right">
          <span className="font-body-md text-body-md text-text-muted text-sm block">
            USD
          </span>
          <span className="font-h3 text-h3 text-accent">${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-text-muted text-sm">
        <span className="material-symbols text-[16px]">lock</span>
        Secure encrypted checkout
      </div>
    </div>
  );
}

export default function Checkout() {
  const { items, subtotal, loading, refresh } = useCart();
  const navigate = useNavigate();
  const [deliveryId, setDeliveryId] = useState("standard");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [form, setForm] = useState({
    email: "",
    phone: "",
    fullName: "",
    address: "",
    city: "",
    region: "",
    postalCode: "",
    country: "",
  });

  const shipping = DELIVERY_OPTIONS.find((o) => o.id === deliveryId)?.price ?? 0;
  const total = subtotal + shipping;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-lime border-t-transparent" />
        <p className="text-body-lg text-text-muted">Preparing your checkout...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  const validate = () => {
    const next = {};
    if (!form.email.trim()) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = "Enter a valid email";
    if (!form.fullName.trim()) next.fullName = "Full name is required";
    if (!form.address.trim()) next.address = "Address is required";
    if (!form.city.trim()) next.city = "City is required";
    if (!form.region.trim()) next.region = "State/Region is required";
    if (!form.postalCode.trim()) next.postalCode = "Postal code is required";
    if (!form.country.trim()) next.country = "Country is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate() || submitting) return;

    setSubmitting(true);
    setOrderError(null);

    const delivery = DELIVERY_OPTIONS.find((o) => o.id === deliveryId);

    try {
      const order = await createOrder({
        email: form.email.trim(),
        fullName: form.fullName.trim(),
        phoneNumber: form.phone.trim(),
        shippingAddress: form.address.trim(),
        shippingCity: form.city.trim(),
        shippingRegion: form.region.trim(),
        shippingPostalCode: form.postalCode.trim(),
        shippingCountry: form.country.trim(),
        deliveryMethod: deliveryId,
        deliveryDescription: delivery?.description || "",
      });

      await refresh();
      navigate("/order-confirmed/" + order.order_number, {
        state: { order },
        replace: true,
      });
    } catch (err) {
      const code = err?.data?.code;
      if (code === "empty_cart") {
        setOrderError("Your cart is empty. Please add items before checking out.");
      } else if (code === "product_unavailable") {
        setOrderError(
          err?.data?.detail ||
            "One or more items in your cart are no longer available."
        );
      } else if (code === "insufficient_stock") {
        setOrderError(
          err?.data?.detail ||
            "Stock has changed for one or more items. Please review your cart."
        );
      } else if (err?.status === 401) {
        setOrderError("Your session has expired. Please log in again.");
      } else {
        setOrderError(
          err?.message || "Something went wrong. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const update = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setOrderError(null);
  };

  return (
    <div>
      <div className="mb-12">
        <h1 className="font-display text-h1 text-text-primary">Secure Checkout</h1>
        <p className="mt-2 text-body-lg text-text-muted">
          Complete your purchase securely.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="w-full lg:col-span-7 space-y-10">
          <div className="flex items-center gap-2 rounded-2xl border border-outline-variant/20 bg-surface p-4 shadow-sm">
            <span className="material-symbols text-accent">lock</span>
            <span className="font-label-sm text-label-sm text-text-primary">
              Secure Checkout
            </span>
            <span className="text-body-md text-text-muted">
              All transactions are encrypted and protected.
            </span>
          </div>

          {orderError && (
            <div className="rounded-xl border border-red-400/30 bg-red-400/5 p-4 flex items-start gap-3">
              <span className="material-symbols mt-0.5 text-[20px] text-red-400">
                error
              </span>
              <p className="text-body-md text-red-400">{orderError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">
            <section className="rounded-2xl border border-outline-variant/20 bg-surface p-6 shadow-sm lg:p-8 space-y-6">
              <div>
                <h2 className="font-h3 text-h3 text-text-primary">
                  Contact Information
                </h2>
                <p className="mt-1 text-body-md text-text-muted">
                  We will send order updates here.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="font-label-sm text-label-sm text-text-primary block">
                    Email
                  </label>
                  <input
                    value={form.email}
                    onChange={update("email")}
                    placeholder="you@example.com"
                    className="mt-2 w-full rounded-xl border border-outline-variant/30 bg-surface-low px-4 py-3 font-body-md text-text-primary outline-none transition-all placeholder:text-text-muted/60 focus:border-lime"
                    type="email"
                    disabled={submitting}
                  />
                  <FieldError message={errors.email} />
                </div>
                <div className="md:col-span-2">
                  <label className="font-label-sm text-label-sm text-text-primary block">
                    Phone
                  </label>
                  <input
                    value={form.phone}
                    onChange={update("phone")}
                    placeholder="+1 (555) 000-0000"
                    className="mt-2 w-full rounded-xl border border-outline-variant/30 bg-surface-low px-4 py-3 font-body-md text-text-primary outline-none transition-all placeholder:text-text-muted/60 focus:border-lime"
                    type="tel"
                    disabled={submitting}
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-outline-variant/20 bg-surface p-6 shadow-sm lg:p-8 space-y-6">
              <div>
                <h2 className="font-h3 text-h3 text-text-primary">
                  Shipping Address
                </h2>
                <p className="mt-1 text-body-md text-text-muted">
                  Where should we deliver your order?
                </p>
              </div>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="font-label-sm text-label-sm text-text-primary block">
                    Full Name
                  </label>
                  <input
                    value={form.fullName}
                    onChange={update("fullName")}
                    placeholder="Jane Doe"
                    className="mt-2 w-full rounded-xl border border-outline-variant/30 bg-surface-low px-4 py-3 font-body-md text-text-primary outline-none transition-all placeholder:text-text-muted/60 focus:border-lime"
                    disabled={submitting}
                  />
                  <FieldError message={errors.fullName} />
                </div>
                <div>
                  <label className="font-label-sm text-label-sm text-text-primary block">
                    Address
                  </label>
                  <input
                    value={form.address}
                    onChange={update("address")}
                    placeholder="123 Main Street, Apt 4B"
                    className="mt-2 w-full rounded-xl border border-outline-variant/30 bg-surface-low px-4 py-3 font-body-md text-text-primary outline-none transition-all placeholder:text-text-muted/60 focus:border-lime"
                    disabled={submitting}
                  />
                  <FieldError message={errors.address} />
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="font-label-sm text-label-sm text-text-primary block">
                      City
                    </label>
                    <input
                      value={form.city}
                      onChange={update("city")}
                      placeholder="San Francisco"
                      className="mt-2 w-full rounded-xl border border-outline-variant/30 bg-surface-low px-4 py-3 font-body-md text-text-primary outline-none transition-all placeholder:text-text-muted/60 focus:border-lime"
                      disabled={submitting}
                    />
                    <FieldError message={errors.city} />
                  </div>
                  <div>
                    <label className="font-label-sm text-label-sm text-text-primary block">
                      State / Region
                    </label>
                    <input
                      value={form.region}
                      onChange={update("region")}
                      placeholder="CA"
                      className="mt-2 w-full rounded-xl border border-outline-variant/30 bg-surface-low px-4 py-3 font-body-md text-text-primary outline-none transition-all placeholder:text-text-muted/60 focus:border-lime"
                      disabled={submitting}
                    />
                    <FieldError message={errors.region} />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="font-label-sm text-label-sm text-text-primary block">
                      Postal Code
                    </label>
                    <input
                      value={form.postalCode}
                      onChange={update("postalCode")}
                      placeholder="94103"
                      className="mt-2 w-full rounded-xl border border-outline-variant/30 bg-surface-low px-4 py-3 font-body-md text-text-primary outline-none transition-all placeholder:text-text-muted/60 focus:border-lime"
                      disabled={submitting}
                    />
                    <FieldError message={errors.postalCode} />
                  </div>
                  <div>
                    <label className="font-label-sm text-label-sm text-text-primary block">
                      Country
                    </label>
                    <input
                      value={form.country}
                      onChange={update("country")}
                      placeholder="United States"
                      className="mt-2 w-full rounded-xl border border-outline-variant/30 bg-surface-low px-4 py-3 font-body-md text-text-primary outline-none transition-all placeholder:text-text-muted/60 focus:border-lime"
                      disabled={submitting}
                    />
                    <FieldError message={errors.country} />
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-outline-variant/20 bg-surface p-6 shadow-sm lg:p-8 space-y-6">
              <div>
                <h2 className="font-h3 text-h3 text-text-primary">Delivery</h2>
                <p className="mt-1 text-body-md text-text-muted">
                  Choose a delivery speed.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {DELIVERY_OPTIONS.map((option) => (
                  <label
                    key={option.id}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-4 transition-colors ${
                      deliveryId === option.id
                        ? "border-lime bg-surface-low"
                        : "border-outline-variant/30 hover:border-outline-variant"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="delivery"
                        value={option.id}
                        checked={deliveryId === option.id}
                        onChange={() => setDeliveryId(option.id)}
                        className="h-4 w-4 border-outline-variant text-accent focus:ring-lime"
                        disabled={submitting}
                      />
                      <div>
                        <p className="font-label-sm text-label-sm text-text-primary">
                          {option.label}
                        </p>
                        <p className="text-body-md text-text-muted">
                          {option.description}
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-text-primary">
                      {option.price === 0 ? "Free" : `$${option.price}`}
                    </span>
                  </label>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-outline-variant/20 bg-surface p-6 shadow-sm lg:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-h3 text-h3 text-text-primary">
                    Payment
                  </h2>
                  <p className="mt-1 text-body-md text-text-muted">
                    Payment integration coming soon.
                  </p>
                </div>
                <span className="material-symbols text-accent">lock</span>
              </div>
            </section>

            <div className="flex flex-col-reverse items-center justify-between gap-4 sm:flex-row">
              <Link
                to="/cart"
                className="inline-flex items-center gap-2 text-label-sm text-text-muted transition-colors hover:text-accent"
              >
                <span className="material-symbols text-[18px]">arrow_back</span>
                Return to Cart
              </Link>
              <Button
                type="submit"
                className="w-full sm:w-auto px-8 py-4"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-obsidian border-t-transparent" />
                    Processing...
                  </>
                ) : (
                  <>
                    <span className="material-symbols text-[18px]">lock</span>
                    Place Order
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        <div className="w-full lg:col-span-5">
          <CheckoutSummary
            items={items}
            subtotal={subtotal}
            shipping={shipping}
            total={total}
          />
        </div>
      </div>
    </div>
  );
}
