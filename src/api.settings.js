import { apiGet, apiSend } from "./api"; // your local api helpers

export const settings = {
  get: (key) => apiGet(`/api/settings/${encodeURIComponent(key)}`),
  put: (key, value) => apiSend(`/api/settings/${encodeURIComponent(key)}`, value, 'PUT'),
};
