import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import Button from "../components/ui/Button.jsx";

function CartItem({ item, onIncrement, onDecrement, onRemove }) {
  return (
    <div className="relative rounded-2xl border border-outline-variant/20 bg-surface p-4 shadow-sm transition-shadow hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] md:p-6">
      <div className="hidden md:block absolute -left-[20px] top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-lime shadow-[0_0_8px_rgba(184,243,74,0.8)]" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        <div className="h-40 w-full overflow-hidden rounded-xl bg-deep-surface sm:h-40 sm:w-40 flex-shrink-0">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-text-muted">
              <span className="material-symbols text-5xl">image</span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col justify-between gap-4 py-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-h4 text-h4 text-text-primary">{item.name}</h3>
              {item.category ? (
                <p className="mt-1 text-body-md text-text-muted">
                  {item.category}
                </p>
              ) : null}
            </div>
            <p className="font-h4 text-h4 text-accent whitespace-nowrap">
              ${item.price.toFixed(2)}
            </p>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center rounded-full border border-outline-variant/30 bg-surface-low p-1">
              <button
                onClick={onDecrement}
                className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:text-accent hover:bg-surface-high"
                aria-label="Decrease quantity"
              >
                <span className="material-symbols text-[18px]">remove</span>
              </button>
              <span className="w-8 text-center font-semibold text-text-primary">
                {item.quantity}
              </span>
              <button
                onClick={onIncrement}
                className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:text-accent hover:bg-surface-high"
                aria-label="Increase quantity"
              >
                <span className="material-symbols text-[18px]">add</span>
              </button>
            </div>

            <button
              onClick={onRemove}
              className="flex items-center justify-center rounded-full p-2 text-text-muted transition-colors hover:text-red-400 hover:bg-red-500/10"
              aria-label="Remove item"
            >
              <span className="material-symbols">delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderSummary({ subtotal, total }) {
  return (
    <div className="rounded-2xl border border-outline-variant/20 bg-surface p-6 shadow-sm lg:p-8 lg:sticky lg:top-32">
      <h2 className="font-h3 text-h3 text-text-primary border-b border-outline-variant/20 pb-4">
        Order Summary
      </h2>

      <div className="mt-6 flex flex-col gap-4">
        <div className="flex justify-between text-body-md text-text-muted">
          <span>Subtotal</span>
          <span className="text-text-primary">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-body-md text-text-muted">
          <span>Estimated Shipping</span>
          <span className="text-text-primary">Complimentary</span>
        </div>
        <div className="flex justify-between text-body-md text-text-muted">
          <span>Tax</span>
          <span className="text-text-primary">Calculated at checkout</span>
        </div>
      </div>

      <div className="mt-6 flex justify-between items-center border-t border-outline-variant/20 pt-4">
        <span className="font-h4 text-h4 text-text-primary">Total</span>
        <span className="font-h2 text-h2 text-accent">${total.toFixed(2)}</span>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        <Link to="/checkout">
          <Button className="w-full py-4">
            Proceed to Checkout
            <span className="material-symbols text-[20px]">arrow_forward</span>
          </Button>
        </Link>
        <div className="flex items-center justify-center gap-2 text-text-muted text-sm">
          <span className="material-symbols text-[16px]">lock</span>
          Secure encrypted checkout
        </div>
      </div>
    </div>
  );
}

export default function Cart() {
  const { items, removeItem, increment, decrement, totalItems, subtotal } =
    useCart();
  const total = subtotal;

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
          Looks like you haven't added anything to your cart yet. Start
          exploring and discover something you love.
        </p>
        <Link to="/marketplace">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-h1 text-text-primary">Your Cart</h1>
          <p className="mt-2 text-body-lg text-text-muted">
            {totalItems} {totalItems === 1 ? "item" : "items"} ready for
            discovery.
          </p>
        </div>
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-2 text-label-sm text-text-muted transition-colors hover:text-accent"
        >
          <span className="material-symbols text-[18px]">arrow_back</span>
          Continue Shopping
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        <div className="w-full lg:w-2/3">
          <div className="relative flex flex-col gap-6 md:pl-10">
            <div className="hidden md:block absolute left-5 top-8 bottom-8 w-px bg-gradient-to-b from-transparent via-outline-variant/30 to-transparent" />

            {items.map((item) => (
              <div key={item.id} className="relative">
                <CartItem
                  item={item}
                  onIncrement={() => increment(item.id)}
                  onDecrement={() => decrement(item.id)}
                  onRemove={() => removeItem(item.id)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="w-full lg:w-1/3">
          <OrderSummary subtotal={subtotal} total={total} />
        </div>
      </div>
    </div>
  );
}
