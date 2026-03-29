const BASE = import.meta.env.VITE_API_URL ?? "";

let _token = "";
export const setToken = (t) => { _token = t; };
export const getToken = ()  =>  _token;

function headers() {
  return { "Content-Type": "application/json", "X-Admin-Token": _token };
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, { ...options, headers: headers() });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? "Request failed");
  }
  return res.json();
}

export const adminApi = {
  // Auth check
  getStats:      ()               => request("/admin/stats"),

  // Clients
  getClients:    ()               => request("/admin/clients"),
  createClient:  (name, subdomain) =>
    request("/admin/clients", { method: "POST", body: JSON.stringify({ name, subdomain }) }),

  // Todos
  getAllTodos:    ()               => request("/admin/todos"),
  getTodosByClient: (clientId)    => request(`/admin/todos/${clientId}`),
};
