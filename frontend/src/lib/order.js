const STORAGE_KEY = "nuvora-last-order";

function randomSegment(length) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export function generateOrderNumber() {
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `NUV-${digits}-${randomSegment(2)}`;
}

export function estimateDelivery(deliveryId) {
  let startOffset;
  let endOffset;
  if (deliveryId === "express") {
    startOffset = 2;
    endOffset = 3;
  } else {
    startOffset = 5;
    endOffset = 7;
  }
  const start = new Date();
  start.setDate(start.getDate() + startOffset);
  const end = new Date();
  end.setDate(end.getDate() + endOffset);
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

export function formatDateRange(startISO, endISO) {
  const start = new Date(startISO);
  const end = new Date(endISO);
  const startStr = start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const endStr = end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${startStr} – ${endStr}`;
}

export function formatOrderDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function buildOrder({ items, subtotal, shipping, total, deliveryId, delivery, form }) {
  const orderItems = items.map((item) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    image: item.image,
  }));
  const placedAt = new Date().toISOString();
  return {
    orderNumber: generateOrderNumber(),
    placedAt,
    items: orderItems,
    subtotal,
    shipping,
    total,
    delivery: {
      id: deliveryId,
      label: delivery.label,
      description: delivery.description,
    },
    estimatedDelivery: estimateDelivery(deliveryId),
    shippingAddress: {
      fullName: form.fullName,
      address: form.address,
      city: form.city,
      region: form.region,
      postalCode: form.postalCode,
      country: form.country,
      email: form.email,
    },
  };
}

export function saveLastOrder(order) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(order));
  } catch {
    /* ignore */
  }
}

export function getLastOrder() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
