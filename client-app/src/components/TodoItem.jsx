import styles from "./TodoItem.module.css";

function timeAgo(ts) {
  const d = Date.now() - new Date(ts);
  if (d < 60000)    return "just now";
  if (d < 3600000)  return `${Math.floor(d / 60000)}m ago`;
  if (d < 86400000) return `${Math.floor(d / 3600000)}h ago`;
  return `${Math.floor(d / 86400000)}d ago`;
}

export default function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <div className={`${styles.item} ${todo.done ? styles.done : ""}`}>
      <button
        className={styles.check}
        onClick={() => onToggle(todo.id)}
        aria-label={todo.done ? "Mark incomplete" : "Mark complete"}
      >
        {todo.done && <CheckIcon />}
      </button>
      <span className={styles.text}>{todo.text}</span>
      <span className={styles.ts}>{timeAgo(todo.createdAt)}</span>
      <button
        className={styles.del}
        onClick={() => onDelete(todo.id)}
        aria-label="Delete task"
      >
        ✕
      </button>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
