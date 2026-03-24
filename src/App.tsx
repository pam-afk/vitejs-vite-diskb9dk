import { useState, useEffect } from "react";

const WRITE_URL = "/.netlify/functions/proxy";

const KONTAKTART    = ["Formular", "Telefon", "E-Mail", "Direktcall"];
const QUELLEN       = ["Google Ads", "Google Organic", "Empfehlung", "Messe", "Social Media", "Sonstige"];
const SEGMENTE      = ["B2C", "B2B"];
const QUALIFIKATION = ["offen", "qualifiziert", "Erweiterung Bestandskunde", "unqualifiziert", "Spam"];
const STATUS        = ["neu", "in Bearbeitung", "Angebot", "Abschluss", "verloren"];
const ZUSTAENDIG    = ["Katrin", "Jutta", "Philipp", "Sonstige"];

const QUAL_FARBEN: Record<string, { bg: string; color: string }> = {
  "qualifiziert":              { bg: "#d1fae5", color: "#065f46" },
  "Erweiterung Bestandskunde": { bg: "#dbeafe", color: "#1e40af" },
  "unqualifiziert":            { bg: "#fef3c7", color: "#92400e" },
  "Spam":                      { bg: "#fee2e2", color: "#991b1b" },
  "offen":                     { bg: "#f3f4f6", color: "#374151" },
};
const STATUS_FARBEN: Record<string, { bg: string; color: string }> = {
  "neu":            { bg: "#f3f4f6", color: "#374151" },
  "in Bearbeitung": { bg: "#fef3c7", color: "#92400e" },
  "Angebot":        { bg: "#dbeafe", color: "#1e40af" },
  "Abschluss":      { bg: "#d1fae5", color: "#065f46" },
  "verloren":       { bg: "#fee2e2", color: "#991b1b" },
};

interface Lead {
  rowIndex: number;
  datum: string;
  name: string;
  kontaktart: string;
  quelle: string;
  segment: string;
  qualifikation: string;
  status: string;
  zustaendig: string;
  kommentar: string;
}

type LeadForm = Omit<Lead, "rowIndex">;

async function fetchLeads(): Promise<Lead[]> {
  const res  = await fetch("/.netlify/functions/proxy");
  const data = await res.json();
  if (!data.success || !data.leads) return [];
  return data.leads;
}

async function appendLead(lead: LeadForm) {
  await fetch(WRITE_URL, {
    method: "POST",
    body: JSON.stringify({ action: "append", lead }),
  });
}

async function updateLead(rowIndex: number, lead: LeadForm) {
  await fetch(WRITE_URL, {
    method: "POST",
    body: JSON.stringify({ action: "update", rowIndex, lead }),
  });
}

async function deleteLead(rowIndex: number) {
  await fetch(WRITE_URL, {
    method: "POST",
    body: JSON.stringify({ action: "delete", rowIndex }),
  });
}

function Badge({ value, map }: { value: string; map: Record<string, { bg: string; color: string }> }) {
  const s = map[value] || { bg: "#f3f4f6", color: "#374151" };
  return (
    <span style={{ background: s.bg, color: s.color, padding: "2px 8px", borderRadius: "12px",
                   fontSize: "12px", fontWeight: 600, whiteSpace: "nowrap" }}>{value || "—"}</span>
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: "6px",
               padding: "6px 8px", fontSize: "13px", background: "white" }}>
      <option value="">—</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function KPI({ label, value, sub, bg }: { label: string; value: string | number; sub?: string; bg?: string }) {
  return (
    <div style={{ background: bg || "#f8fafc", border: "1px solid #e2e8f0",
                  borderRadius: "10px", padding: "14px 18px", flex: 1, minWidth: "120px" }}>
      <div style={{ fontSize: "26px", fontWeight: 700, color: "#1f497d" }}>{value}</div>
      <div style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>{label}</div>
      {sub && <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>{sub}</div>}
    </div>
  );
}

const emptyForm: LeadForm = {
  datum: new Date().toLocaleDateString("de-DE"),
  name: "", kontaktart: "", quelle: "", segment: "",
  qualifikation: "offen", status: "neu", zustaendig: "", kommentar: ""
};

export default function App() {
  const [leads, setLeads]       = useState<Lead[]>([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [editId, setEditId]     = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter]     = useState({ quelle: "", segment: "", status: "" });
  const [form, setForm]         = useState<LeadForm>(emptyForm);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    setLeads(await fetchLeads());
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    if (editId !== null) await updateLead(editId, form);
    else await appendLead(form);
    await load();
    setForm(emptyForm);
    setEditId(null);
    setShowForm(false);
    setSaving(false);
  }

  async function handleDelete(rowIndex: number) {
    if (!confirm("Lead wirklich löschen?")) return;
    setSaving(true);
    await deleteLead(rowIndex);
    await load();
    setSaving(false);
  }

  function handleEdit(lead: Lead) {
    const { rowIndex, ...rest } = lead;
    setForm(rest);
    setEditId(rowIndex);
    setShowForm(true);
  }

  const filtered = leads.filter(l =>
    (!filter.quelle  || l.quelle  === filter.quelle) &&
    (!filter.segment || l.segment === filter.segment) &&
    (!filter.status  || l.status  === filter.status)
  );

  const gesamt       = leads.length;
  const qualifiziert = leads.filter(l => l.qualifikation === "qualifiziert" || l.qualifikation === "Erweiterung Bestandskunde").length;
  const abschluesse  = leads.filter(l => l.status === "Abschluss").length;
  const quote        = qualifiziert > 0 ? Math.round(abschluesse / qualifiziert * 100) : 0;
  const spam         = leads.filter(l => l.qualifikation === "Spam").length;

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "28px", background: "#f8fafc", minHeight: "100vh" }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <div style={{ fontSize: "22px", fontWeight: 700, color: "#1f497d" }}>CS Energiesysteme — Leads</div>
          <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "2px" }}>Eine Zeile pro Lead. Vollständig und konsequent gepflegt.</div>
        </div>
        <button onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }}
          style={{ padding: "9px 18px", background: "#1f497d", color: "white", border: "none",
                   borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "14px" }}>
          + Lead hinzufügen
        </button>
      </div>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "24px" }}>
        <KPI label="Leads gesamt"   value={gesamt} />
        <KPI label="Qualifiziert"   value={qualifiziert} sub={`${gesamt > 0 ? Math.round(qualifiziert/gesamt*100) : 0}% aller Eingänge`} bg="#eff6ff" />
        <KPI label="Abschlüsse"     value={abschluesse} bg="#f0fdf4" />
        <KPI label="Abschlussquote" value={`${quote}%`} sub="von qualifizierten Leads" bg="#f0fdf4" />
        <KPI label="Spam / wertlos" value={spam} bg="#fff7ed" />
      </div>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "16px" }}>
        {([
          { key: "quelle",  opts: QUELLEN,  label: "Quelle" },
          { key: "segment", opts: SEGMENTE, label: "Segment" },
          { key: "status",  opts: STATUS,   label: "Status" },
        ] as { key: keyof typeof filter; opts: string[]; label: string }[]).map(f => (
          <select key={f.key} value={filter[f.key]}
            onChange={e => setFilter(x => ({ ...x, [f.key]: e.target.value }))}
            style={{ padding: "7px 12px", borderRadius: "6px", border: "1px solid #d1d5db",
                     fontSize: "13px", background: "white" }}>
            <option value="">Alle {f.label}n</option>
            {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ))}
        {(filter.quelle || filter.segment || filter.status) &&
          <button onClick={() => setFilter({ quelle: "", segment: "", status: "" })}
            style={{ padding: "7px 12px", borderRadius: "6px", border: "1px solid #d1d5db",
                     background: "white", cursor: "pointer", fontSize: "13px", color: "#6b7280" }}>
            Filter zurücksetzen
          </button>}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>Daten werden geladen…</div>
      ) : (
        <div style={{ overflowX: "auto", borderRadius: "10px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", background: "white", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#1f497d", color: "white" }}>
                {["Datum","Name / Unternehmen","Kontaktart","Quelle","Segment","Qualifikation","Status","Zuständig","Kommentar",""].map(h => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", whiteSpace: "nowrap", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={10} style={{ padding: "24px", textAlign: "center", color: "#9ca3af" }}>Keine Leads gefunden.</td></tr>
              )}
              {filtered.map((l, i) => (
                <tr key={l.rowIndex} style={{ borderBottom: "1px solid #f0f0f0", background: i % 2 === 0 ? "white" : "#fafafa" }}>
                  <td style={{ padding: "8px 12px", whiteSpace: "nowrap" }}>{l.datum}</td>
                  <td style={{ padding: "8px 12px", fontWeight: 500 }}>{l.name}</td>
                  <td style={{ padding: "8px 12px" }}>{l.kontaktart}</td>
                  <td style={{ padding: "8px 12px" }}>{l.quelle}</td>
                  <td style={{ padding: "8px 12px" }}>{l.segment}</td>
                  <td style={{ padding: "8px 12px" }}><Badge value={l.qualifikation} map={QUAL_FARBEN} /></td>
                  <td style={{ padding: "8px 12px" }}><Badge value={l.status} map={STATUS_FARBEN} /></td>
                  <td style={{ padding: "8px 12px" }}>{l.zustaendig}</td>
                  <td style={{ padding: "8px 12px", color: "#6b7280", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.kommentar}</td>
                  <td style={{ padding: "8px 8px", whiteSpace: "nowrap" }}>
                    <button onClick={() => handleEdit(l)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#1f497d", fontSize: "13px", marginRight: "8px" }}>✏️</button>
                    <button onClick={() => handleDelete(l.rowIndex)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: "13px" }}>×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex",
                      alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "white", borderRadius: "12px", padding: "28px", width: "480px",
                        maxHeight: "90vh", overflowY: "auto", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize: "17px", fontWeight: 700, color: "#1f497d", marginBottom: "20px" }}>
              {editId ? "Lead bearbeiten" : "Neuer Lead"}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "4px" }}>Datum</label>
                <input type="text" value={form.datum} onChange={e => setForm(x => ({ ...x, datum: e.target.value }))}
                  style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: "6px",
                           padding: "7px 10px", fontSize: "13px", boxSizing: "border-box" }} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "4px" }}>Name / Unternehmen</label>
                <input type="text" value={form.name} onChange={e => setForm(x => ({ ...x, name: e.target.value }))}
                  style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: "6px",
                           padding: "7px 10px", fontSize: "13px", boxSizing: "border-box" }} />
              </div>
              {([
                { label: "Kontaktart",    key: "kontaktart",    opts: KONTAKTART },
                { label: "Quelle",        key: "quelle",        opts: QUELLEN },
                { label: "Segment",       key: "segment",       opts: SEGMENTE },
                { label: "Qualifikation", key: "qualifikation", opts: QUALIFIKATION },
                { label: "Status",        key: "status",        opts: STATUS },
                { label: "Zuständig",     key: "zustaendig",    opts: ZUSTAENDIG },
              ] as { label: string; key: keyof LeadForm; opts: string[] }[]).map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "4px" }}>{f.label}</label>
                  <Select value={form[f.key] as string} onChange={v => setForm(x => ({ ...x, [f.key]: v }))} options={f.opts} />
                </div>
              ))}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "4px" }}>Kommentar</label>
                <textarea value={form.kommentar} onChange={e => setForm(x => ({ ...x, kommentar: e.target.value }))}
                  rows={3} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: "6px",
                                    padding: "7px 10px", fontSize: "13px", resize: "vertical", boxSizing: "border-box" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px", justifyContent: "flex-end" }}>
              <button onClick={() => { setShowForm(false); setEditId(null); }}
                style={{ padding: "8px 16px", border: "1px solid #d1d5db", borderRadius: "6px",
                         background: "white", cursor: "pointer", fontSize: "13px" }}>
                Abbrechen
              </button>
              <button onClick={handleSave} disabled={saving}
                style={{ padding: "8px 20px", background: "#1f497d", color: "white", border: "none",
                         borderRadius: "6px", cursor: "pointer", fontWeight: 600, fontSize: "13px",
                         opacity: saving ? 0.6 : 1 }}>
                {saving ? "Speichert…" : "Speichern"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
