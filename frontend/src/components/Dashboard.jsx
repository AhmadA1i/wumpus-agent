import React from "react";

function Stat({ label, value, accent, borderColor }) {
  const borderColorMap = {
    "#60a5fa": "#3b82f6",
    "#a78bfa": "#a78bfa",
    "#34d399": "#10b981",
    "#fb923c": "#f97316",
  };

  const leftBorder = borderColorMap[accent] || "#64748b";

  return (
    <div style={{
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
      border: "1px solid #1e293b",
      borderLeft: `4px solid ${leftBorder}`,
      borderRadius: 8,
      padding: "10px 14px",
      marginBottom: 8,
      boxShadow: `inset 0 0 8px rgba(${leftBorder === '#3b82f6' ? '59,130,246' : leftBorder === '#a78bfa' ? '167,139,250' : leftBorder === '#10b981' ? '16,185,129' : '249,115,22'},0.1)`,
    }}>
      <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: accent || "#f1f5f9", fontFamily: "monospace" }}>
        {value ?? "—"}
      </div>
    </div>
  );
}

function PerceptBadge({ label, active }) {
  return (
    <span style={{
      display:      "inline-block",
      padding:      "4px 12px",
      borderRadius: 99,
      fontSize:     12,
      fontWeight:   600,
      marginRight:  6,
      marginBottom: 6,
      background:   active ? "rgba(251,191,36,0.2)" : "#1e293b",
      color:        active ? "#fbbf24" : "#475569",
      border:       active ? "1px solid #fbbf24" : "1px solid #1e293b",
      boxShadow:    active ? "0 0 12px rgba(251,191,36,0.6)" : "none",
      transition:   "all 0.3s",
    }}>
      {label}
    </span>
  );
}

function InferenceEntry({ entry, index }) {
  const safe    = entry.result === "safe";
  const colors  = safe
    ? { bg: "rgba(34,197,94,0.08)", border: "#166534", text: "#4ade80" }
    : { bg: "rgba(100,116,139,0.08)", border: "#334155", text: "#64748b" };

  return (
    <div style={{
      background:   colors.bg,
      border:       `1px solid ${colors.border}`,
      borderRadius: 6,
      padding:      "6px 10px",
      marginBottom: 4,
      fontSize:     12,
      fontFamily:   "monospace",
      display:      "flex",
      justifyContent: "space-between",
      alignItems:   "center",
    }}>
      <span style={{ color: "#94a3b8" }}>
        #{index + 1} &nbsp; cell ({entry.cell[0]},{entry.cell[1]})
      </span>
      <span style={{ color: colors.text, fontWeight: 700 }}>
        {entry.result} &nbsp;
        <span style={{ color: "#475569", fontWeight: 400 }}>
          ({entry.steps} steps)
        </span>
      </span>
    </div>
  );
}

export default function Dashboard({ state }) {
  const percepts = state.last_percepts || {};

  return (
    <div style={{
      width:      320,
      flexShrink: 0,
      color:      "#f1f5f9",
      fontFamily: "'Courier New', monospace",
    }}>
      {/* Metrics */}
      <div style={{ marginBottom: 20 }}>
        <SectionHeader>📊 Metrics</SectionHeader>
        <Stat label="Agent Position"    value={`(${state.pos?.[0]}, ${state.pos?.[1]})`} accent="#60a5fa" />
        <Stat label="KB Clauses"        value={state.kb_size}                             accent="#a78bfa" />
        <Stat label="Total Infer Steps" value={state.total_inference_steps?.toLocaleString()}               accent="#34d399" />
        <Stat label="Cells Visited"     value={state.visited?.length}                     accent="#fb923c" />
      </div>

      {/* Percepts */}
      <div style={{ marginBottom: 20 }}>
        <SectionHeader>👁 Active Percepts</SectionHeader>
        <div style={{ padding: "10px 0" }}>
          <PerceptBadge label="💨 Breeze"  active={percepts.breeze}  />
          <PerceptBadge label="🦨 Stench"  active={percepts.stench}  />
          <PerceptBadge label="✨ Glitter" active={percepts.glitter} />
        </div>
      </div>

      {/* Inference Log */}
      <div style={{ marginBottom: 20 }}>
        <SectionHeader>🔍 Inference Log (Recent)</SectionHeader>
        <div style={{ marginTop: 8 }}>
          {(state.inference_log || []).length === 0 && (
            <div style={{ color: "#475569", fontSize: 12 }}>No inferences yet.</div>
          )}
          {(state.inference_log || []).slice(-6).map((entry, i) => (
            <InferenceEntry key={i} entry={entry} index={i} />
          ))}
        </div>
      </div>

      {/* KB Sample */}
      <div>
        <SectionHeader>🧠 KB Clauses (sample)</SectionHeader>
        <div style={{
          background:   "#0a0f1a",
          border:       "1px solid #1e293b",
          borderRadius: 8,
          padding:      10,
          marginTop:    8,
          maxHeight:    160,
          overflowY:    "auto",
        }}>
          {(state.kb_clauses_sample || []).map((clause, i) => (
            <div key={i} style={{
              fontSize:    10,
              color:       "#475569",
              marginBottom: 3,
              fontFamily:  "monospace",
              wordBreak:   "break-all",
            }}>
              {clause}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ children }) {
  return (
    <div style={{
      fontSize:     11,
      fontWeight:   700,
      color:        "#475569",
      textTransform: "uppercase",
      letterSpacing: 2,
      borderBottom: "1px solid #1e293b",
      paddingBottom: 6,
      marginBottom:  8,
    }}>
      {children}
    </div>
  );
}
