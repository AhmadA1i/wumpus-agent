import React from "react";

const STATUS_CONFIG = {
  visited: { bg: "#1e3a5f", border: "#3b82f6", glow: "0 0 12px rgba(59,130,246,0.4)" },
  safe:    { bg: "#14532d", border: "#22c55e", glow: "0 0 12px rgba(34,197,94,0.4)"  },
  unknown: { bg: "#1c1c2e", border: "#374151", glow: "none"                           },
  danger:  { bg: "#450a0a", border: "#ef4444", glow: "0 0 12px rgba(239,68,68,0.6)"  },
};

const EMOJI = {
  agent:   "🤖",
  pit:     "🕳️",
  wumpus:  "👾",
  gold:    "✨",
  danger:  "💀",
};

export default function Grid({
  rows, cols,
  cellStatuses,
  agentPos,
  revealedWorld,
  onCellClick,
  gameOver,
}) {
  const cellSize = Math.max(80, Math.min(100, Math.floor(560 / Math.max(rows, cols))));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} style={{ display: "flex", gap: 4 }}>
          {Array.from({ length: cols }, (_, c) => {
            const key    = `${r},${c}`;
            const status = cellStatuses[key] || "unknown";
            const cfg    = STATUS_CONFIG[status];
            const isAgent = agentPos[0] === r && agentPos[1] === c;
            const revealed = revealedWorld?.[r]?.[c];

            let icon = "";
            if (isAgent)                          icon = EMOJI.agent;
            else if (revealed?.pit)               icon = EMOJI.pit;
            else if (revealed?.wumpus)            icon = EMOJI.wumpus;
            else if (revealed?.gold)              icon = EMOJI.gold;
            else if (status === "danger")         icon = EMOJI.danger;

            const clickable = !gameOver && status !== "danger";

            const baseGlow = isAgent
              ? "0 0 24px rgba(250,204,21,0.9), inset 0 0 12px rgba(250,204,21,0.3)"
              : status === "visited"
              ? `${cfg.glow}, inset 0 0 8px rgba(59,130,246,0.2)`
              : cfg.glow;

            return (
              <div
                key={c}
                onClick={() => clickable && onCellClick(r, c)}
                title={`(${r}, ${c}) — ${status}`}
                style={{
                  width:          cellSize,
                  height:         cellSize,
                  background:     cfg.bg,
                  border:         `2px solid ${cfg.border}`,
                  borderRadius:   8,
                  boxShadow:      baseGlow,
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  fontSize:       cellSize * 0.38,
                  cursor:         clickable ? "pointer" : "default",
                  transition:     "all 0.25s ease",
                  position:       "relative",
                  userSelect:     "none",
                  transform:      clickable ? "scale(1)" : "scale(1)",
                }}
                onMouseEnter={(e) => {
                  if (clickable) {
                    e.currentTarget.style.transform = "scale(1.05)";
                    if (status === "safe") {
                      e.currentTarget.style.boxShadow = "0 0 28px rgba(34,197,94,0.8), inset 0 0 12px rgba(34,197,94,0.3)";
                    } else if (status === "unknown") {
                      e.currentTarget.style.boxShadow = "0 0 28px rgba(59,130,246,0.8), inset 0 0 12px rgba(59,130,246,0.3)";
                    }
                  }
                }}
                onMouseLeave={(e) => {
                  if (clickable) {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = baseGlow;
                  }
                }}
              >
                {icon}

                {/* Coordinate label */}
                <span style={{
                  position:  "absolute",
                  bottom:    2,
                  right:     4,
                  fontSize:  9,
                  color:     "rgba(255,255,255,0.25)",
                  fontFamily: "monospace",
                }}>
                  {r},{c}
                </span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
