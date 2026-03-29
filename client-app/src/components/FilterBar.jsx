import styles from "./FilterBar.module.css";

const FILTERS = ["all", "active", "done"];

export default function FilterBar({ active, onChange }) {
  return (
    <div className={styles.wrap}>
      {FILTERS.map((f) => (
        <button
          key={f}
          className={`${styles.btn} ${active === f ? styles.active : ""}`}
          onClick={() => onChange(f)}
        >
          {f.charAt(0).toUpperCase() + f.slice(1)}
        </button>
      ))}
    </div>
  );
}
