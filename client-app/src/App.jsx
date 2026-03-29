import { useState }   from "react";
import { useTodos }    from "./hooks/useTodos";
import { SUBDOMAIN }   from "./api/todos";
import AddTodo         from "./components/AddTodo";
import TodoItem        from "./components/TodoItem";
import StatsBar        from "./components/StatsBar";
import FilterBar       from "./components/FilterBar";
import "./App.css";

export default function App() {
  const { todos, loading, error, addTodo, toggleTodo, deleteTodo } = useTodos();
  const [filter, setFilter] = useState("all");

  const filtered = todos.filter((t) => {
    if (filter === "active") return !t.done;
    if (filter === "done")   return  t.done;
    return true;
  });

  return (
    <div className="page">
      <header className="header">
        <div className="brand">
          <h1>Tasks</h1>
          <p className="brand-sub">Workspace</p>
        </div>
        <span className="client-badge">{SUBDOMAIN}</span>
      </header>

      <main className="main">
        {error && <div className="error-banner">{error}</div>}

        <AddTodo onAdd={addTodo} />
        <StatsBar todos={todos} />
        <FilterBar active={filter} onChange={setFilter} />

        {loading ? (
          <div className="loading">Loading tasks…</div>
        ) : filtered.length === 0 ? (
          <div className="empty">No tasks here</div>
        ) : (
          <div className="todo-list">
            {filtered.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
