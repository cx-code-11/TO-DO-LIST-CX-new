import { useState } from "react";
import { adminApi, setToken } from "../api/admin";
import styles from "./LoginGate.module.css";

export default function LoginGate({ onSuccess }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(null);
  const [busy,  setBusy]  = useState(false);

  const submit = async () => {
    if (!value.trim() || busy) return;
    try {
      setBusy(true);
      setError(null);
      setToken(value.trim());
      await adminApi.getStats(); // verify token
      onSuccess();
    } catch {
      setError("Invalid token. Please try again.");
      setToken("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.box}>
        <div className={styles.icon}>⬡</div>
        <h2 className={styles.title}>Admin Access</h2>
        <p className={styles.sub}>Enter your admin token to continue</p>
        <input
          className={styles.input}
          type="password"
          placeholder="Admin token…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          autoFocus
        />
        {error && <p className={styles.error}>{error}</p>}
        <button className={styles.btn} onClick={submit} disabled={busy || !value.trim()}>
          {busy ? "Verifying…" : "Unlock Dashboard →"}
        </button>
      </div>
    </div>
  );
}
