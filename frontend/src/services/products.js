import { PRODUCTS } from "../data/products.js";

const DELAY = 150;

/**
 * Frontend-only product lookup. Returns a Promise so it can later be swapped
 * for a real Django API call without changing the calling UI.
 */
export async function getProductById(id) {
  await new Promise((resolve) => setTimeout(resolve, DELAY));
  return PRODUCTS.find((product) => product.id === id) ?? null;
}

export async function getRelatedProducts(product, limit = 4) {
  await new Promise((resolve) => setTimeout(resolve, DELAY));
  if (!product) return [];
  const sameCategory = PRODUCTS.filter(
    (entry) => entry.id !== product.id && entry.category === product.category
  );
  const others = PRODUCTS.filter(
    (entry) => entry.id !== product.id && entry.category !== product.category
  );
  return [...sameCategory, ...others].slice(0, limit);
}
