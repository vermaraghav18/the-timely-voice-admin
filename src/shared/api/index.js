// simple API client used by admin
const API_BASE = import.meta.env.VITE_API_BASE_URL;

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}

export const articles = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/articles${qs ? `?${qs}` : ""}`);
  },
  get: (idOrSlug) => request(`/api/articles/${idOrSlug}`),
  create: (payload) => request(`/api/articles`, { method: "POST", body: JSON.stringify(payload) }),
  update: (id, payload) => request(`/api/articles/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  remove: (id) => request(`/api/articles/${id}`, { method: "DELETE" }),
};

export const categories = {
  list: () => request(`/api/categories`),
};

export const settings = {
  // read
  get: (key) => request(`/api/settings/${encodeURIComponent(key)}`),

  // legacy: wraps as { value } — keep for backward compat
  upsert: (key, value) =>
    request(`/api/settings/${encodeURIComponent(key)}`, { method: "PUT", body: JSON.stringify({ value }) }),

  // new: send raw JSON object (matches how ArticleBlockLightSettings saves today)
  put: (key, payload) =>
    request(`/api/settings/${encodeURIComponent(key)}`, { method: "PUT", body: JSON.stringify(payload) }),
};

// auth helpers (if used by useAuth)
export const auth = {
  login: (email, password) =>
    request(`/api/auth/login`, { method: "POST", body: JSON.stringify({ email, password }) }),
  logout: () => request(`/api/auth/logout`, { method: "POST" }),
  me: () => request(`/api/auth/me`),
};

export default { articles, categories, settings, auth };
