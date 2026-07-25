import React, { useState, useEffect, useMemo } from "react";

const ACCENT = "#5EEAD4";
const ACCENT_SOFT = "rgba(94, 234, 212, 0.12)";
const INDIGO = "#818CF8";

const STAGES = ["New", "Contacted", "Qualified", "Won", "Lost"];
const STAGE_COLORS = {
  New: "#818CF8",
  Contacted: "#FBBF24",
  Qualified: "#38BDF8",
  Won: "#5EEAD4",
  Lost: "#F87171",
};

const SEED_LEADS = [
  { id: "l1", name: "Amir Sheikh", company: "Bright Retail Co.", email: "amir@brightretail.pk", value: 850000, stage: "Qualified" },
  { id: "l2", name: "Sana Malik", company: "Malik Textiles", email: "sana@maliktextiles.com", value: 420000, stage: "New" },
  { id: "l3", name: "Bilal Raza", company: "UrbanEats", email: "bilal@urbaneats.pk", value: 1200000, stage: "Won" },
  { id: "l4", name: "Ayesha Noor", company: "Noor Logistics", email: "ayesha@noorlog.com", value: 300000, stage: "Contacted" },
  { id: "l5", name: "Hamza Iqbal", company: "SwiftCart", email: "hamza@swiftcart.pk", value: 150000, stage: "Lost" },
];

function currency(n) {
  return "Rs " + n.toLocaleString("en-PK");
}

function StagePulse({ counts }) {
  const total = STAGES.reduce((s, k) => s + (counts[k] || 0), 0) || 1;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
      {STAGES.map((stage, i) => {
        const c = counts[stage] || 0;
        const width = Math.max((c / total) * 100, 4);
        return (
          <div
            key={stage}
            title={`${stage}: ${c}`}
            style={{
              height: 8,
              width: `${width}%`,
              background: STAGE_COLORS[stage],
              borderRadius: 4,
              opacity: c === 0 ? 0.25 : 1,
              transition: "width .3s ease",
            }}
          />
        );
      })}
    </div>
  );
}

export default function App() {
  const [leads, setLeads] = useState(() => {
    try {
      const saved = localStorage.getItem("nexus_crm_leads");
      return saved ? JSON.parse(saved) : SEED_LEADS;
    } catch {
      return SEED_LEADS;
    }
  });
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", company: "", email: "", value: "", stage: "New" });

  useEffect(() => {
    try {
      localStorage.setItem("nexus_crm_leads", JSON.stringify(leads));
    } catch {}
  }, [leads]);

  const counts = useMemo(() => {
    const c = {};
    STAGES.forEach((s) => (c[s] = 0));
    leads.forEach((l) => (c[l.stage] = (c[l.stage] || 0) + 1));
    return c;
  }, [leads]);

  const pipelineValue = useMemo(
    () => leads.filter((l) => l.stage !== "Lost").reduce((sum, l) => sum + Number(l.value || 0), 0),
    [leads]
  );
  const wonValue = useMemo(
    () => leads.filter((l) => l.stage === "Won").reduce((sum, l) => sum + Number(l.value || 0), 0),
    [leads]
  );

  const filtered = leads.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.company.toLowerCase().includes(search.toLowerCase());
    const matchesStage = stageFilter === "All" || l.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  const addLead = () => {
    if (!form.name.trim() || !form.company.trim()) return;
    setLeads((prev) => [
      { id: "l" + Date.now(), name: form.name, company: form.company, email: form.email, value: Number(form.value) || 0, stage: form.stage },
      ...prev,
    ]);
    setForm({ name: "", company: "", email: "", value: "", stage: "New" });
    setShowForm(false);
  };

  const updateStage = (id, stage) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, stage } : l)));
  };

  const deleteLead = (id) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0A0E12",
        color: "#E5E9EE",
        fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif",
        padding: "28px 20px",
      }}
    >
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 22 }}>Nexus CRM</div>
            <div style={{ fontSize: 12.5, color: "#8B95A1", marginTop: 2 }}>Lead Management & Sales Pipeline Dashboard</div>
          </div>
          <button
            onClick={() => setShowForm((s) => !s)}
            style={{
              background: ACCENT,
              color: "#06110F",
              border: "none",
              borderRadius: 10,
              padding: "10px 18px",
              fontWeight: 700,
              fontSize: 13.5,
              cursor: "pointer",
            }}
          >
            {showForm ? "Cancel" : "+ Add Lead"}
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Total Leads", value: leads.length },
            { label: "Open Pipeline", value: currency(pipelineValue) },
            { label: "Won Revenue", value: currency(wonValue) },
            { label: "Win Rate", value: leads.length ? Math.round((counts.Won / leads.length) * 100) + "%" : "0%" },
          ].map((s) => (
            <div key={s.label} style={{ background: "#10151C", border: "1px solid #1B222B", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ fontSize: 11.5, color: "#8B95A1", textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Pipeline pulse bar */}
        <div style={{ background: "#10151C", border: "1px solid #1B222B", borderRadius: 12, padding: "14px 18px", marginBottom: 20 }}>
          <StagePulse counts={counts} />
          <div style={{ display: "flex", gap: 16, marginTop: 10, flexWrap: "wrap" }}>
            {STAGES.map((s) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#8B95A1" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: STAGE_COLORS[s], display: "inline-block" }} />
                {s} ({counts[s] || 0})
              </div>
            ))}
          </div>
        </div>

        {/* Add lead form */}
        {showForm && (
          <div style={{ background: "#10151C", border: `1px solid ${ACCENT}55`, borderRadius: 12, padding: 18, marginBottom: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
            <input placeholder="Contact name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
            <input placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} style={inputStyle} />
            <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} />
            <input placeholder="Deal value (Rs)" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} style={inputStyle} />
            <select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })} style={inputStyle}>
              {STAGES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button onClick={addLead} style={{ background: ACCENT, color: "#06110F", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
              Save Lead
            </button>
          </div>
        )}

        {/* Search + filter */}
        <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
          <input
            placeholder="Search leads or companies…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...inputStyle, flex: 1, minWidth: 200 }}
          />
          <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} style={inputStyle}>
            <option value="All">All stages</option>
            {STAGES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Leads table */}
        <div style={{ background: "#10151C", border: "1px solid #1B222B", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1.4fr 1fr 0.8fr 0.6fr", padding: "10px 16px", fontSize: 11.5, color: "#8B95A1", textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "1px solid #1B222B" }}>
            <span>Contact</span><span>Company</span><span>Value</span><span>Stage</span><span></span>
          </div>
          {filtered.length === 0 && (
            <div style={{ padding: 24, textAlign: "center", color: "#5A6472", fontSize: 13.5 }}>No leads match.</div>
          )}
          {filtered.map((l) => (
            <div key={l.id} style={{ display: "grid", gridTemplateColumns: "1.4fr 1.4fr 1fr 0.8fr 0.6fr", padding: "12px 16px", alignItems: "center", borderBottom: "1px solid #161C24", fontSize: 13.5 }}>
              <div>
                <div style={{ fontWeight: 600 }}>{l.name}</div>
                <div style={{ fontSize: 11.5, color: "#5A6472" }}>{l.email}</div>
              </div>
              <div style={{ color: "#C4CBD4" }}>{l.company}</div>
              <div style={{ color: ACCENT, fontWeight: 600 }}>{currency(Number(l.value || 0))}</div>
              <select
                value={l.stage}
                onChange={(e) => updateStage(l.id, e.target.value)}
                style={{
                  background: "#161C24",
                  border: `1px solid ${STAGE_COLORS[l.stage]}66`,
                  color: STAGE_COLORS[l.stage],
                  borderRadius: 6,
                  padding: "5px 8px",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {STAGES.map((s) => (
                  <option key={s} value={s} style={{ color: "#000" }}>{s}</option>
                ))}
              </select>
              <button onClick={() => deleteLead(l.id)} style={{ background: "transparent", border: "none", color: "#5A6472", cursor: "pointer", fontSize: 13, justifySelf: "end" }}>
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  background: "#161C24",
  border: "1px solid #232B36",
  borderRadius: 8,
  color: "#E5E9EE",
  padding: "9px 12px",
  fontSize: 13.5,
  fontFamily: "inherit",
  outline: "none",
};
