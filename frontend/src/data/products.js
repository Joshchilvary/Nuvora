export const CATEGORIES = [
  "All Products",
  "Electronics",
  "Fashion",
  "Lifestyle",
];

const HEADPHONES =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBLlI33R92ejTTZzZm5W9Ti7989lPYWYDvNVp7BpInz6ruV7_FppNZgTbVa8gC6WH6mIjtcsoNl_7D5vpnBSpG3WPSKLgQm5X_L7VWTKQi-7z26Zo6lqEDNEYpkSkUqNEY7pHH2Wov_koW2GtXYPFXYaokZXNvWEEsRnK05vdHV5cUCvT6MVqPTzHNRTQTFIGEbg8-Pq9L5f-3DOBIMm1kG29fSjomjpM5MtNtmCBpb4UxYYweBUMCxQg";
const KEYBOARD =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD5EiF94VagvS2cYeWjO5I6xdHzp9RIvwOhOIrJJNAFb1nEGlP0hJyhDrZD1Tj1pnsjMP5q2xCbcidsdFu5osb7sZb30i60oXGBxXseECwPQRIIP0_TkOTDx_PdwUZzmIencE4MKSVxjQZVJmc-aP0d7D2hfFEw0IqdYwnSLPKaLKjlO4Da4rXMSEwXHx91QG4Q2LETM5dcy2NH_0_7q8W0wWUoY3EheCzbX683GLRUQakztXPPae_B_w";
const GADGETS =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAu5o8uMryLNcbfW0VQ9ISW7ZXg8fGc7YSlXUki7D2jZ8apWoJIp_04qpUIrAHlMNUfl99YhuaG79O9r86YuHodFyLcwKL3Letjkrc-ri509D9hsGZTN-xnUfROGEBPnI_jUIb88VJ3Qe3QNmsgl3LUKxegx9YltdHdzCF8vX0yW5krkXUnBNFFFdPk5tYQEhmSG7ovzxz2Asklyhdz5K6uWGizNPZ_PcnkT5vTYPOVPE18MI_ohFiWyQ";
const LAMP =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDKA590CG2KknjZGZYpUM1qnH6ZbkoQMe34yEDQvr6sI0a67EcsgwoTfOoUQFULocZgwWDzhdbgMOyldpmH_XdscsXEN2BwH0A3nO1b79mSOiVxnNMcqhE_wjMZkxvGN-eQRqsq9uXup4-d1tqKVsWNYc4vAjQll3WGLoVvvxTN6zR5bHrLFEmegFVWihw8A1iEYELUz0WH5s6-dpURUeWTcvZh1rj9HfbhcjO1BiSmOuiDZo4OFqdy5g";
const VASE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDALf5YcN0yJuWhUncKomNfU-jC28sQzp3oDzdrAKi6SoX0d4aDudf_XTZ89YkqxfJOQYR9fqrntvkgWTMO2pjo6iVWXPkCdR9yG5W-9F0zXZPvVI_AGsKfZrnglHmB-hG8fHo-lJY3-Yf7WmfEqrq7knjAmdyaSQaPDYVlCyR1SzVwQvKRVmWdIr0t_8ExOef3g4ztEbKIwn3EUFzxJPEn_9ZGgZw_3dx8M0n9AyvY5kohsSc9RGmjqA";
const KEYBOARD2 =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD1ToF2vSE7T6H6ANOB9RQye0PKZJsxuuVgRUnh9rFjDsBRLxn-MdvwxtRZBsVe4BWzjrEHefUpq2GQdCKlqlTxauTubeOnyDBv8tBZ8eZBloBtddJJCXh7ERQajnNdclgnc5aQsLfux-2Slf4www1CqmWOAbjeQKf1_kIfnbmovtPJ-nsngz6xGB-6RtEh65_aentlKlud1H4-uLZbX8V4AT__nW_STgq-v74dlSozGOEAEgQHpNJtxw";

export const PRODUCTS = [
  {
    id: "sonic-prism-over-ear",
    name: "Sonic Prism Over-Ear",
    category: "Electronics",
    description:
      "Spatial audio headphones with adaptive noise cancellation and glass-touch controls.",
    price: 349,
    oldPrice: 399,
    badge: "New",
    image: HEADPHONES,
    images: [HEADPHONES],
    specs: [
      { label: "Battery Life", value: "Up to 36 Hours" },
      { label: "Connectivity", value: "Bluetooth 5.4" },
      { label: "Weight", value: "265 grams" },
      { label: "Noise Cancellation", value: "Adaptive Active" },
    ],
  },
  {
    id: "tactile-flow-keyboard",
    name: "Tactile Flow Keyboard",
    category: "Electronics",
    description:
      "Low-profile mechanical switches housed in an aerospace-grade aluminum chassis.",
    price: 189,
    oldPrice: 219,
    image: KEYBOARD,
    images: [KEYBOARD],
    specs: [
      { label: "Switches", value: "Low-profile mechanical" },
      { label: "Layout", value: "65%" },
      { label: "Frame", value: "Aerospace aluminum" },
      { label: "Connectivity", value: "USB-C / Wireless" },
    ],
  },
  {
    id: "aether-smart-buds",
    name: "Aether Smart Buds",
    category: "Electronics",
    description:
      "Compact adaptive earbuds with dimensional sound staging and a lime-rim charging case.",
    price: 199,
    oldPrice: 229,
    image: GADGETS,
    images: [GADGETS],
    specs: [
      { label: "Battery", value: "Up to 8 Hours" },
      { label: "Charging", value: "Wireless case" },
      { label: "Codec", value: "LDAC" },
      { label: "Weight", value: "5 grams" },
    ],
  },
  {
    id: "lumina-arc-lamp",
    name: "Lumina Arc Lamp",
    category: "Lifestyle",
    description:
      "Sculptural arc lamp with warm focused light and a brushed dark-metal finish.",
    price: 129,
    image: LAMP,
    images: [LAMP],
    specs: [
      { label: "Bulb", value: "LED 9W" },
      { label: "Material", value: "Brushed metal" },
      { label: "Height", value: "152 cm" },
      { label: "Dimming", value: "Touch" },
    ],
  },
  {
    id: "monolith-vessel",
    name: "Monolith Vessel",
    category: "Lifestyle",
    description:
      "Hand-cast ceramic statement piece designed to elevate any modern living space.",
    price: 85,
    image: VASE,
    images: [VASE],
    specs: [
      { label: "Material", value: "Hand-cast ceramic" },
      { label: "Height", value: "28 cm" },
      { label: "Finish", value: "Matte ivory" },
      { label: "Care", value: "Wipe clean" },
    ],
  },
  {
    id: "aurora-knit-wrap",
    name: "Aurora Knit Wrap",
    category: "Fashion",
    description:
      "Oversized merino knit with a subtle lime seam, woven for dimensional comfort.",
    price: 75,
    image: KEYBOARD2,
    images: [KEYBOARD2],
    specs: [
      { label: "Material", value: "Merino wool" },
      { label: "Size", value: "One size" },
      { label: "Weight", value: "480 grams" },
      { label: "Care", value: "Hand wash" },
    ],
  },
];
