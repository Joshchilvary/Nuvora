import { PRODUCTS } from "../data/products.js";

const DELAY = 200;

const SELLER_PRODUCT_DRAFTS = [];

/**
 * Create a draft product. Returns a Promise that resolves with the created
 * product payload. No network call is made; this is intentionally a frontend
 * mock so it can later be swapped for `POST /api/seller/products/`.
 */
export async function createSellerDraft(product) {
  await new Promise((resolve) => setTimeout(resolve, DELAY));
  const id = `draft-${Date.now()}`;
  const draft = {
    id,
    status: "draft",
    ...product,
    createdAt: new Date().toISOString(),
  };
  SELLER_PRODUCT_DRAFTS.push(draft);
  return draft;
}

/**
 * Publish a product. Mirrors a future `POST /api/seller/products/publish/`.
 */
export async function publishSellerProduct(product) {
  await new Promise((resolve) => setTimeout(resolve, DELAY));
  const id = product.id ?? `pub-${Date.now()}`;
  return {
    id,
    status: "published",
    ...product,
    createdAt: product.createdAt ?? new Date().toISOString(),
  };
}

/**
 * Suggest a SKU based on product name + category. Pure utility.
 */
export function suggestSku(name, category) {
  const base = (name || "PROD")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 6);
  const cat = (category || "GN").toUpperCase().slice(0, 2);
  const rand = Math.floor(100 + Math.random() * 900);
  return `${cat}-${base || "PROD"}-${rand}`;
}

/**
 * Look up the marketplace product shape so the form can be primed with
 * the same defaults the public Marketplace uses (currency, etc).
 */
export function getProductShapeTemplate() {
  const sample = PRODUCTS[0] ?? {};
  return {
    name: "",
    description: "",
    category: "",
    price: "",
    oldPrice: "",
    sku: "",
    stock: "",
    images: [],
    specifications: [],
    ...sample,
  };
}
