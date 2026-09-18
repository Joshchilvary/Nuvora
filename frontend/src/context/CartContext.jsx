import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import {
  getCart,
  addToCart as apiAddToCart,
  updateCartItem as apiUpdateCartItem,
  removeCartItem as apiRemoveCartItem,
  clearCart as apiClearCart,
} from "../services/api/cart.js";

const CartContext = createContext(null);

const GUEST_CART_KEY = "nuvora-cart";

const GUEST_QTY_MAX = 999;

// ---------------------------------------------------------------------------
// Guest cart localStorage helpers
// ---------------------------------------------------------------------------

function readGuestCart() {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const items = Array.isArray(parsed?.items) ? parsed.items : [];
    return items.filter((item) => {
      if (typeof item.productId !== "number") return false;
      if (typeof item.quantity !== "number") return false;
      if (item.quantity < 1) return false;
      if (item.quantity > GUEST_QTY_MAX) return false;
      return true;
    });
  } catch {
    return [];
  }
}

function writeGuestCart(guestItems) {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify({ items: guestItems }));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

function removeGuestCart() {
  try {
    localStorage.removeItem(GUEST_CART_KEY);
  } catch {
    // ignore
  }
}

function mapGuestItemsToUI(guestItems) {
  return guestItems.map((item) => ({
    id: item.productId,
    name: item.name || "",
    price: Number(item.price) || 0,
    image: item.image || "",
    category: item.category || "",
    quantity: item.quantity,
  }));
}

// ---------------------------------------------------------------------------
// Backend cart mapping (unchanged from Phase 6B)
// ---------------------------------------------------------------------------

function mapBackendItem(item) {
  const product = item.product || {};
  const primaryImage = product.primary_image;
  const images = product.images;
  let image = "";
  if (primaryImage && primaryImage.image) {
    image = primaryImage.image;
  } else if (Array.isArray(images) && images.length > 0 && images[0].image) {
    image = images[0].image;
  }
  return {
    id: product.id,
    name: product.name || "",
    price: Number(item.unit_price) || 0,
    image,
    category: product.category?.slug || "",
    quantity: item.quantity,
  };
}

function mapBackendCart(data) {
  if (!data) return { items: [], subtotal: 0, totalItems: 0 };
  const items = Array.isArray(data.items) ? data.items.map(mapBackendItem) : [];
  const subtotal = Number(data.subtotal) || 0;
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  return { items, subtotal, totalItems };
}

// ---------------------------------------------------------------------------
// CartProvider
// ---------------------------------------------------------------------------

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const inflightRef = useRef(new Set());
  const itemsRef = useRef(items);
  itemsRef.current = items;

  // --- Merge guards ----------------------------------------------------------

  const wasAuthenticatedRef = useRef(isAuthenticated);
  const mergeRef = useRef(false);

  // --- Backend cart apply (unchanged) ----------------------------------------

  const applyCart = useCallback((data) => {
    const mapped = mapBackendCart(data);
    setItems(mapped.items);
    setSubtotal(mapped.subtotal);
    setTotalItems(mapped.totalItems);
    setError(null);
  }, []);

  // --- Guest cart apply ------------------------------------------------------

  const applyGuestCart = useCallback((guestItems) => {
    const uiItems = mapGuestItemsToUI(guestItems);
    const newSubtotal = uiItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const newTotalItems = uiItems.reduce((sum, item) => sum + item.quantity, 0);
    setItems(uiItems);
    setSubtotal(newSubtotal);
    setTotalItems(newTotalItems);
    setError(null);
  }, []);

  // --- refresh (manual use only — not auto-triggered by auth transitions) -----

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      applyGuestCart(readGuestCart());
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getCart();
      applyCart(data);
    } catch (err) {
      setError(err?.message || "Failed to load cart");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, applyCart, applyGuestCart]);

  // --- Guest cart merge on login ---------------------------------------------

  const mergeGuestCartRef = useRef(null);
  mergeGuestCartRef.current = async () => {
    const guestItems = readGuestCart();

    if (guestItems.length === 0) {
      setLoading(true);
      try {
        const data = await getCart();
        applyCart(data);
      } catch (err) {
        setError(err?.message || "Failed to load cart");
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    setError(null);

    const succeeded = [];
    const failed = [];

    for (const item of guestItems) {
      try {
        await apiAddToCart(item.productId, item.quantity);
        succeeded.push(item);
      } catch {
        failed.push(item);
      }
    }

    try {
      const data = await getCart();
      applyCart(data);
    } catch {
      // Backend refresh failed — still clean up successful guest items
    }

    if (failed.length > 0) {
      writeGuestCart(failed);
      const failedNames = failed.map((i) => i.name).filter(Boolean);
      setError(
        failedNames.length > 0
          ? `Some items couldn't be added: ${failedNames.join(", ")}. Your other items were added.`
          : "Some items couldn't be added to your cart. Your other items were added."
      );
    } else {
      removeGuestCart();
    }

    setLoading(false);
  };

  // --- Auth transition: single controlled workflow ---------------------------

  const didInitRef = useRef(false);

  useEffect(() => {
    const wasAuthenticated = wasAuthenticatedRef.current;

    if (!didInitRef.current) {
      didInitRef.current = true;
      if (isAuthenticated) {
        setLoading(true);
        getCart()
          .then((data) => applyCart(data))
          .catch((err) => setError(err?.message || "Failed to load cart"))
          .finally(() => setLoading(false));
      } else {
        applyGuestCart(readGuestCart());
      }
    } else if (!wasAuthenticated && isAuthenticated) {
      mergeRef.current = true;
      mergeGuestCartRef.current().finally(() => {
        mergeRef.current = false;
      });
    } else if (wasAuthenticated && !isAuthenticated) {
      removeGuestCart();
      setItems([]);
      setSubtotal(0);
      setTotalItems(0);
      setError(null);
    }

    wasAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated, applyCart, applyGuestCart]);

  // --- addItem ---------------------------------------------------------------

  const addItem = useCallback(
    async (productOrId, quantity = 1, productData = null) => {
      const productId = typeof productOrId === "object" ? productOrId.id : productOrId;
      if (!productId) return { ok: false, code: "invalid_id" };

      // --- Guest mode --------------------------------------------------------
      if (!isAuthenticated) {
        if (!productData) {
          return {
            ok: false,
            code: "missing_product_data",
            error: "Product information is required for guest cart.",
          };
        }
        if (inflightRef.current.has(`add-${productId}`)) {
          return { ok: false, code: "in_flight" };
        }
        inflightRef.current.add(`add-${productId}`);
        try {
          const guestItems = readGuestCart();
          const existing = guestItems.find((i) => i.productId === productId);
          if (existing) {
            existing.quantity = Math.min(existing.quantity + quantity, GUEST_QTY_MAX);
          } else {
            guestItems.push({
              productId,
              quantity: Math.min(quantity, GUEST_QTY_MAX),
              name: productData.name || "",
              price: Number(productData.price) || 0,
              image: productData.image || "",
              category: productData.category || "",
            });
          }
          writeGuestCart(guestItems);
          applyGuestCart(guestItems);
          return { ok: true };
        } catch {
          return { ok: false, code: "error", error: new Error("Failed to add item to guest cart") };
        } finally {
          inflightRef.current.delete(`add-${productId}`);
        }
      }

      // --- Merge guard -------------------------------------------------------
      if (mergeRef.current) {
        return { ok: false, code: "merging", error: "Cart is being synchronized." };
      }

      // --- Authenticated mode (unchanged) ------------------------------------
      if (inflightRef.current.has(`add-${productId}`)) {
        return { ok: false, code: "in_flight" };
      }
      inflightRef.current.add(`add-${productId}`);
      try {
        const data = await apiAddToCart(productId, quantity);
        applyCart(data);
        return { ok: true };
      } catch (err) {
        setError(err?.message || "Failed to add item to cart");
        return { ok: false, code: "error", error: err };
      } finally {
        inflightRef.current.delete(`add-${productId}`);
      }
    },
    [isAuthenticated, applyCart, applyGuestCart]
  );

  // --- increment ------------------------------------------------------------

  const increment = useCallback(
    async (productId) => {
      if (!productId) return { ok: false, code: "invalid_id" };

      // --- Guest mode --------------------------------------------------------
      if (!isAuthenticated) {
        const guestItems = readGuestCart();
        const existing = guestItems.find((i) => i.productId === productId);
        if (!existing) return { ok: false, code: "not_in_cart" };
        existing.quantity = Math.min(existing.quantity + 1, GUEST_QTY_MAX);
        writeGuestCart(guestItems);
        applyGuestCart(guestItems);
        return { ok: true };
      }

      // --- Merge guard -------------------------------------------------------
      if (mergeRef.current) {
        return { ok: false, code: "merging", error: "Cart is being synchronized." };
      }

      // --- Authenticated mode (unchanged) ------------------------------------
      const current = itemsRef.current.find((item) => item.id === productId);
      if (!current) return { ok: false, code: "not_in_cart" };
      const newQty = current.quantity + 1;
      if (inflightRef.current.has(`qty-${productId}`)) {
        return { ok: false, code: "in_flight" };
      }
      inflightRef.current.add(`qty-${productId}`);
      try {
        const data = await apiUpdateCartItem(productId, newQty);
        applyCart(data);
        return { ok: true };
      } catch (err) {
        setError(err?.message || "Failed to update quantity");
        return { ok: false, code: "error", error: err };
      } finally {
        inflightRef.current.delete(`qty-${productId}`);
      }
    },
    [isAuthenticated, applyCart, applyGuestCart]
  );

  // --- decrement ------------------------------------------------------------

  const decrement = useCallback(
    async (productId) => {
      if (!productId) return { ok: false, code: "invalid_id" };

      // --- Guest mode --------------------------------------------------------
      if (!isAuthenticated) {
        const guestItems = readGuestCart();
        const existing = guestItems.find((i) => i.productId === productId);
        if (!existing) return { ok: false, code: "not_in_cart" };
        if (existing.quantity <= 1) {
          const filtered = guestItems.filter((i) => i.productId !== productId);
          writeGuestCart(filtered);
          applyGuestCart(filtered);
          return { ok: true };
        }
        existing.quantity -= 1;
        writeGuestCart(guestItems);
        applyGuestCart(guestItems);
        return { ok: true };
      }

      // --- Merge guard -------------------------------------------------------
      if (mergeRef.current) {
        return { ok: false, code: "merging", error: "Cart is being synchronized." };
      }

      // --- Authenticated mode (unchanged) ------------------------------------
      const current = itemsRef.current.find((item) => item.id === productId);
      if (!current) return { ok: false, code: "not_in_cart" };
      if (current.quantity <= 1) return { ok: true };
      const newQty = current.quantity - 1;
      if (inflightRef.current.has(`qty-${productId}`)) {
        return { ok: false, code: "in_flight" };
      }
      inflightRef.current.add(`qty-${productId}`);
      try {
        const data = await apiUpdateCartItem(productId, newQty);
        applyCart(data);
        return { ok: true };
      } catch (err) {
        setError(err?.message || "Failed to update quantity");
        return { ok: false, code: "error", error: err };
      } finally {
        inflightRef.current.delete(`qty-${productId}`);
      }
    },
    [isAuthenticated, applyCart, applyGuestCart]
  );

  // --- removeItem ------------------------------------------------------------

  const removeItem = useCallback(
    async (productId) => {
      if (!productId) return { ok: false, code: "invalid_id" };

      // --- Guest mode --------------------------------------------------------
      if (!isAuthenticated) {
        const guestItems = readGuestCart();
        const filtered = guestItems.filter((i) => i.productId !== productId);
        writeGuestCart(filtered);
        applyGuestCart(filtered);
        return { ok: true };
      }

      // --- Merge guard -------------------------------------------------------
      if (mergeRef.current) {
        return { ok: false, code: "merging", error: "Cart is being synchronized." };
      }

      // --- Authenticated mode (unchanged) ------------------------------------
      if (inflightRef.current.has(`remove-${productId}`)) {
        return { ok: false, code: "in_flight" };
      }
      inflightRef.current.add(`remove-${productId}`);
      try {
        const data = await apiRemoveCartItem(productId);
        applyCart(data);
        return { ok: true };
      } catch (err) {
        setError(err?.message || "Failed to remove item from cart");
        return { ok: false, code: "error", error: err };
      } finally {
        inflightRef.current.delete(`remove-${productId}`);
      }
    },
    [isAuthenticated, applyCart, applyGuestCart]
  );

  // --- clear -----------------------------------------------------------------

  const clear = useCallback(
    async () => {
      // --- Guest mode --------------------------------------------------------
      if (!isAuthenticated) {
        removeGuestCart();
        setItems([]);
        setSubtotal(0);
        setTotalItems(0);
        setError(null);
        return { ok: true };
      }

      // --- Merge guard -------------------------------------------------------
      if (mergeRef.current) {
        return { ok: false, code: "merging", error: "Cart is being synchronized." };
      }

      // --- Authenticated mode (unchanged) ------------------------------------
      if (inflightRef.current.has("clear")) {
        return { ok: false, code: "in_flight" };
      }
      inflightRef.current.add("clear");
      try {
        const data = await apiClearCart();
        applyCart(data);
        return { ok: true };
      } catch (err) {
        setError(err?.message || "Failed to clear cart");
        return { ok: false, code: "error", error: err };
      } finally {
        inflightRef.current.delete("clear");
      }
    },
    [isAuthenticated, applyCart]
  );

  const total = subtotal;

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      increment,
      decrement,
      clear,
      totalItems,
      subtotal,
      total,
      loading,
      error,
      refresh,
    }),
    [items, addItem, removeItem, increment, decrement, clear, totalItems, subtotal, total, loading, error, refresh]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
