import { apiRequest } from "./client.js";

export async function getCategories() {
  const data = await apiRequest("/categories/");
  return data.results || [];
}

export async function getCategoryBySlug(slug) {
  return apiRequest(`/categories/${encodeURIComponent(slug)}/`);
}

export async function getProducts(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.category) query.set("category", params.category);
  if (params.min_price != null && params.min_price !== "") {
    query.set("min_price", String(params.min_price));
  }
  if (params.max_price != null && params.max_price !== "") {
    query.set("max_price", String(params.max_price));
  }
  if (params.seller) query.set("seller", String(params.seller));
  if (params.ordering) query.set("ordering", params.ordering);

  const path = `/products/${query.toString() ? `?${query.toString()}` : ""}`;
  const data = await apiRequest(path);
  return {
    results: data.results || [],
    count: data.count || 0,
    next: data.next || null,
    previous: data.previous || null,
  };
}

export async function getProductById(id) {
  return apiRequest(`/products/${id}/`);
}

export async function getRelatedProducts(productId, categorySlug, limit = 4) {
  const query = new URLSearchParams();
  if (categorySlug) query.set("category", categorySlug);
  query.set("ordering", "-created_at");

  const data = await apiRequest(`/products/?${query.toString()}`);
  const results = data.results || [];
  return results.filter((item) => item.id !== productId).slice(0, limit);
}
