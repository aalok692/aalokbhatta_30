const API_BASE = import.meta.env.VITE_API_URL ?? "";

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}/api${path}`, {
    credentials: "include",
    headers: options.body instanceof FormData
      ? options.headers
      : { "Content-Type": "application/json", ...options.headers },
    ...options
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.message || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return payload;
}
