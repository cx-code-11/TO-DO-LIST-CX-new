import styles from "./Sidebar.module.css";

const NAV = [
  { id: "overview", label: "Overview", icon: "⬡" },
  { id: "clients",  label: "All Clients", icon: "◈" },
];

export default function Sidebar({ active, onChange, stats }) {
  const totalClients = stats.length;
  const totalTasks   = stats.reduce((a, c) => a + c.total, 0);
  const totalDone    = stats.reduce((a, c) => a + c.done,  0);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>Dashboard</div>
      <div className={styles.logoSub}>Admin Panel</div>

      <div className={styles.navLabel}>Views</div>
      {NAV.map((n) => (
        <button
          key={n.id}
          className={`${styles.navItem} ${active === n.id ? styles.active : ""}`}
          onClick={() => onChange(n.id)}
        >
          <span className={styles.icon}>{n.icon}</span>
          {n.label}
        </button>
      ))}

      <div className={styles.bottom}>
        <div>{totalClients} clients</div>
        <div>{totalTasks} tasks</div>
        <div>{totalDone} completed</div>
      </div>
    </aside>
  );
}
