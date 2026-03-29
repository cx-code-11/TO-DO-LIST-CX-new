import { useState } from "react";
import styles from "./AddClientModal.module.css";

export default function AddClientModal({ onSave, onClose }) {
  const [name,      setName]      = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [busy,      setBusy]      = useState(false);
  const [error,     setError]     = useState(null);

  const handleSubdomain = (v) =>
    setSubdomain(v.toLowerCase().replace(/[^a-z0-9-]/g, ""));

  const submit = async () => {
    if (!name.trim() || !subdomain.trim() || busy) return;
    try {
      setBusy(true);
      setError(null);
      await onSave(name.trim(), subdomain.trim());
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.box}>
        <h3 className={styles.title}>Register New Client</h3>

        <div className={styles.field}>
          <label className={styles.label}>Client Name</label>
          <input
            className={styles.input}
            type="text"
            placeholder="Cmx Corp"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Subdomain</label>
          <input
            className={styles.input}
            type="text"
            placeholder="cmx"
            value={subdomain}
            onChange={(e) => handleSubdomain(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
          {subdomain && (
            <span className={styles.preview}>{subdomain}.ciphermutex.com</span>
          )}
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <button className={styles.cancel} onClick={onClose}>Cancel</button>
          <button
            className={styles.save}
            onClick={submit}
            disabled={busy || !name.trim() || !subdomain.trim()}
          >
            {busy ? "Creating…" : "Create Client"}
          </button>
        </div>
      </div>
    </div>
  );
}
