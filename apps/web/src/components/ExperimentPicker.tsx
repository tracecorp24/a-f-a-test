import { Link } from "react-router-dom";
import { STATUS_LABEL, type ExperimentSummary } from "../api/client";
import { THEME } from "../data/mockData";

export function ExperimentPicker({
  list,
  value,
  onChange,
}: {
  list: ExperimentSummary[];
  value: string | null;
  onChange: (id: string) => void;
}) {
  if (!list.length) return null;
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, color: THEME.muted }}>
      Deney
      <select
        className="arena-select"
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        style={{ maxWidth: 320, background: THEME.panelAlt, color: THEME.text, border: `1px solid ${THEME.line}`, borderRadius: 6, padding: "6px 8px" }}
      >
        {list.map((item) => (
          <option key={item.id} value={item.id}>
            {new Date(item.created_at).toLocaleString("tr-TR")} · {STATUS_LABEL[item.status]} · {item.objective.slice(0, 40) || item.id}
          </option>
        ))}
      </select>
    </label>
  );
}

export function NoExperiment({ loading, error }: { loading: boolean; error: string }) {
  return (
    <section className="arena-card arena-card-pad" role={error ? "alert" : "status"}>
      {loading ? (
        <p>Deneyler yükleniyor…</p>
      ) : error ? (
        <p style={{ color: THEME.red }}>{error}</p>
      ) : (
        <>
          <h2 className="arena-card-title">Henüz bir deney yok</h2>
          <p style={{ color: THEME.muted }}>
            Önce Görev Stüdyosu’nda bir görev tanımlayıp benchmark kriterlerini onaylayın ve arenayı başlatın.
          </p>
          <Link to="/task-pipeline" className="arena-btn arena-btn-primary">Görev Stüdyosuna Git →</Link>
        </>
      )}
    </section>
  );
}
