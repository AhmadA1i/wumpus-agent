"""
Flask REST API for the Wumpus World Logic Agent.
Endpoints:
  POST /api/new-game   — start a new game
  POST /api/move       — move the agent
  GET  /api/state      — get current game state
  GET  /api/reveal     — reveal the hidden world (debug)
"""

import os

from flask import Flask, jsonify, request
from flask_cors import CORS
from world import create_world, serialize_world
from agent import Agent

app = Flask(__name__)
CORS(app)

# Single in-memory session (extend to sessions/DB for multi-user)
_state: dict = {"world": None, "agent": None}


# -----------------------------------------------------------------------
# POST /api/new-game
# Body: { "rows": int, "cols": int, "pit_prob": float (optional) }
# -----------------------------------------------------------------------
@app.route("/api/new-game", methods=["POST"])
def new_game():
    data     = request.get_json(force=True)
    rows     = max(2, min(10, int(data.get("rows", 4))))
    cols     = max(2, min(10, int(data.get("cols", 4))))
    pit_prob = float(data.get("pit_prob", 0.2))

    world = create_world(rows, cols, pit_prob)
    agent = Agent(world)
    _state["world"] = world
    _state["agent"] = agent

    return jsonify({"message": "New game started!", **agent.get_state()})


# -----------------------------------------------------------------------
# POST /api/move
# Body: { "row": int, "col": int }
# -----------------------------------------------------------------------
@app.route("/api/move", methods=["POST"])
def move():
    if not _state["agent"]:
        return jsonify({"error": "No game in progress. Start a new game first."}), 400

    data = request.get_json(force=True)
    try:
        row = int(data["row"])
        col = int(data["col"])
    except (KeyError, ValueError, TypeError):
        return jsonify({"error": "Request must include integer 'row' and 'col'."}), 400

    result = _state["agent"].move(row, col)
    return jsonify(result)


# -----------------------------------------------------------------------
# GET /api/state
# -----------------------------------------------------------------------
@app.route("/api/state", methods=["GET"])
def get_state():
    if not _state["agent"]:
        return jsonify({"error": "No game in progress."}), 400
    return jsonify(_state["agent"].get_state())


# -----------------------------------------------------------------------
# GET /api/reveal  — show the hidden world for debugging / post-game
# -----------------------------------------------------------------------
@app.route("/api/reveal", methods=["GET"])
def reveal():
    if not _state["world"]:
        return jsonify({"error": "No game in progress."}), 400
    return jsonify({"grid": serialize_world(_state["world"])})


# -----------------------------------------------------------------------
# Health check
# -----------------------------------------------------------------------
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "0") == "1"
    app.run(host="0.0.0.0", port=port, debug=debug)
