import { apiRequest } from "./client.js";

export async function createOrder({
  email,
  fullName,
  phoneNumber,
  shippingAddress,
  shippingCity,
  shippingRegion,
  shippingPostalCode,
  shippingCountry,
  deliveryMethod,
  deliveryDescription,
}) {
  return apiRequest("/orders/", {
    method: "POST",
    body: JSON.stringify({
      email,
      full_name: fullName,
      phone_number: phoneNumber || "",
      shipping_address: shippingAddress,
      shipping_city: shippingCity,
      shipping_region: shippingRegion,
      shipping_postal_code: shippingPostalCode,
      shipping_country: shippingCountry,
      delivery_method: deliveryMethod || "standard",
      delivery_description: deliveryDescription || "",
    }),
  });
}

export async function getOrders() {
  return apiRequest("/orders/", { method: "GET" });
}

export async function getOrder(orderNumber) {
  return apiRequest(`/orders/${encodeURIComponent(orderNumber)}/`, {
    method: "GET",
  });
}
