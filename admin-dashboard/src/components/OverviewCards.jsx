import styles from "./OverviewCards.module.css";

export default function OverviewCards({ stats }) {
  const totalClients = stats.length;
  const totalTasks   = stats.reduce((a, c) => a + c.total, 0);
  const totalDone    = stats.reduce((a, c) => a + c.done,  0);

  return (
    <div className={styles.grid}>
      <Card label="Clients"    value={totalClients} mod="clients" />
      <Card label="Total Tasks" value={totalTasks}  mod="total"   />
      <Card label="Completed"  value={totalDone}    mod="done"    />
    </div>
  );
}

function Card({ label, value, mod }) {
  return (
    <div className={styles.card}>
      <span className={styles.label}>{label}</span>
      <span className={`${styles.val} ${styles[mod]}`}>{value}</span>
    </div>
  );
}
