const BASE = import.meta.env.VITE_API_URL ?? "";

// subdomain auto-detected from hostname, fallback to query param for dev
const hostname = window.location.hostname;
const isLocal  = hostname === "localhost" || hostname === "127.0.0.1";
export const SUBDOMAIN = isLocal
  ? new URLSearchParams(window.location.search).get("subdomain") ?? "cmx"
  : hostname.split(".")[0];

function headers() {
  return { "Content-Type": "application/json", "X-Subdomain": SUBDOMAIN };
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, { ...options, headers: headers() });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? "Request failed");
  }
  return res.json();
}

export const api = {
  getTodos:    ()         => request("/todos"),
  createTodo:  (text)     => request("/todos", { method: "POST",   body: JSON.stringify({ text }) }),
  toggleTodo:  (id)       => request(`/todos/${id}`, { method: "PATCH" }),
  deleteTodo:  (id)       => request(`/todos/${id}`, { method: "DELETE" }),
};
