import { apiRequest } from "./client.js";

export async function getCart() {
  return apiRequest("/cart/", { method: "GET" });
}

export async function addToCart(productId, quantity = 1) {
  return apiRequest("/cart/items/", {
    method: "POST",
    body: JSON.stringify({ product_id: productId, quantity }),
  });
}

export async function updateCartItem(productId, quantity) {
  return apiRequest(`/cart/items/${productId}/`, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  });
}

export async function removeCartItem(productId) {
  return apiRequest(`/cart/items/${productId}/`, { method: "DELETE" });
}

export async function clearCart() {
  return apiRequest("/cart/clear/", { method: "DELETE" });
}
