import { useState } from "react";
import styles from "./AddTodo.module.css";

export default function AddTodo({ onAdd }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    try {
      setBusy(true);
      await onAdd(trimmed);
      setText("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.row}>
      <input
        className={styles.input}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="Add a new task…"
        maxLength={500}
        disabled={busy}
      />
      <button className={styles.btn} onClick={submit} disabled={busy || !text.trim()}>
        {busy ? "…" : "+ Add"}
      </button>
    </div>
  );
}
