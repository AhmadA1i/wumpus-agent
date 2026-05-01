import React, { useState, useCallback } from "react";
import Grid      from "./components/Grid";
import Dashboard from "./components/Dashboard";
import Controls  from "./components/Controls";
import Legend    from "./components/Legend";
import { newGame, moveAgent, revealAll } from "./api";

const keyframes = `
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes gridPattern {
    0% { background-position: 0 0; }
  }
`;

const EMPTY_STATE = {
  pos:                   [0, 0],
  rows:                  0,
  cols:                  0,
  cell_statuses:         {},
  visited:               [],
  kb_size:               0,
  total_inference_steps: 0,
  inference_log:         [],
  kb_clauses_sample:     [],
  last_percepts:         {},
  alive:                 true,
  won:                   false,
};

export default function App() {
  const [gameState,     setGameState]     = useState(null);
  const [banner,        setBanner]        = useState(null);   // { type, message }
  const [revealedWorld, setRevealedWorld] = useState(null);
  const [loading,       setLoading]       = useState(false);

  const gameOver = gameState && (!gameState.alive || gameState.won);

  // ----------------------------------------------------------------
  // Start a new game
  // ----------------------------------------------------------------
  const handleNewGame = useCallback(async (rows, cols, pitProb) => {
    setLoading(true);
    setBanner(null);
    setRevealedWorld(null);
    try {
      const data = await newGame(rows, cols, pitProb);
      setGameState(data);
      setBanner({ type: "info", message: "🗺 Game started! Click an adjacent cell to move the agent." });
    } catch (err) {
      setBanner({ type: "error", message: `❌ ${err.message}` });
    }
    setLoading(false);
  }, []);

  // ----------------------------------------------------------------
  // Move the agent
  // ----------------------------------------------------------------
  const handleCellClick = useCallback(async (r, c) => {
    if (!gameState || gameOver || loading) return;
    setLoading(true);
    try {
      const data = await moveAgent(r, c);
      setGameState(data);

      if (data.status === "dead") {
        setBanner({ type: "error", message: data.message });
        // Auto-reveal the world after death
        const world = await revealAll();
        setRevealedWorld(world.grid);
      } else if (data.status === "won") {
        setBanner({ type: "success", message: data.message });
        const world = await revealAll();
        setRevealedWorld(world.grid);
      } else if (data.error) {
        setBanner({ type: "warning", message: `⚠ ${data.error}` });
      } else {
        const p = data.last_percepts || {};
        const hints = [];
        if (p.breeze)  hints.push("💨 Breeze");
        if (p.stench)  hints.push("🦨 Stench");
        if (p.glitter) hints.push("✨ Glitter!");
        setBanner({
          type:    "info",
          message: hints.length ? hints.join(" · ") : `Moved to (${r}, ${c}) — all clear.`,
        });
      }
    } catch (err) {
      setBanner({ type: "error", message: `❌ ${err.message}` });
    }
    setLoading(false);
  }, [gameState, gameOver, loading]);

  // ----------------------------------------------------------------
  // Reveal / hide world
  // ----------------------------------------------------------------
  const handleReveal = useCallback(async () => {
    if (revealedWorld) { setRevealedWorld(null); return; }
    try {
      const data = await revealAll();
      setRevealedWorld(data.grid);
    } catch (err) {
      setBanner({ type: "error", message: `❌ ${err.message}` });
    }
  }, [revealedWorld]);

  // ----------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------
  const BANNER_STYLES = {
    info:    { bg: "rgba(59,130,246,0.12)",  border: "#1d4ed8",  color: "#93c5fd" },
    success: { bg: "rgba(34,197,94,0.12)",   border: "#15803d",  color: "#4ade80" },
    error:   { bg: "rgba(239,68,68,0.12)",   border: "#b91c1c",  color: "#fca5a5" },
    warning: { bg: "rgba(234,179,8,0.12)",   border: "#a16207",  color: "#fde047" },
  };

  return (
    <>
      <style>{keyframes}</style>
      <div style={{
        minHeight:   "100vh",
        background:  "radial-gradient(ellipse at top, #0d1b2a 0%, #060b14 70%), repeating-linear-gradient(0deg, rgba(59,130,246,0.03) 0px, rgba(59,130,246,0.03) 1px, transparent 1px, transparent 2px)",
        color:       "#f1f5f9",
        fontFamily:  "'Courier New', Courier, monospace",
        paddingTop: 32,
      }}>
        <div style={{
          maxWidth: 1100,
          margin: "0 auto",
          paddingLeft: 40,
          paddingRight: 40,
        }}>
        {/* Header */}
        <div style={{
          marginBottom: 28,
          paddingBottom: 20,
          borderBottom: "1px solid #1e293b",
        }}>
          <h1 style={{
            margin: 0,
            fontSize: 36,
            fontWeight: 800,
            letterSpacing: 1,
            background: "linear-gradient(90deg, #60a5fa, #a78bfa)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 0 20px rgba(96,165,250,0.8)",
            filter: "drop-shadow(0 0 20px rgba(96,165,250,0.4))",
          }}>
            🦂 Wumpus World — Logic Agent
          </h1>
          <p style={{ margin: "8px 0 0", fontSize: 13, color: "#475569" }}>
            Knowledge-Based Agent · Propositional Logic · Resolution Refutation
          </p>
        </div>

      {/* Controls */}
      <Controls
        onNewGame={handleNewGame}
        onReveal={handleReveal}
        revealed={!!revealedWorld}
        gameOver={gameOver}
      />

      {/* Main content */}
      {gameState ? (
        <>
          <Legend />

          {/* Banner - Above the grid */}
          {banner && (() => {
            const s = BANNER_STYLES[banner.type];
            return (
              <div style={{
                padding:      "10px 18px",
                paddingLeft: 16,
                background:   s.bg,
                border:       `1px solid ${s.border}`,
                borderLeft: `4px solid ${s.border}`,
                borderRadius: 8,
                color:        s.color,
                fontSize:     13,
                marginBottom: 16,
                fontWeight: 600,
                animation: "fadeIn 0.4s ease-out",
              }}>
                {banner.message}
              </div>
            );
          })()}

          {/* Status Strip - Above the grid */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 16px",
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            borderRadius: 8,
            marginBottom: 16,
            fontSize: 13,
            color: "#cbd5e1",
          }}>
            <div style={{ display: "flex", gap: 24 }}>
              <div>
                <span style={{ color: "#64748b" }}>Position:</span> {"("}{ gameState.pos[0]}, {gameState.pos[1]}{")"}​
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "#64748b" }}>Status:</span>
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}>
                  <span style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: gameState.won ? "#fbbf24" : (gameState.alive ? "#22c55e" : "#ef4444"),
                    display: "inline-block",
                  }} />
                  {gameState.won ? "Won" : (gameState.alive ? "Alive" : "Dead")}
                </span>
              </div>
            </div>
            <div style={{ color: "#64748b" }}>
              Steps: <span style={{ color: "#a78bfa", fontFamily: "monospace", fontWeight: 600 }}>{gameState.visited?.length || 0}</span>
            </div>
          </div>

          {/* Grid and Dashboard side by side */}
          <div style={{ display: "flex", flexDirection: "row", gap: 40, alignItems: "flex-start" }}>
            {/* Grid */}
            <div>
              <Grid
                rows={gameState.rows}
                cols={gameState.cols}
                cellStatuses={gameState.cell_statuses}
                agentPos={gameState.pos}
                revealedWorld={revealedWorld}
                onCellClick={handleCellClick}
                gameOver={gameOver}
              />
              {loading && (
                <div style={{ marginTop: 10, fontSize: 12, color: "#475569" }}>
                  ⚙ Resolving KB…
                </div>
              )}
            </div>

            {/* Dashboard */}
            <Dashboard state={gameState} />
          </div>
        </>
      ) : (
        <div style={{
          marginTop:  60,
          textAlign:  "center",
          color:      "#334155",
          fontSize:   16,
        }}>
          Configure grid dimensions above and press <strong style={{ color: "#6366f1" }}>▶ New Game</strong> to begin.
        </div>
      )}
        </div>
      </div>
    </>
  );
}
