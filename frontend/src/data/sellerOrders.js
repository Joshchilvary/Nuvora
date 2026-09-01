export const ORDER_STATUSES = {
  pending: {
    label: "Pending",
    icon: "schedule",
    className: "bg-amber-400/10 text-amber-400 border-amber-400/30",
  },
  processing: {
    label: "Processing",
    icon: "autorenew",
    className: "bg-blue-400/10 text-blue-400 border-blue-400/30",
  },
  shipped: {
    label: "Shipped",
    icon: "local_shipping",
    className: "bg-purple-400/10 text-purple-400 border-purple-400/30",
  },
  delivered: {
    label: "Delivered",
    icon: "check_circle",
    className: "bg-lime/10 text-accent border-lime/30",
  },
  cancelled: {
    label: "Cancelled",
    icon: "cancel",
    className: "bg-red-400/10 text-red-400 border-red-400/30",
  },
};

export const PAYMENT_STATUSES = {
  paid: {
    label: "Paid",
    icon: "check_circle",
    className: "bg-lime/10 text-accent border-lime/30",
  },
  pending: {
    label: "Pending",
    icon: "schedule",
    className: "bg-amber-400/10 text-amber-400 border-amber-400/30",
  },
  refunded: {
    label: "Refunded",
    icon: "undo",
    className: "bg-red-400/10 text-red-400 border-red-400/30",
  },
};

export const SELLER_ORDERS = [
  {
    id: "NV-1048",
    customer: { name: "Amara Okafor", email: "amara@example.com" },
    items: [
      { productId: "sonic-prism-over-ear", name: "Sonic Prism Over-Ear", quantity: 1, price: 349 },
      { productId: "aether-smart-buds", name: "Aether Smart Buds", quantity: 1, price: 199 },
    ],
    total: 548,
    date: "2026-08-31",
    paymentStatus: "paid",
    orderStatus: "processing",
  },
  {
    id: "NV-1047",
    customer: { name: "Sarah Chen", email: "sarah@example.com" },
    items: [
      { productId: "tactile-flow-keyboard", name: "Tactile Flow Keyboard", quantity: 1, price: 189 },
    ],
    total: 189,
    date: "2026-08-30",
    paymentStatus: "paid",
    orderStatus: "delivered",
  },
  {
    id: "NV-1046",
    customer: { name: "Marcus Johnson", email: "marcus@example.com" },
    items: [
      { productId: "lumina-arc-lamp", name: "Lumina Arc Lamp", quantity: 2, price: 129 },
    ],
    total: 258,
    date: "2026-08-29",
    paymentStatus: "paid",
    orderStatus: "shipped",
  },
  {
    id: "NV-1045",
    customer: { name: "Priya Sharma", email: "priya@example.com" },
    items: [
      { productId: "monolith-vessel", name: "Monolith Vessel", quantity: 1, price: 85 },
      { productId: "aurora-knit-wrap", name: "Aurora Knit Wrap", quantity: 2, price: 75 },
    ],
    total: 235,
    date: "2026-08-28",
    paymentStatus: "pending",
    orderStatus: "pending",
  },
  {
    id: "NV-1044",
    customer: { name: "David Kim", email: "david@example.com" },
    items: [
      { productId: "sonic-prism-over-ear", name: "Sonic Prism Over-Ear", quantity: 1, price: 349 },
    ],
    total: 349,
    date: "2026-08-27",
    paymentStatus: "refunded",
    orderStatus: "cancelled",
  },
  {
    id: "NV-1043",
    customer: { name: "Fatima Al-Rashid", email: "fatima@example.com" },
    items: [
      { productId: "aether-smart-buds", name: "Aether Smart Buds", quantity: 2, price: 199 },
      { productId: "tactile-flow-keyboard", name: "Tactile Flow Keyboard", quantity: 1, price: 189 },
    ],
    total: 587,
    date: "2026-08-26",
    paymentStatus: "paid",
    orderStatus: "delivered",
  },
  {
    id: "NV-1042",
    customer: { name: "James Wilson", email: "james@example.com" },
    items: [
      { productId: "aurora-knit-wrap", name: "Aurora Knit Wrap", quantity: 1, price: 75 },
    ],
    total: 75,
    date: "2026-08-25",
    paymentStatus: "paid",
    orderStatus: "delivered",
  },
  {
    id: "NV-1041",
    customer: { name: "Elena Rodriguez", email: "elena@example.com" },
    items: [
      { productId: "lumina-arc-lamp", name: "Lumina Arc Lamp", quantity: 1, price: 129 },
      { productId: "monolith-vessel", name: "Monolith Vessel", quantity: 1, price: 85 },
    ],
    total: 214,
    date: "2026-08-24",
    paymentStatus: "paid",
    orderStatus: "shipped",
  },
];
