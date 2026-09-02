export const CUSTOMER_ACCOUNT = {
  fullName: "Alex Mercer",
  email: "alex.mercer@example.com",
  phone: "+1 (555) 867-5309",
  avatar:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuC2lOEEk3gBtpUgO713I803vyC3drTRSbe41AfDbydiQQ09IgxdcW224VMXmkGrFNSxuYaK6xmkmBFPyExXx4wHBV3PYUX5cuVO9TaopaZg2FnDkAWKDnh-lGEP8KjbR3cnjolWugFQA8e6Qi-6TQPnqpLmFXl9rxpX5DvmBVKB5RiwwY8DM_-cvVjpCGJpjHOS_4ZMVgyu0lv9FYXDygE4N7WEkQuQ11JFNmzSGTCnsA0RAyB0zpUEmA",
  status: "Active",
  memberSince: "2024-03-12",
  tier: "Premium Member",
  verified: true,
};

export const INITIAL_CUSTOMER_SETTINGS = {
  profile: {
    fullName: CUSTOMER_ACCOUNT.fullName,
    email: CUSTOMER_ACCOUNT.email,
    phone: CUSTOMER_ACCOUNT.phone,
  },
  notificationPreferences: {
    orderUpdates: true,
    deliveryUpdates: true,
    promotionsOffers: false,
    wishlistAlerts: true,
    aiRecommendations: true,
    securityAlerts: true,
  },
  privacy: {
    personalizedRecommendations: true,
    dataSharing: false,
    marketingPersonalization: false,
  },
  regional: {
    language: "Language",
    currency: "USD - US Dollar",
    region: "United States",
  },
  security: {
    passwordLastChanged: "2026-08-15",
    twoFactorEnabled: false,
    sessions: [
      { device: "Chrome • Windows", location: "San Francisco, CA", current: true, lastActive: "Current session" },
      { device: "Safari • iPhone", location: "San Francisco, CA", current: false, lastActive: "2 hours ago" },
    ],
  },
};

export const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "ja", label: "日本語" },
];

export const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "JPY", label: "JPY - Japanese Yen" },
];

export const REGION_OPTIONS = [
  { value: "us", label: "United States" },
  { value: "ca", label: "Canada" },
  { value: "gb", label: "United Kingdom" },
  { value: "eu", label: "European Union" },
  { value: "jp", label: "Japan" },
];

export const DEFAULT_SETTINGS_BACKUP = () => JSON.parse(JSON.stringify(INITIAL_CUSTOMER_SETTINGS));
