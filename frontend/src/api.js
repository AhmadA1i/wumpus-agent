const BASE = process.env.REACT_APP_API_URL || "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const newGame  = (rows, cols, pit_prob) =>
  request("/new-game", { method: "POST", body: JSON.stringify({ rows, cols, pit_prob }) });

export const moveAgent = (row, col) =>
  request("/move", { method: "POST", body: JSON.stringify({ row, col }) });

export const getState  = () => request("/state");
export const revealAll = () => request("/reveal");
