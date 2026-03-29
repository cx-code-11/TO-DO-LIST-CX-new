import { useState, useMemo } from "react";
import styles from "./TodoTable.module.css";

function timeAgo(ts) {
  const d = Date.now() - new Date(ts);
  if (d < 60000)    return "just now";
  if (d < 3600000)  return `${Math.floor(d / 60000)}m ago`;
  if (d < 86400000) return `${Math.floor(d / 3600000)}h ago`;
  return new Date(ts).toLocaleDateString();
}

export default function TodoTable({ todos }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    return todos.filter((t) => {
      if (filter === "done"   && !t.done) return false;
      if (filter === "active" &&  t.done) return false;
      if (search && !t.text.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [todos, search, filter]);

  return (
    <div>
      <div className={styles.toolbar}>
        <input
          className={styles.search}
          type="text"
          placeholder="Search tasks…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className={styles.pills}>
          {["all", "active", "done"].map((f) => (
            <button
              key={f}
              className={`${styles.pill} ${filter === f ? styles.active : ""}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>No tasks found</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Task</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id}>
                <td className={t.done ? styles.strikethrough : ""}>{t.text}</td>
                <td>
                  <span className={`${styles.badge} ${t.done ? styles.done : styles.pending}`}>
                    <span className={styles.dot} />
                    {t.done ? "Done" : "Pending"}
                  </span>
                </td>
                <td className={styles.ts}>{timeAgo(t.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
