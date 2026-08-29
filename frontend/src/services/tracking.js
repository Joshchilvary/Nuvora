import { getLastOrder, formatDateRange, estimateDelivery } from "../lib/order.js";
import { PRODUCTS } from "../data/products.js";

export const TRACKING_STAGES = [
  { id: "placed", label: "Order Placed", icon: "shopping_cart_checkout" },
  { id: "confirmed", label: "Confirmed", icon: "check_circle" },
  { id: "processing", label: "Processing", icon: "precision_manufacturing" },
  { id: "shipped", label: "Shipped", icon: "local_shipping" },
  { id: "delivered", label: "Delivered", icon: "mark_email_read" },
];

const ACTIVE_STAGE_INDEX = 3;

function buildDemoOrder() {
  const product = PRODUCTS[0];
  const placedAt = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  return {
    orderNumber: "NUV-8842-XQ",
    placedAt: placedAt.toISOString(),
    items: [
      {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image,
      },
    ],
    subtotal: product.price,
    shipping: 0,
    total: product.price,
    delivery: {
      id: "standard",
      label: "Standard Delivery",
      description: "5-7 business days",
    },
    estimatedDelivery: estimateDelivery("standard"),
    shippingAddress: {
      fullName: "Jordan Avery",
      address: "128 Discovery Lane, Apt 9",
      city: "San Francisco",
      region: "CA",
      postalCode: "94107",
      country: "United States",
      email: "jordan@example.com",
    },
  };
}

export function resolveTrackingOrder() {
  return getLastOrder() ?? buildDemoOrder();
}

export function getTracking(order) {
  const stages = TRACKING_STAGES.map((stage, index) => ({
    ...stage,
    state:
      index < ACTIVE_STAGE_INDEX
        ? "completed"
        : index === ACTIVE_STAGE_INDEX
          ? "current"
          : "upcoming",
  }));

  const deliveryWindow = formatDateRange(
    order.estimatedDelivery.start,
    order.estimatedDelivery.end
  );

  const updateTime = new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return {
    orderNumber: order.orderNumber,
    placedAt: order.placedAt,
    items: order.items,
    total: order.total,
    delivery: order.delivery,
    estimatedDelivery: order.estimatedDelivery,
    deliveryWindow,
    stages,
    activeStageIndex: ACTIVE_STAGE_INDEX,
    progressPercent: (ACTIVE_STAGE_INDEX / (TRACKING_STAGES.length - 1)) * 100,
    currentStatus: stages[ACTIVE_STAGE_INDEX].label,
    latestUpdate: {
      title: "In transit",
      detail:
        "Your order has left the fulfillment center and is on its way to you.",
      time: updateTime,
    },
    carrier: {
      name: "Swift Logistics Inc.",
      tracking: "SL-99201-NX",
    },
  };
}
