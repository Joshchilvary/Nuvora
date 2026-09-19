import { apiRequest } from "./client.js";

export async function initializePayment(orderNumber) {
  return apiRequest("/payments/initialize/", {
    method: "POST",
    body: JSON.stringify({ order_number: orderNumber }),
  });
}

export async function getPaymentStatus(paymentReference) {
  return apiRequest(`/payments/${encodeURIComponent(paymentReference)}/`);
}

export async function retryPayment(orderNumber) {
  return apiRequest(`/payments/${encodeURIComponent(orderNumber)}/retry/`, {
    method: "POST",
    body: JSON.stringify({ provider: "paystack" }),
  });
}

const TERMINAL_STATUSES = ["successful", "completed", "failed", "expired", "cancelled"];
const POLL_INTERVAL_MS = 2000;
const POLL_MAX_ATTEMPTS = 15;

export async function pollPaymentUntilTerminal(paymentReference) {
  for (let attempt = 0; attempt < POLL_MAX_ATTEMPTS; attempt++) {
    const data = await getPaymentStatus(paymentReference);
    if (TERMINAL_STATUSES.includes(data.status)) return data;
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
  return null;
}
