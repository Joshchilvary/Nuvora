export const SELLER_PROFILE = {
  storeName: "NUVORA Store",
  tier: "Premium Tier",
  avatar:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBfSZOn0n1R5YOGSnUh_iDDEhAWnnP58EjNuVHVRyVWUK0-ITNiA89E61KIk39Xzapg7d7-ofdBYmXnZYtiBgONVm04gjXcAAHKlcefsKscTwNKPaTv9tNQpTvtCJDi40qgcpQiSujjnulRKp-fSL6BI_eZnxF980PZgXA8vz-BbGB9eDwS5ftoCKd5GCtQwBMtDaRV6V8a9h6vQtYzaRikYSIpYQ4pKISL4HGmm7YwAxID4ttacAGdiw",
};

export const SELLER_STATS = {
  revenue: "$124,592",
  revenueChange: "+14.2%",
  orders: "1,482",
  ordersChange: "+8.1%",
  conversion: "4.8%",
  conversionChange: "+0.6%",
  visitors: "24.5K",
  visitorsChange: "+12.3%",
};

export const REVENUE_DATA = [
  { day: "Mon", value: 40 },
  { day: "Tue", value: 55 },
  { day: "Wed", value: 30 },
  { day: "Thu", value: 75 },
  { day: "Fri", value: 60 },
  { day: "Sat", value: 90 },
  { day: "Sun", value: 50 },
];

export const ALERTS = [
  {
    id: "low-stock",
    type: "error",
    title: "Low Stock Alert",
    description: '"Quantum Mesh Chair" has only 3 units remaining.',
    action: "Restock Now",
  },
  {
    id: "new-order",
    type: "info",
    title: "New Order #4892",
    description: "$450.00 • Expedited Shipping",
    time: "2m ago",
    action: "View Order",
  },
  {
    id: "conversion",
    type: "success",
    title: "Conversion Rate",
    value: "4.8%",
    trend: "up",
  },
];

export const TOP_PRODUCTS = [
  {
    id: "sonic-prism-over-ear",
    name: "Sonic Prism Over-Ear",
    sku: "SP-001",
    category: "Electronics",
    sales: 142,
    salesLabel: "Sales",
    price: "$349.00",
    status: "Active",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBLlI33R92ejTTZzZm5W9Ti7989lPYWYDvNVp7BpInz6ruV7_FppNZgTbVa8gC6WH6mIjtcsoNl_7D5vpnBSpG3WPSKLgQm5X_L7VWTKQi-7z26Zo6lqEDNEYpkSkUqNEY7pHH2Wov_koW2GtXYPFXYaokZXNvWEEsRnK05vdHV5cUCvT6MVqPTzHNRTQTFIGEbg8-Pq9L5f-3DOBIMm1kG29fSjomjpM5MtNtmCBpb4UxYYweBUMCxQg",
  },
  {
    id: "tactile-flow-keyboard",
    name: "Tactile Flow Keyboard",
    sku: "TF-042",
    category: "Electronics",
    sales: 89,
    salesLabel: "Sales",
    price: "$189.00",
    status: "Active",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD5EiF94VagvS2cYeWjO5I6xdHzp9RIvwOhOIrJJNAFb1nEGlP0hJyhDrZD1Tj1pnsjMP5q2xCbcidsdFu5osb7sZb30i60oXGBxXseECwPQRIIP0_TkOTDx_PdwUZzmIencE4MKSVxjQZVJmc-aP0d7D2hfFEw0IqdYwnSLPKaLKjlO4Da4rXMSEwXHx91QG4Q2LETM5dcy2NH_0_7q8W0wWUoY3EheCzbX683GLRUQakztXPPae_B_w",
  },
  {
    id: "aether-smart-buds",
    name: "Aether Smart Buds",
    sku: "AS-017",
    category: "Electronics",
    sales: 64,
    salesLabel: "Sales",
    price: "$199.00",
    status: "Low Stock",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAu5o8uMryLNcbfW0VQ9ISW7ZXg8fGc7YSlXUki7D2jZ8apWoJIp_04qpUIrAHlMNUfl99YhuaG79O9r86YuHodFyLcwKL3Letjkrc-ri509D9hsGZTN-xnUfROGEBPnI_jUIb88VJ3Qe3QNmsgl3LUKxegx9YltdHdzCF8vX0yW5krkXUnBNFFFdPk5tYQEhmSG7ovzxz2Asklyhdz5K6uWGizNPZ_PcnkT5vTYPOVPE18MI_ohFiWyQ",
  },
];

export const INVENTORY_SUMMARY = [
  { name: "Quantum Mesh Chair", stock: 3, status: "Low Stock" },
  { name: "Aero Desk Lamp", stock: 18, status: "Active" },
  { name: "Sonic Prism Over-Ear", stock: 42, status: "Active" },
];

export const LOW_STOCK_THRESHOLD = 10;

export const INVENTORY_STATS = {
  total: 6,
  inStock: 3,
  lowStock: 2,
  outOfStock: 1,
};

export const SELLER_INVENTORY = [
  {
    productId: "sonic-prism-over-ear",
    sku: "SP-001",
    stock: 24,
    status: "in-stock",
    sales: 142,
    salesLabel: "Sales",
    price: 349,
    updatedAt: "2024-01-15",
  },
  {
    productId: "tactile-flow-keyboard",
    sku: "TF-042",
    stock: 18,
    status: "in-stock",
    sales: 89,
    salesLabel: "Sales",
    price: 189,
    updatedAt: "2024-01-10",
  },
  {
    productId: "aether-smart-buds",
    sku: "AS-017",
    stock: 6,
    status: "low-stock",
    sales: 64,
    salesLabel: "Sales",
    price: 199,
    updatedAt: "2024-01-08",
  },
  {
    productId: "lumina-arc-lamp",
    sku: "LA-007",
    stock: 32,
    status: "in-stock",
    sales: 34,
    salesLabel: "Sales",
    price: 129,
    updatedAt: "2024-01-05",
  },
  {
    productId: "monolith-vessel",
    sku: "MV-015",
    stock: 0,
    status: "out-of-stock",
    sales: 27,
    salesLabel: "Sales",
    price: 85,
    updatedAt: "2023-12-20",
  },
  {
    productId: "aurora-knit-wrap",
    sku: "AK-022",
    stock: 5,
    status: "low-stock",
    sales: 19,
    salesLabel: "Sales",
    price: 75,
    updatedAt: "2023-12-15",
  },
];
