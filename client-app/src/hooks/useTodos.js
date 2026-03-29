import { useState, useEffect, useCallback } from "react";
import { api } from "../api/todos";

export function useTodos() {
  const [todos,   setTodos]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getTodos();
      setTodos(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const addTodo = async (text) => {
    const todo = await api.createTodo(text);
    setTodos((prev) => [todo, ...prev]);
  };

  const toggleTodo = async (id) => {
    const updated = await api.toggleTodo(id);
    setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const deleteTodo = async (id) => {
    await api.deleteTodo(id);
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  return { todos, loading, error, addTodo, toggleTodo, deleteTodo, refresh: load };
}
