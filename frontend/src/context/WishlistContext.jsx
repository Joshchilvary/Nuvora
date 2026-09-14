import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import {
  getWishlist,
  removeFromWishlist as apiRemove,
  toggleWishlist as apiToggle,
} from "../services/api/wishlist.js";

const WishlistContext = createContext(null);

const PENDING_TOGGLE = new Set();

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pendingIds, setPendingIds] = useState(() => new Set());
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getWishlist();
      const list = Array.isArray(data?.items) ? data.items : [];
      setItems(list);
    } catch (err) {
      setError(err?.message || "Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const productIds = useMemo(() => {
    const set = new Set();
    for (const item of items) {
      const id = item?.product?.id ?? item?.product_id ?? item?.id;
      if (id != null) set.add(id);
    }
    return set;
  }, [items]);

  const isWishlisted = useCallback(
    (productId) => productIds.has(Number(productId) || productId),
    [productIds]
  );

  const setPending = (productId, value) => {
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (value) next.add(productId);
      else next.delete(productId);
      return next;
    });
  };

  const toggle = useCallback(
    async (productId) => {
      if (!isAuthenticated) {
        return { ok: false, code: "unauthenticated" };
      }
      const numericId = Number(productId);
      if (!numericId) {
        return { ok: false, code: "invalid_id" };
      }
      if (PENDING_TOGGLE.has(numericId) || pendingIds.has(numericId)) {
        return { ok: false, code: "in_flight" };
      }
      PENDING_TOGGLE.add(numericId);
      setPending(numericId, true);
      const previouslyWishlisted = itemsRef.current.some(
        (it) => (it?.product?.id ?? it?.product_id) === numericId
      );
      try {
        const res = await apiToggle(numericId);
        const wishlisted =
          typeof res?.wishlisted === "boolean" ? res.wishlisted : !previouslyWishlisted;
        setItems((prev) => {
          if (wishlisted) {
            if (
              prev.some((it) => (it?.product?.id ?? it?.product_id) === numericId)
            ) {
              return prev;
            }
            return [
              { id: `optimistic-${numericId}-${Date.now()}`, product: { id: numericId } },
              ...prev,
            ];
          }
          return prev.filter(
            (it) => (it?.product?.id ?? it?.product_id) !== numericId
          );
        });
        return { ok: true, wishlisted };
      } catch (err) {
        return { ok: false, code: "error", error: err };
      } finally {
        PENDING_TOGGLE.delete(numericId);
        setPending(numericId, false);
      }
    },
    [isAuthenticated, pendingIds]
  );

  const remove = useCallback(
    async (productId) => {
      if (!isAuthenticated) return { ok: false, code: "unauthenticated" };
      const numericId = Number(productId);
      if (!numericId) return { ok: false, code: "invalid_id" };
      const previous = itemsRef.current;
      setItems((prev) =>
        prev.filter((it) => (it?.product?.id ?? it?.product_id) !== numericId)
      );
      try {
        await apiRemove(numericId);
        return { ok: true };
      } catch (err) {
        setItems(previous);
        return { ok: false, code: "error", error: err };
      }
    },
    [isAuthenticated]
  );

  const add = useCallback(
    async (productId) => {
      if (!isAuthenticated) return { ok: false, code: "unauthenticated" };
      const numericId = Number(productId);
      if (!numericId) return { ok: false, code: "invalid_id" };
      await refresh();
      return { ok: true };
    },
    [isAuthenticated, refresh]
  );

  const value = {
    items,
    loading,
    error,
    refresh,
    isWishlisted,
    toggle,
    remove,
    add,
    pendingIds,
    isAuthenticated,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within a WishlistProvider");
  return ctx;
}
