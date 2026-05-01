import React, { useState } from "react";

const pulseKeyframes = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
`;

function NumInput({ label, value, onChange, min = 2, max = 10 }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "center" }}>
      <span style={{ fontSize: 9, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}
      </span>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{
          width:       48,
          padding:     "4px 6px",
          background:  "#0f172a",
          border:      "1px solid #334155",
          borderRadius: 6,
          color:       "#f1f5f9",
          fontSize:    14,
          fontFamily:  "monospace",
          textAlign:   "center",
          outline:     "none",
        }}
      />
    </label>
  );
}

export default function Controls({ onNewGame, onReveal, revealed, gameOver }) {
  const [rows,    setRows]    = useState(4);
  const [cols,    setCols]    = useState(4);
  const [pitProb, setPitProb] = useState(0.2);

  return (
    <>
      <style>{pulseKeyframes}</style>
      <div style={{
        display:        "flex",
        justifyContent: "center",
        alignItems:     "center",
        gap:            12,
        flexWrap:       "nowrap",
        padding:        "10px 12px",
        background:     "#0d1117",
        border:         "1px solid #1e293b",
        borderRadius:   12,
        marginBottom:   24,
      }}>
      <NumInput label="Rows"     value={rows}    onChange={setRows}    min={2} max={10} />
      <NumInput label="Cols"     value={cols}    onChange={setCols}    min={2} max={10} />

      <label style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "center" }}>
        <span style={{ fontSize: 9, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>
          Pit ({Math.round(pitProb * 100)}%)
        </span>
        <input
          type="range"
          min={0.05} max={0.4} step={0.05}
          value={pitProb}
          onChange={e => setPitProb(Number(e.target.value))}
          style={{ width: 80, accentColor: "#6366f1", cursor: "pointer" }}
        />
      </label>

      <button
        onClick={() => onNewGame(rows, cols, pitProb)}
        style={{
          padding:       "10px 28px",
          background:    "linear-gradient(135deg, #6366f1, #06b6d4, #6366f1)",
          backgroundSize: "200% 100%",
          border:        "none",
          borderRadius:  8,
          color:         "#fff",
          fontWeight:    700,
          fontSize:      15,
          cursor:        "pointer",
          letterSpacing: 0.5,
          animation:     gameOver === null ? "pulse 2s infinite" : "none",
          transition:    "all 0.3s ease",
          boxShadow:     "0 0 20px rgba(99,102,241,0.4)",
        }}
      >
        ▶ New Game
      </button>

      <button
        onClick={onReveal}
        disabled={!gameOver && !revealed}
        style={{
          padding:    "8px 16px",
          background: revealed ? "#1e293b" : "#0f172a",
          border:     "1px solid #334155",
          borderRadius: 6,
          color:      revealed ? "#f1f5f9" : "#475569",
          fontWeight:  600,
          fontSize:    13,
          cursor:     "pointer",
          transition: "all 0.2s ease",
        }}
      >
        {revealed ? "🙈 Hide" : "👁 Reveal"}
      </button>
    </div>
    </>
  );
}
