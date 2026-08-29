const FAQS = [
  {
    id: 1,
    category: "general",
    question: "What is NUVORA?",
    answer:
      "NUVORA is an AI-powered marketplace platform utilizing 'Dimensional Discovery' to connect buyers with premium physical and digital goods. Our technology leverages deep learning to anticipate your needs and curate a tailored browsing experience.",
  },
  {
    id: 2,
    category: "general",
    question: "How do I create an account?",
    answer:
      "Click 'Account' in the top right navigation, then select 'Register'. You will need a valid email address. Our onboarding AI will guide you through setting your initial discovery preferences.",
  },
  {
    id: 3,
    category: "ai-discovery",
    question: "How does the Discovery Engine work?",
    answer:
      "Our proprietary Discovery Engine analyzes your browsing patterns, purchase history, and interaction dwell times to construct a multi-dimensional preference vector. It doesn't just suggest similar items; it identifies underlying aesthetic and functional preferences to introduce you to entirely new categories you're likely to appreciate.",
  },
];

export const CATEGORIES = [
  {
    id: "general",
    label: "General",
    icon: "help",
  },
  {
    id: "marketplace",
    label: "Marketplace",
    icon: "storefront",
  },
  {
    id: "ai-discovery",
    label: "AI Discovery",
    icon: "auto_awesome",
  },
  {
    id: "security",
    label: "Security",
    icon: "security",
  },
];

export default FAQS;
