import { apiRequest } from "./client.js";

export async function getWishlist() {
  return apiRequest("/wishlist/", { method: "GET" });
}

export async function addToWishlist(productId) {
  return apiRequest("/wishlist/", {
    method: "POST",
    body: JSON.stringify({ product_id: productId }),
  });
}

export async function removeFromWishlist(productId) {
  return apiRequest(`/wishlist/${productId}/`, { method: "DELETE" });
}

export async function toggleWishlist(productId) {
  return apiRequest("/wishlist/toggle/", {
    method: "POST",
    body: JSON.stringify({ product_id: productId }),
  });
}
