"""
Knowledge Base (KB) for the Wumpus World Agent.
Stores CNF clauses and exposes TELL / ASK interface.
"""

from resolution import resolution_refutation, percept_to_cnf


class KnowledgeBase:
    def __init__(self):
        self.clauses: set[frozenset] = set()
        self.total_steps: int = 0
        self.history: list[dict] = []   # Log of every TELL / ASK operation

    # ------------------------------------------------------------------
    # TELL — add new knowledge
    # ------------------------------------------------------------------
    def tell(self, new_clauses: list[frozenset]) -> None:
        """Add a list of CNF clauses to the KB."""
        before = len(self.clauses)
        for clause in new_clauses:
            self.clauses.add(frozenset(clause))
        added = len(self.clauses) - before
        self.history.append({
            "op": "TELL",
            "clauses_added": added,
            "kb_size": len(self.clauses),
        })

    def tell_from_percept(self, percept: dict, row: int, col: int, adjacent: list) -> list[frozenset]:
        """Convert a percept to CNF and TELL the KB. Returns new clauses."""
        new_clauses = percept_to_cnf(percept, row, col, adjacent)
        self.tell(new_clauses)
        return new_clauses

    # ------------------------------------------------------------------
    # ASK — query the KB via resolution refutation
    # ------------------------------------------------------------------
    def ask_safe(self, row: int, col: int) -> tuple[bool, int]:
        """
        Ask: is cell (row, col) provably free of BOTH pits AND wumpus?
        Runs resolution refutation twice:
          1. Prove ~P_row_col  (no pit)
          2. Prove ~W_row_col  (no wumpus)

        Returns (is_safe, total_steps_used)
        """
        no_pit,    s1 = resolution_refutation(self.clauses, f"~P_{row}_{col}")
        no_wumpus, s2 = resolution_refutation(self.clauses, f"~W_{row}_{col}")
        steps = s1 + s2
        self.total_steps += steps
        is_safe = no_pit and no_wumpus
        self.history.append({
            "op": "ASK",
            "cell": [row, col],
            "no_pit": no_pit,
            "no_wumpus": no_wumpus,
            "safe": is_safe,
            "steps": steps,
            "kb_size": len(self.clauses),
        })
        return is_safe, steps

    def ask_danger(self, row: int, col: int) -> tuple[bool, int]:
        """
        Ask: is cell (row, col) provably dangerous?
        Proves P_row_col OR W_row_col.
        """
        has_pit,    s1 = resolution_refutation(self.clauses, f"P_{row}_{col}")
        has_wumpus, s2 = resolution_refutation(self.clauses, f"W_{row}_{col}")
        steps = s1 + s2
        self.total_steps += steps
        return (has_pit or has_wumpus), steps

    # ------------------------------------------------------------------
    # Utility
    # ------------------------------------------------------------------
    def size(self) -> int:
        return len(self.clauses)

    def get_clauses_display(self) -> list[str]:
        """Return last 20 clauses as readable strings for the UI."""
        result = []
        for clause in list(self.clauses)[-20:]:
            result.append(" ∨ ".join(sorted(clause)))
        return result
