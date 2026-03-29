import { useState, useEffect, useMemo } from "react";
import { useAdminData }   from "./hooks/useAdminData";
import LoginGate          from "./components/LoginGate";
import Sidebar            from "./components/Sidebar";
import OverviewCards      from "./components/OverviewCards";
import ClientTabs         from "./components/ClientTabs";
import TodoTable          from "./components/TodoTable";
import AddClientModal     from "./components/AddClientModal";
import "./App.css";

export default function App() {
  const [authed,       setAuthed]       = useState(false);
  const [view,         setView]         = useState("overview");
  const [activeClient, setActiveClient] = useState(null);
  const [showModal,    setShowModal]    = useState(false);

  const { stats, todos, loading, error, load, createClient } = useAdminData();

  // Load data once authenticated
  useEffect(() => {
    if (authed) load();
  }, [authed, load]);

  // Auto-select first client tab
  useEffect(() => {
    if (stats.length && !activeClient) setActiveClient(stats[0].id);
  }, [stats, activeClient]);

  // Filter todos to the active client tab
  const clientTodos = useMemo(
    () => todos.filter((t) => t.clientId === activeClient),
    [todos, activeClient]
  );

  if (!authed) return <LoginGate onSuccess={() => setAuthed(true)} />;

  return (
    <div className="layout">
      <Sidebar active={view} onChange={setView} stats={stats} />

      <main className="content">
        <div className="topbar">
          <h1 className="page-title">
            {view === "overview" ? "Overview" : "All Clients"}
          </h1>
          <div className="topbar-actions">
            <button className="btn-refresh" onClick={load} disabled={loading}>
              {loading ? "…" : "↻ Refresh"}
            </button>
            <button className="btn-add-client" onClick={() => setShowModal(true)}>
              + New Client
            </button>
          </div>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <OverviewCards stats={stats} />

        {loading && !stats.length ? (
          <div className="loading">Loading…</div>
        ) : (
          <>
            <ClientTabs
              stats={stats}
              activeId={activeClient}
              onChange={setActiveClient}
            />
            <TodoTable todos={clientTodos} />
          </>
        )}
      </main>

      {showModal && (
        <AddClientModal
          onSave={createClient}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
