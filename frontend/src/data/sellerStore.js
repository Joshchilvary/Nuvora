export const STORE_CATEGORIES = [
  "Electronics",
  "Fashion",
  "Lifestyle",
  "Technology & Lifestyle",
  "Home & Living",
  "Health & Beauty",
  "Sports & Outdoors",
  "Arts & Crafts",
];

export const STORE_STATUS = {
  active: {
    label: "Active",
    description: "Customers can discover and purchase products from your store.",
    icon: "check_circle",
    className: "bg-lime/10 text-accent border-lime/30",
  },
  paused: {
    label: "Paused",
    description: "Your storefront is temporarily hidden from new purchases.",
    icon: "pause_circle",
    className: "bg-amber-400/10 text-amber-400 border-amber-400/30",
  },
};

export const INITIAL_STORE = {
  name: "Aether Collective",
  slug: "aether-collective",
  description:
    "Curated technology and lifestyle products designed for modern living.",
  category: "Technology & Lifestyle",
  email: "hello@aethercollective.com",
  phone: "+1 (555) 234-5678",
  location: "San Francisco, CA",
  status: "active",
  logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuBfSZOn0n1R5YOGSnUh_iDDEhAWnnP58EjNuVHVRyVWUK0-ITNiA89E61KIk39Xzapg7d7-ofdBYmXnZYtiBgONVm04gjXcAAHKlcefsKscTwNKPaTv9tNQpTvtCJDi40qgcpQiSujjnulRKp-fSL6BI_eZnxF980PZgXA8vz-BbGB9eDwS5ftoCKd5GCtQwBMtDaRV6V8a9h6vQtYzaRikYSIpYQ4pKISL4HGmm7YwAxID4ttacAGdiw",
  banner:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAu5o8uMryLNcbfW0VQ9ISW7ZXg8fGc7YSlXUki7D2jZ8apWoJIp_04qpUIrAHlMNUfl99YhuaG79O9r86YuHodFyLcwKL3Letjkrc-ri509D9hsGZTN-xnUfROGEBPnI_jUIb88VJ3Qe3QNmsgl3LUKxegx9YltdHdzCF8vX0yW5krkXUnBNFFFdPk5tYQEhmSG7ovzxz2Asklyhdz5K6uWGizNPZ_PcnkT5vTYPOVPE18MI_ohFiWyQ",
};
