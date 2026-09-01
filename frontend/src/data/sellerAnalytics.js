export const TIME_RANGES = [
  { id: "7d", label: "7D" },
  { id: "30d", label: "30D" },
  { id: "90d", label: "90D" },
  { id: "1y", label: "1Y" },
];

export const ANALYTICS_DATA = {
  "7d": {
    summary: {
      revenue: "$18,420",
      revenueChange: "+12.4%",
      orders: "48",
      ordersChange: "+8.1%",
      productsSold: "76",
      productsSoldChange: "+14.6%",
      averageOrderValue: "$384",
      averageOrderValueChange: "+3.8%",
    },
    revenue: [
      { day: "Mon", value: 40 },
      { day: "Tue", value: 55 },
      { day: "Wed", value: 30 },
      { day: "Thu", value: 75 },
      { day: "Fri", value: 60 },
      { day: "Sat", value: 90 },
      { day: "Sun", value: 50 },
    ],
    orders: [
      { day: "Mon", value: 35 },
      { day: "Tue", value: 45 },
      { day: "Wed", value: 28 },
      { day: "Thu", value: 60 },
      { day: "Fri", value: 52 },
      { day: "Sat", value: 78 },
      { day: "Sun", value: 42 },
    ],
  },
  "30d": {
    summary: {
      revenue: "$76,350",
      revenueChange: "+18.2%",
      orders: "198",
      ordersChange: "+11.4%",
      productsSold: "312",
      productsSoldChange: "+19.8%",
      averageOrderValue: "$386",
      averageOrderValueChange: "+6.1%",
    },
    revenue: [
      { day: "W1", value: 45 },
      { day: "W2", value: 62 },
      { day: "W3", value: 55 },
      { day: "W4", value: 78 },
    ],
    orders: [
      { day: "W1", value: 38 },
      { day: "W2", value: 52 },
      { day: "W3", value: 48 },
      { day: "W4", value: 65 },
    ],
  },
  "90d": {
    summary: {
      revenue: "$214,800",
      revenueChange: "+24.6%",
      orders: "562",
      ordersChange: "+15.3%",
      productsSold: "891",
      productsSoldChange: "+22.1%",
      averageOrderValue: "$382",
      averageOrderValueChange: "+8.0%",
    },
    revenue: [
      { day: "M1", value: 55 },
      { day: "M2", value: 70 },
      { day: "M3", value: 85 },
    ],
    orders: [
      { day: "M1", value: 48 },
      { day: "M2", value: 62 },
      { day: "M3", value: 75 },
    ],
  },
  "1y": {
    summary: {
      revenue: "$1,240,500",
      revenueChange: "+32.8%",
      orders: "3,280",
      ordersChange: "+21.4%",
      productsSold: "5,140",
      productsSoldChange: "+28.6%",
      averageOrderValue: "$378",
      averageOrderValueChange: "+9.4%",
    },
    revenue: [
      { day: "Q1", value: 45 },
      { day: "Q2", value: 65 },
      { day: "Q3", value: 75 },
      { day: "Q4", value: 90 },
    ],
    orders: [
      { day: "Q1", value: 40 },
      { day: "Q2", value: 58 },
      { day: "Q3", value: 68 },
      { day: "Q4", value: 82 },
    ],
  },
};

export const TOP_PRODUCTS = [
  {
    id: "sonic-prism-over-ear",
    name: "Sonic Prism Over-Ear",
    sku: "SP-001",
    category: "Electronics",
    unitsSold: 142,
    revenue: "$49,558",
    trend: "up",
    trendValue: "+18%",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBLlI33R92ejTTZzZm5W9Ti7989lPYWYDvNVp7BpInz6ruV7_FppNZgTbVa8gC6WH6mIjtcsoNl_7D5vpnBSpG3WPSKLgQm5X_L7VWTKQi-7z26Zo6lqEDNEYpkSkUqNEY7pHH2Wov_koW2GtXYPFXYaokZXNvWEEsRnK05vdHV5cUCvT6MVqPTzHNRTQTFIGEbg8-Pq9L5f-3DOBIMm1kG29fSjomjpM5MtNtmCBpb4UxYYweBUMCxQg",
  },
  {
    id: "tactile-flow-keyboard",
    name: "Tactile Flow Keyboard",
    sku: "TF-042",
    category: "Electronics",
    unitsSold: 89,
    revenue: "$16,821",
    trend: "up",
    trendValue: "+12%",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD5EiF94VagvS2cYeWjO5I6xdHzp9RIvwOhOIrJJNAFb1nEGlP0hJyhDrZD1Tj1pnsjMP5q2xCbcidsdFu5osb7sZb30i60oXGBxXseECwPQRIIP0_TkOTDx_PdwUZzmIencE4MKSVxjQZVJmc-aP0d7D2hfFEw0IqdYwnSLPKaLKjlO4Da4rXMSEwXHx91QG4Q2LETM5dcy2NH_0_7q8W0wWUoY3EheCzbX683GLRUQakztXPPae_B_w",
  },
  {
    id: "aether-smart-buds",
    name: "Aether Smart Buds",
    sku: "AS-017",
    category: "Electronics",
    unitsSold: 64,
    revenue: "$12,736",
    trend: "down",
    trendValue: "-4%",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAu5o8uMryLNcbfW0VQ9ISW7ZXg8fGc7YSlXUki7D2jZ8apWoJIp_04qpUIrAHlMNUfl99YhuaG79O9r86YuHodFyLcwKL3Letjkrc-ri509D9hsGZTN-xnUfROGEBPnI_jUIb88VJ3Qe3QNmsgl3LUKxegx9YltdHdzCF8vX0yW5krkXUnBNFFFdPk5tYQEhmSG7ovzxz2Asklyhdz5K6uWGizNPZ_PcnkT5vTYPOVPE18MI_ohFiWyQ",
  },
  {
    id: "lumina-arc-lamp",
    name: "Lumina Arc Lamp",
    sku: "LA-007",
    category: "Lifestyle",
    unitsSold: 34,
    revenue: "$4,386",
    trend: "up",
    trendValue: "+7%",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDKA590CG2KknjZGZYpUM1qnH6ZbkoQMe34yEDQvr6sI0a67EcsgwoTfOoUQFULocZgwWDzhdbgMOyldpmH_XdscsXEN2BwH0A3nO1b79mSOiVxnNMcqhE_wjMZkxvGN-eQRqsq9uXup4-d1tqKVsWNYc4vAjQll3WGLoVvvxTN6zR5bHrLFEmegFVWihw8A1iEYELUz0WH5s6-dpURUeWTcvZh1rj9HfbhcjO1BiSmOuiDZo4OFqdy5g",
  },
];

export const INVENTORY_INSIGHTS = [
  {
    type: "low-stock",
    severity: "warning",
    title: "Low Stock Alert",
    description: "Aether Smart Buds has only 6 units remaining. Consider restock.",
    productId: "aether-smart-buds",
    action: "View Inventory",
    actionHref: "/seller/inventory",
  },
  {
    type: "low-stock",
    severity: "warning",
    title: "Low Stock Alert",
    description: "Aurora Knit Wrap has only 5 units remaining.",
    productId: "aurora-knit-wrap",
    action: "View Inventory",
    actionHref: "/seller/inventory",
  },
  {
    type: "best-seller",
    severity: "success",
    title: "Top Performer",
    description: "Sonic Prism Over-Ear is your best-selling product this period.",
    productId: "sonic-prism-over-ear",
    action: "View Product",
    actionHref: "/seller/inventory",
  },
  {
    type: "no-sales",
    severity: "info",
    title: "No Recent Sales",
    description: "Monolith Vessel has had no sales in the last 30 days.",
    productId: "monolith-vessel",
    action: "View Orders",
    actionHref: "/seller/orders",
  },
];
