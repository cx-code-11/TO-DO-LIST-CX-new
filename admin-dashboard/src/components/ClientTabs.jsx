import styles from "./ClientTabs.module.css";

export default function ClientTabs({ stats, activeId, onChange }) {
  return (
    <div className={styles.wrap}>
      {stats.map((c) => (
        <button
          key={c.id}
          className={`${styles.tab} ${c.id === activeId ? styles.active : ""}`}
          onClick={() => onChange(c.id)}
        >
          {c.name}
          <span className={`${styles.count} ${c.id === activeId ? styles.countActive : ""}`}>
            {c.total}
          </span>
        </button>
      ))}
    </div>
  );
}
