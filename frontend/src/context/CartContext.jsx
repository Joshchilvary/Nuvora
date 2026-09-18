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

  const applyCart = useCallback((data) => {
    const mapped = mapBackendCart(data);
    setItems(mapped.items);
    setSubtotal(mapped.subtotal);
    setTotalItems(mapped.totalItems);
    setError(null);
  }, []);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      setSubtotal(0);
      setTotalItems(0);
      setError(null);
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
  }, [isAuthenticated, applyCart]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = useCallback(
    async (productOrId, quantity = 1) => {
      if (!isAuthenticated) return { ok: false, code: "unauthenticated" };
      const productId = typeof productOrId === "object" ? productOrId.id : productOrId;
      if (!productId) return { ok: false, code: "invalid_id" };
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
    [isAuthenticated, applyCart]
  );

  const increment = useCallback(
    async (productId) => {
      if (!isAuthenticated) return { ok: false, code: "unauthenticated" };
      if (!productId) return { ok: false, code: "invalid_id" };
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
    [isAuthenticated, applyCart]
  );

  const decrement = useCallback(
    async (productId) => {
      if (!isAuthenticated) return { ok: false, code: "unauthenticated" };
      if (!productId) return { ok: false, code: "invalid_id" };
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
    [isAuthenticated, applyCart]
  );

  const removeItem = useCallback(
    async (productId) => {
      if (!isAuthenticated) return { ok: false, code: "unauthenticated" };
      if (!productId) return { ok: false, code: "invalid_id" };
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
    [isAuthenticated, applyCart]
  );

  const clear = useCallback(
    async () => {
      if (!isAuthenticated) return { ok: false, code: "unauthenticated" };
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
