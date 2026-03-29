import styles from "./StatsBar.module.css";

export default function StatsBar({ todos }) {
  const total   = todos.length;
  const done    = todos.filter((t) => t.done).length;
  const pending = total - done;
  const pct     = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className={styles.wrap}>
      <div className={styles.grid}>
        <div className={styles.card}>
          <span className={styles.val}>{total}</span>
          <span className={styles.label}>Total</span>
        </div>
        <div className={styles.card}>
          <span className={`${styles.val} ${styles.green}`}>{done}</span>
          <span className={styles.label}>Done</span>
        </div>
        <div className={styles.card}>
          <span className={`${styles.val} ${styles.muted}`}>{pending}</span>
          <span className={styles.label}>Pending</span>
        </div>
      </div>
      <div className={styles.progress}>
        <div className={styles.fill} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
