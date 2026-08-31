import { PRODUCTS } from "../data/products.js";
import { SELLER_INVENTORY, INVENTORY_STATS, LOW_STOCK_THRESHOLD } from "../data/seller.js";

const DELAY = 150;

function enrichInventoryItem(item) {
  const product = PRODUCTS.find((p) => p.id === item.productId);
  return {
    ...item,
    name: product?.name ?? item.productId,
    image: product?.image ?? null,
    category: product?.category ?? "Uncategorized",
    description: product?.description ?? "",
  };
}

function computeStats(inventory) {
  return {
    total: inventory.length,
    inStock: inventory.filter((i) => i.status === "in-stock").length,
    lowStock: inventory.filter((i) => i.status === "low-stock").length,
    outOfStock: inventory.filter((i) => i.status === "out-of-stock").length,
  };
}

export async function getSellerInventory() {
  await new Promise((resolve) => setTimeout(resolve, DELAY));
  return SELLER_INVENTORY.map(enrichInventoryItem);
}

export async function getInventoryItem(productId) {
  await new Promise((resolve) => setTimeout(resolve, DELAY));
  const item = SELLER_INVENTORY.find((i) => i.productId === productId);
  return item ? enrichInventoryItem(item) : null;
}

export async function getInventoryStats() {
  await new Promise((resolve) => setTimeout(resolve, DELAY));
  return computeStats(SELLER_INVENTORY);
}

export { INVENTORY_STATS, LOW_STOCK_THRESHOLD };
