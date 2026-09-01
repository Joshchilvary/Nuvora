export const INITIAL_SETTINGS = {
  profile: {
    fullName: "Amara Okafor",
    email: "amara@aethercollective.com",
    phone: "+1 (555) 234-5678",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBfSZOn0n1R5YOGSnUh_iDDEhAWnnP58EjNuVHVRyVWUK0-ITNiA89E61KIk39Xzapg7d7-ofdBYmXnZYtiBgONVm04gjXcAAHKlcefsKscTwNKPaTv9tNQpTvtCJDi40qgcpQiSujjnulRKp-fSL6BI_eZnxF980PZgXA8vz-BbGB9eDwS5ftoCKd5GCtQwBMtDaRV6V8a9h6vQtYzaRikYSIpYQ4pKISL4HGmm7YwAxID4ttacAGdiw",
  },
  storePreferences: {
    status: "active",
    name: "Aether Collective",
    category: "Technology & Lifestyle",
    description: "Curated technology and lifestyle products designed for modern living.",
  },
  payoutPreferences: {
    method: "Bank Transfer",
    accountNumber: "•••• 4821",
    bankName: "NUVORA Business Bank",
  },
  notificationPreferences: {
    newOrders: true,
    lowStock: true,
    payoutUpdates: true,
    productUpdates: false,
    securityAlerts: true,
    nuvoraAnnouncements: false,
  },
  security: {
    passwordLastChanged: "2026-08-15",
    twoFactorEnabled: false,
    sessions: [
      { device: "Chrome • Windows", location: "San Francisco, CA", current: true, lastActive: "Current session" },
      { device: "Chrome • Android", location: "San Francisco, CA", current: false, lastActive: "2 hours ago" },
    ],
  },
  accountStatus: {
    status: "verified",
    memberSince: "2024-03-12",
    tier: "Premium Tier",
  },
};
