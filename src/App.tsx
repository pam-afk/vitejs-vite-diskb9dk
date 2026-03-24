import { useState } from "react";

const KONTAKTART = ["Formular", "Telefon", "E-Mail", "Direktcall"];
const QUELLE = ["Google Ads", "Google Organic", "Empfehlung", "Messe", "Social Media", "Sonstige"];
const SEGMENT = ["B2C", "B2B"];
const QUALIFIKATION = ["offen", "qualifiziert", "Erweiterung Bestandskunde", "unqualifiziert", "Spam"];
const STATUS = ["neu", "in Bearbeitung", "Angebot", "Abschluss", "verloren"];
const ZUSTAENDIG = ["Katrin", "Jutta", "Philipp", "Sonstige"];

const SPALTEN = [
  { key: "datum", label: "Datum", w: "110px" },
  { key: "name", label: "Name / Unternehmen", w: "160px" },
  { key: "kontaktart", label: "Kontaktart", w: "120px" },
  { key: "quelle", label: "Quelle", w: "140px" },
  { key: "segment", label: "B2C / B2B", w: "100px" },
  { key: "qualifikation", label: "Qualifikation", w: "170px" },
  { key: "status", label: "Status", w: "130px" },
  { key: "zustaendig", label: "Zuständig", w: "110px" },
  { key: "kommentar", label: "Kommentar", w: "180px" },
];

const emptyRow = () => ({
  id: crypto.randomUUID(),
  datum: "",
  name: "",
  kontaktart: "",
  quelle: "",
  segment: "",
  qualifikation: "offen",
  status: "neu",
  zustaendig: "",
  kommentar: "",
});

const BEISPIEL = [
  { id: "1", datum: "02.01.2023", name: "Mustermann GmbH", kontaktart: "Formular", quelle: "Google Ads", segment: "B2B", qualifikation: "qualifiziert", status: "Abschluss", zustaendig: "Katrin", kommentar: "follow-up erledigt" },
  { id: "2", datum: "09.01.2023", name: "Meyer GmbH", kontaktart: "Telefon", quelle: "Google Organic", segment: "B2C", qualifikation: "unqualifiziert", status: "verloren", zustaendig: "Jutta", kommentar: "kein konkreter Bedarf" },
  { id: "3", datum: "15.01.2023", name: "Müller GmbH", kontaktart: "E-Mail", quelle: "Messe", segment: "B2B", qualifikation: "qualifiziert", status: "in Bearbeitung", zustaendig: "Katrin", kommentar: "" },
  { id: "4", datum: "23.01.2023", name: "Schmidt", kontaktart: "Telefon", quelle: "Empfehlung", segment: "B2C", qualifikation: "qualifiziert", status: "Abschluss", zustaendig: "Philipp", kommentar: "" },
];

const QUAL_FARBEN = {
  "qualifiziert": "#d1fae5",
  "Erweiterung Bestandskunde": "#dbeafe",
  "unqualifiziert": "#fef3c7",
  "Spam": "#fee2e2",
  "offen": "#f3f4f6",
};
const STATUS_FARBEN = {
  "neu": "#f3f4f6",
  "in Bearbeitung": "#fef3c7",
  "Angebot": "#dbeafe",
  "Abschluss": "#d1fae5",
  "verloren": "#fee2e2",
};

function Select({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{ width: "100%", border: "none", background: "transparent", fontSize: "13px", padding: "2px 0", cursor: "pointer" }}
    >
      <option value="">{placeholder || "—"}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function KPIBox({ label, value, sub, color }) {
  return (
    <div style={{ background: color || "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "14px 18px", minWidth: "130px", flex: 1 }}>
      <div style={{ fontSize: "22px", fontWeight: 700, color: "#1f497d" }}>{value}</div>
      <div style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>{label}</div>
      {sub && <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>{sub}</div>}
    </div>
  );
}

export default function App() {
  const [rows, setRows] = useState(BEISPIEL);
  const [filterQuelle, setFilterQuelle] = useState("");
  const [filterSegment, setFilterSegment] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const addRow = () => setRows(r => [...r, emptyRow()]);
  const delRow = (id) => setRows(r => r.filter(x => x.id !== id));
  const updateRow = (id, field, val) => setRows(r => r.map(x => x.id === id ? { ...x, [field]: val } : x));

  const filtered = rows.filter(r =>
    (!filterQuelle || r.quelle === filterQuelle) &&
    (!filterSegment || r.segment === filterSegment) &&
    (!filterStatus || r.status === filterStatus)
  );

  const gesamt = rows.length;
  const qualifiziert = rows.filter(r => r.qualifikation === "qualifiziert" || r.qualifikation === "Erweiterung Bestandskunde").length;
  const abschluesse = rows.filter(r => r.status === "Abschluss").length;
  const quote = qualifiziert > 0 ? Math.round((abschluesse / qualifiziert) * 100) : 0;
  const spam = rows.filter(r => r.qualifikation === "Spam").length;

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "24px", background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "20px", fontWeight: 700, color: "#1f497d" }}>CS Energiesysteme — Lead-Erfassung</div>
        <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "2px" }}>Eine Zeile pro Lead. Vollständig und konsequent gepflegt.</div>
      </div>

      {/* KPIs */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "20px" }}>
        <KPIBox label="Leads gesamt" value={gesamt} />
        <KPIBox label="Qualifizierte Leads" value={qualifiziert} sub={`${gesamt > 0 ? Math.round(qualifiziert/gesamt*100) : 0}% aller Eingänge`} color="#eff6ff" />
        <KPIBox label="Abschlüsse" value={abschluesse} color="#f0fdf4" />
        <KPIBox label="Abschlussquote" value={`${quote}%`} sub="von qualifizierten Leads" color="#f0fdf4" />
        <KPIBox label="Spam / wertlos" value={spam} color="#fff7ed" />
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "14px", flexWrap: "wrap" }}>
        {[
          { label: "Quelle", val: filterQuelle, set: setFilterQuelle, opts: QUELLE },
          { label: "Segment", val: filterSegment, set: setFilterSegment, opts: SEGMENT },
          { label: "Status", val: filterStatus, set: setFilterStatus, opts: STATUS },
        ].map(f => (
          <select key={f.label} value={f.val} onChange={e => f.set(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "13px", background: "white" }}>
            <option value="">Alle {f.label}n</option>
            {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ))}
        {(filterQuelle || filterSegment || filterStatus) &&
          <button onClick={() => { setFilterQuelle(""); setFilterSegment(""); setFilterStatus(""); }}
            style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #d1d5db", background: "white", cursor: "pointer", fontSize: "13px", color: "#6b7280" }}>
            Filter zurücksetzen
          </button>}
      </div>

      {/* Tabelle */}
      <div style={{ overflowX: "auto", borderRadius: "8px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", background: "white", fontSize: "13px" }}>
          <thead>
            <tr style={{ background: "#1f497d", color: "white" }}>
              {SPALTEN.map(s => (
                <th key={s.key} style={{ padding: "10px 12px", textAlign: "left", whiteSpace: "nowrap", width: s.w, fontWeight: 600 }}>{s.label}</th>
              ))}
              <th style={{ padding: "10px 8px", width: "36px" }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr key={row.id} style={{ borderBottom: "1px solid #f0f0f0", background: i % 2 === 0 ? "white" : "#fafafa" }}>
                <td style={{ padding: "7px 12px" }}>
                  <input type="text" value={row.datum} onChange={e => updateRow(row.id, "datum", e.target.value)}
                    placeholder="TT.MM.JJJJ"
                    style={{ border: "none", background: "transparent", width: "100%", fontSize: "13px" }} />
                </td>
                <td style={{ padding: "7px 12px" }}>
                  <input type="text" value={row.name} onChange={e => updateRow(row.id, "name", e.target.value)}
                    placeholder="Name / Firma"
                    style={{ border: "none", background: "transparent", width: "100%", fontSize: "13px" }} />
                </td>
                <td style={{ padding: "7px 12px" }}>
                  <Select value={row.kontaktart} onChange={v => updateRow(row.id, "kontaktart", v)} options={KONTAKTART} />
                </td>
                <td style={{ padding: "7px 12px" }}>
                  <Select value={row.quelle} onChange={v => updateRow(row.id, "quelle", v)} options={QUELLE} />
                </td>
                <td style={{ padding: "7px 12px" }}>
                  <Select value={row.segment} onChange={v => updateRow(row.id, "segment", v)} options={SEGMENT} />
                </td>
                <td style={{ padding: "7px 12px", background: QUAL_FARBEN[row.qualifikation] || "transparent" }}>
                  <Select value={row.qualifikation} onChange={v => updateRow(row.id, "qualifikation", v)} options={QUALIFIKATION} />
                </td>
                <td style={{ padding: "7px 12px", background: STATUS_FARBEN[row.status] || "transparent" }}>
                  <Select value={row.status} onChange={v => updateRow(row.id, "status", v)} options={STATUS} />
                </td>
                <td style={{ padding: "7px 12px" }}>
                  <Select value={row.zustaendig} onChange={v => updateRow(row.id, "zustaendig", v)} options={ZUSTAENDIG} />
                </td>
                <td style={{ padding: "7px 12px" }}>
                  <input type="text" value={row.kommentar} onChange={e => updateRow(row.id, "kommentar", e.target.value)}
                    placeholder="Notiz..."
                    style={{ border: "none", background: "transparent", width: "100%", fontSize: "13px" }} />
                </td>
                <td style={{ padding: "7px 8px", textAlign: "center" }}>
                  <button onClick={() => delRow(row.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: "16px", lineHeight: 1 }}>×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button onClick={addRow}
        style={{ marginTop: "12px", padding: "8px 16px", background: "#1f497d", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>
        + Lead hinzufügen
      </button>

      <div style={{ marginTop: "24px", padding: "14px 18px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px", fontSize: "12px", color: "#92400e", lineHeight: 1.6 }}>
        <strong>Hinweis zur Nutzung:</strong> Diese Vorlage ist als Google-Sheets- oder Excel-Datei am sinnvollsten – dann kann Jutta sie direkt befüllen und ihr habt wöchentlich Zugriff. Die Farblogik (Qualifikation, Status) lässt sich dort 1:1 übernehmen. Dieses Artifact zeigt die Struktur und Logik; die Daten werden hier nicht gespeichert.
      </div>
    </div>
  );
}