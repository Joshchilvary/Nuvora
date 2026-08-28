import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import Button from "../components/ui/Button.jsx";
import { buildOrder, saveLastOrder } from "../lib/order.js";

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
        <div className="flex justify-between text-body-md text-text-muted">
          <span>Estimated Tax</span>
          <span className="text-text-primary">Calculated at checkout</span>
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
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [deliveryId, setDeliveryId] = useState("express");
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    email: "",
    phone: "",
    fullName: "",
    address: "",
    city: "",
    region: "",
    postalCode: "",
    country: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
    cardholderName: "",
    sameAddress: true,
  });

  const shipping = DELIVERY_OPTIONS.find((o) => o.id === deliveryId)?.price ?? 0;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
        <span className="material-symbols text-6xl text-text-muted">
          shopping_cart
        </span>
        <h1 className="font-display text-h2 text-text-primary">
          Your cart is empty
        </h1>
        <p className="text-body-lg text-text-muted max-w-md">
          Add items to your cart before checking out.
        </p>
        <Link to="/marketplace">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
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
    if (!form.cardNumber.trim()) next.cardNumber = "Card number is required";
    else if (!/^\d{4} ?\d{4} ?\d{4} ?\d{4}$/.test(form.cardNumber.replace(/\s/g, "")))
      next.cardNumber = "Enter a valid 16-digit card number";
    if (!form.expiry.trim()) next.expiry = "Expiry is required";
    else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(form.expiry))
      next.expiry = "Use MM/YY format";
    if (!form.cvc.trim()) next.cvc = "CVC is required";
    else if (!/^\d{3,4}$/.test(form.cvc)) next.cvc = "Enter a valid CVC";
    if (!form.cardholderName.trim())
      next.cardholderName = "Cardholder name is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;
    const delivery = DELIVERY_OPTIONS.find((o) => o.id === deliveryId);
    const order = buildOrder({
      items,
      subtotal,
      shipping,
      total,
      deliveryId,
      delivery,
      form,
    });
    saveLastOrder(order);
    clear();
    navigate("/order-confirmed", { state: { order } });
  };

  const update = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
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
                    All transactions are secure and encrypted.
                  </p>
                </div>
                <span className="material-symbols text-accent">lock</span>
              </div>

              <div className="flex items-center gap-4 border-b border-outline-variant/20 pb-4">
                <button
                  type="button"
                  className="flex items-center gap-2 border-b-2 border-lime pb-4 text-label-sm font-semibold text-text-primary -mb-[17px]"
                >
                  <span className="material-symbols text-lg">credit_card</span>
                  Credit Card
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 pb-4 text-label-sm text-text-muted transition-colors hover:text-text-primary"
                >
                  <span className="material-symbols text-lg">account_balance_wallet</span>
                  Digital Wallet
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="font-label-sm text-label-sm text-text-primary block">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      value={form.cardNumber}
                      onChange={update("cardNumber")}
                      placeholder="0000 0000 0000 0000"
                      className="w-full rounded-xl border border-outline-variant/30 bg-surface-low pl-10 pr-4 py-3 font-body-md text-text-primary outline-none transition-all placeholder:text-text-muted/60 focus:border-lime"
                    />
                    <span className="material-symbols absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                      credit_card
                    </span>
                  </div>
                  <FieldError message={errors.cardNumber} />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-label-sm text-label-sm text-text-primary block">
                      Expiration Date
                    </label>
                    <input
                      value={form.expiry}
                      onChange={update("expiry")}
                      placeholder="MM/YY"
                      className="w-full rounded-xl border border-outline-variant/30 bg-surface-low px-4 py-3 font-body-md text-text-primary outline-none transition-all placeholder:text-text-muted/60 focus:border-lime"
                    />
                    <FieldError message={errors.expiry} />
                  </div>
                  <div className="space-y-2">
                    <label className="font-label-sm text-label-sm text-text-primary block">
                      CVC
                    </label>
                    <div className="relative">
                      <input
                        value={form.cvc}
                        onChange={update("cvc")}
                        placeholder="123"
                        className="w-full rounded-xl border border-outline-variant/30 bg-surface-low px-4 py-3 font-body-md text-text-primary outline-none transition-all placeholder:text-text-muted/60 focus:border-lime"
                      />
                      <span className="material-symbols absolute right-3 top-1/2 -translate-y-1/2 text-text-muted cursor-help text-sm">
                        help
                      </span>
                    </div>
                    <FieldError message={errors.cvc} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-label-sm text-label-sm text-text-primary block">
                    Cardholder Name
                  </label>
                  <input
                    value={form.cardholderName}
                    onChange={update("cardholderName")}
                    placeholder="Name on card"
                    className="w-full rounded-xl border border-outline-variant/30 bg-surface-low px-4 py-3 font-body-md text-text-primary outline-none transition-all placeholder:text-text-muted/60 focus:border-lime"
                  />
                  <FieldError message={errors.cardholderName} />
                </div>

                <label className="flex items-start gap-3 pt-2">
                  <input
                    type="checkbox"
                    checked={form.sameAddress}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, sameAddress: event.target.checked }))
                    }
                    className="mt-1 h-4 w-4 rounded border-outline-variant text-accent focus:ring-lime"
                  />
                  <span className="text-body-md text-text-muted">
                    Billing address is same as delivery address
                  </span>
                </label>
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
              <Button type="submit" className="w-full sm:w-auto px-8 py-4">
                <span className="material-symbols text-[18px]">lock</span>
                Place Order
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
