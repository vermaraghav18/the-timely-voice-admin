// admin/src/api.js
const BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  '';

async function apiGet(path, init) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',            // keep cookies for /api/auth/*
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${text}`);
  }
  return res.json();
}

async function apiSend(path, body, method = 'POST') {
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${text}`);
  }
  // DELETE may have no body
  if (method === 'DELETE') return {};
  return res.json();
}

// ---------- Auth ----------
export const getMe = () => apiGet('/api/auth/me');
export const login = (email, password) => apiSend('/api/auth/login', { email, password }, 'POST');
export const logout = () => apiSend('/api/auth/logout', {}, 'POST');

// ---------- Categories ----------
export const categories = {
  list: () => apiGet('/api/categories'),
};

// ---------- Articles ----------
/**
 * Backend (already present):
 *   GET /api/articles?limit=&offset=         → list
 *   GET /api/articles/:slug                  → get by slug
 * If you want Save/Delete to work, add to server:
 *   POST /api/articles
 *   PUT  /api/articles/:id   (or :slug)
 *   DELETE /api/articles/:id (or :slug)
 */
export const articles = {
  list: ({ limit = 50, offset = 0 } = {}) =>
    apiGet(`/api/articles?limit=${Number(limit)}&offset=${Number(offset)}`),
  get: (slug) => apiGet(`/api/articles/${encodeURIComponent(slug)}`),

  // The following assume you will add matching routes on the server.
  // They try id first (number), else fall back to slug — flexible either way.
  create: (data) => apiSend('/api/articles', data, 'POST'),
  update: (idOrSlug, data) =>
    apiSend(`/api/articles/${encodeURIComponent(idOrSlug)}`, data, 'PUT'),
  remove: (idOrSlug) =>
    apiSend(`/api/articles/${encodeURIComponent(idOrSlug)}`, undefined, 'DELETE'),
};

export { apiGet, apiSend };
