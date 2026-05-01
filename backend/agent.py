"""
Wumpus World Knowledge-Based Agent.
Maintains position, visited cells, KB, and inference log.
"""

from kb import KnowledgeBase
from world import get_adjacent, get_percepts


# Cell status constants
STATUS_UNKNOWN  = "unknown"
STATUS_SAFE     = "safe"
STATUS_VISITED  = "visited"
STATUS_DANGER   = "danger"


class Agent:
    def __init__(self, grid: list):
        self.grid  = grid
        self.rows  = len(grid)
        self.cols  = len(grid[0])
        self.kb    = KnowledgeBase()
        self.pos   = (0, 0)
        self.alive = True
        self.won   = False

        self.visited: set[tuple] = set()
        self.cell_status: dict[tuple, str] = {
            (r, c): STATUS_UNKNOWN
            for r in range(self.rows)
            for c in range(self.cols)
        }
        self.inference_log: list[dict] = []
        self.last_percepts: dict = {}

        # Visit the starting cell immediately
        self._process_cell(0, 0)

    # ------------------------------------------------------------------
    # Internal: process a cell visit
    # ------------------------------------------------------------------
    def _process_cell(self, row: int, col: int) -> dict:
        """Visit (row, col): collect percepts, update KB, infer neighbors."""
        self.visited.add((row, col))
        self.cell_status[(row, col)] = STATUS_VISITED

        percept = get_percepts(self.grid, row, col)
        self.last_percepts = percept
        adjacent = get_adjacent(self.grid, row, col)

        # TELL KB — add CNF clauses from percepts
        new_clauses = self.kb.tell_from_percept(percept, row, col, adjacent)

        # ASK KB — infer status of unvisited neighbors
        for (ar, ac) in adjacent:
            if (ar, ac) not in self.visited:
                is_safe, steps = self.kb.ask_safe(ar, ac)
                new_status = STATUS_SAFE if is_safe else STATUS_UNKNOWN

                # Never downgrade a confirmed safe cell
                current = self.cell_status[(ar, ac)]
                if current not in (STATUS_SAFE, STATUS_VISITED, STATUS_DANGER):
                    self.cell_status[(ar, ac)] = new_status

                entry = {
                    "cell": [ar, ac],
                    "result": new_status,
                    "steps": steps,
                    "kb_size": self.kb.size(),
                }
                self.inference_log.append(entry)

        return percept

    # ------------------------------------------------------------------
    # Public: move the agent
    # ------------------------------------------------------------------
    def move(self, row: int, col: int) -> dict:
        """
        Move agent to (row, col).
        Returns a full state dict including move outcome.
        """
        if not self.alive:
            return {"error": "Agent is dead. Start a new game.", **self._state()}

        if not (0 <= row < self.rows and 0 <= col < self.cols):
            return {"error": f"Cell ({row},{col}) is out of bounds.", **self._state()}

        # Move
        self.pos = (row, col)
        cell = self.grid[row][col]

        # Check for death
        if cell["pit"]:
            self.alive = False
            self.cell_status[(row, col)] = STATUS_DANGER
            return {
                "status": "dead",
                "cause": "pit",
                "message": f"Agent fell into a pit at ({row},{col})!",
                **self._state(),
            }
        if cell["wumpus"]:
            self.alive = False
            self.cell_status[(row, col)] = STATUS_DANGER
            return {
                "status": "dead",
                "cause": "wumpus",
                "message": f"Agent was eaten by the Wumpus at ({row},{col})!",
                **self._state(),
            }

        # Safe — process the cell
        percept = self._process_cell(row, col)

        # Check for gold
        if cell["gold"]:
            self.won = True
            return {
                "status": "won",
                "message": f"Agent found the Gold at ({row},{col})! 🏆",
                "percepts": percept,
                **self._state(),
            }

        return {
            "status": "ok",
            "message": f"Moved to ({row},{col}).",
            "percepts": percept,
            **self._state(),
        }

    # ------------------------------------------------------------------
    # State serialization
    # ------------------------------------------------------------------
    def _state(self) -> dict:
        return {
            "pos":                    list(self.pos),
            "rows":                   self.rows,
            "cols":                   self.cols,
            "alive":                  self.alive,
            "won":                    self.won,
            "visited":                [list(p) for p in self.visited],
            "cell_statuses":          {f"{r},{c}": v for (r, c), v in self.cell_status.items()},
            "kb_size":                self.kb.size(),
            "total_inference_steps":  self.kb.total_steps,
            "inference_log":          self.inference_log[-8:],
            "kb_clauses_sample":      self.kb.get_clauses_display(),
            "last_percepts":          self.last_percepts,
        }

    def get_state(self) -> dict:
        return self._state()
