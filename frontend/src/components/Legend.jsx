import React from "react";

const ITEMS = [
  { color: "#1e3a5f", border: "#3b82f6", label: "Visited" },
  { color: "#14532d", border: "#22c55e", label: "Safe (proven)"  },
  { color: "#1c1c2e", border: "#374151", label: "Unknown" },
  { color: "#450a0a", border: "#ef4444", label: "Danger" },
];

export default function Legend() {
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      gap: 24,
      flexWrap: "wrap",
      marginBottom: 20,
      padding: "12px 0",
    }}>
      {ITEMS.map(({ color, border, label }) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 12,
            height: 12,
            background: color,
            borderRadius: "50%",
            boxShadow: `0 0 8px ${border}80`,
            border: `2px solid ${border}`,
          }} />
          <span style={{ fontSize: 12, color: "#94a3b8" }}>{label}</span>
        </div>
      ))}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          width: 12,
          height: 12,
          background: "#fbbf24",
          borderRadius: "50%",
          boxShadow: "0 0 8px #fbbf2480",
          border: "2px solid #fbbf24",
        }} />
        <span style={{ fontSize: 12, color: "#94a3b8" }}>Agent 🤖</span>
      </div>
    </div>
  );
}
