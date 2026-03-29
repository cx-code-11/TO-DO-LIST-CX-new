import { useState, useCallback } from "react";
import { adminApi } from "../api/admin";

export function useAdminData() {
  const [stats,   setStats]   = useState([]);
  const [todos,   setTodos]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [s, t] = await Promise.all([
        adminApi.getStats(),
        adminApi.getAllTodos(),
      ]);
      setStats(s);
      setTodos(t);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createClient = async (name, subdomain) => {
    const client = await adminApi.createClient(name, subdomain);
    await load(); // refresh all data
    return client;
  };

  return { stats, todos, loading, error, load, createClient };
}
