import { PRODUCTS } from "../data/products.js";

const STOPWORDS = new Set([
  "the", "and", "for", "with", "you", "your", "need", "something", "preferably",
  "under", "are", "looking", "what", "a", "an", "i", "my", "to", "of", "in",
  "on", "is", "it", "that", "this", "from", "me", "want", "would", "like",
  "please", "can", "could", "some", "get", "looking", "find", "show",
]);

function tokenize(query) {
  return (
    query
      .toLowerCase()
      .match(/[a-z0-9]+/g)
      ?.filter((word) => word.length >= 3 && !STOPWORDS.has(word)) ?? []
  );
}

function scoreProduct(product, terms) {
  const haystack = `${product.name} ${product.description} ${product.category}`.toLowerCase();
  let score = 0;
  const matched = [];
  for (const term of terms) {
    if (haystack.includes(term) && !matched.includes(term)) {
      score += 1;
      matched.push(term);
    }
  }
  if (terms.some((term) => product.category.toLowerCase().includes(term))) {
    score += 1;
  }
  return { score, matched };
}

function buildReasoning(query, ranked) {
  const bullets = ranked.map((entry) => {
    const term = entry.matched[0];
    if (term) {
      return `Your request highlights "${term}" — ${entry.product.name} fits because ${entry.product.description}`;
    }
    return `Curated by intent — ${entry.product.name} aligns with your discovery goals.`;
  });
  bullets.push(
    "Mapped across NUVORA's dimensional space using your stated preferences and our intelligence engine."
  );
  return bullets.slice(0, 4);
}

/**
 * Frontend-only discovery. Returns a Promise so it can later be replaced by a
 * real API call (Discovery API service -> Django -> AI engine) without changing
 * the calling component.
 */
export async function discover({ query }) {
  await new Promise((resolve) => setTimeout(resolve, 700));

  const terms = tokenize(query);
  const ranked = PRODUCTS.map((product) => ({ product, ...scoreProduct(product, terms) }))
    .sort((a, b) => b.score - a.score);

  const top =
    ranked.filter((entry) => entry.score > 0).length > 0
      ? ranked.filter((entry) => entry.score > 0).slice(0, 3)
      : ranked.slice(0, 3);

  return {
    query,
    reasoning: buildReasoning(query, top),
    products: top.map((entry) => entry.product),
  };
}
