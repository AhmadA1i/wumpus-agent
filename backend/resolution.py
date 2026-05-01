"""
Resolution Refutation Engine
Implements propositional logic resolution for the Wumpus World KB.
"""

from itertools import combinations


def negate(literal: str) -> str:
    """Negate a literal. '~P_1_2' -> 'P_1_2', 'P_1_2' -> '~P_1_2'."""
    return literal[1:] if literal.startswith("~") else "~" + literal


def resolve(c1: frozenset, c2: frozenset) -> list[frozenset]:
    """
    Resolve two CNF clauses.
    For each complementary literal pair found, produce a resolvent clause.
    Returns list of resolvent clauses (each a frozenset of literals).
    """
    resolvents = []
    for lit in c1:
        neg = negate(lit)
        if neg in c2:
            # Remove complementary literals, merge remaining
            merged = (c1 - {lit}) | (c2 - {neg})
            resolvents.append(frozenset(merged))
    return resolvents


def resolution_refutation(clauses: set, query_literal: str) -> tuple[bool, int]:
    """
    Prove query_literal by refutation:
      1. Negate the query and add as a unit clause
      2. Repeatedly resolve pairs of clauses
      3. If the empty clause is derived → contradiction → query is TRUE
      4. If no new clauses can be added → query cannot be proven → FALSE

    Args:
        clauses:       Set of frozensets (CNF KB)
        query_literal: Literal to prove, e.g. '~P_2_1'

    Returns:
        (is_proven, total_resolution_steps)
    """
    negated_query = frozenset([negate(query_literal)])
    clause_set = set(clauses) | {negated_query}
    steps = 0

    while True:
        clause_list = list(clause_set)
        new_clauses: set[frozenset] = set()

        for c1, c2 in combinations(clause_list, 2):
            resolvents = resolve(c1, c2)
            steps += 1
            for r in resolvents:
                if len(r) == 0:
                    # Empty clause found — contradiction proven
                    return True, steps
                new_clauses.add(r)

        if new_clauses.issubset(clause_set):
            # Saturated — no new info, query not provable
            return False, steps

        clause_set |= new_clauses


def percept_to_cnf(percept: dict, row: int, col: int, adjacent: list) -> list[frozenset]:
    """
    Convert percepts at (row, col) into CNF clauses using biconditional expansion.

    Breeze_r_c  <=>  P_adj1 ∨ P_adj2 ∨ ...
    Splits into:
      (~B_r_c ∨ P_adj1 ∨ P_adj2 ∨ ...)   [left-to-right]
      (~P_adjN ∨ B_r_c)  for each adjN    [right-to-left, one per adjacent]

    No breeze => unit clauses ~P_adjN for each neighbor (directly safe)

    Same logic applies for Stench / Wumpus.
    """
    clauses = []
    b_lit = f"B_{row}_{col}"
    s_lit = f"S_{row}_{col}"
    adj_pits   = [f"P_{r}_{c}" for r, c in adjacent]
    adj_wumpus = [f"W_{r}_{c}" for r, c in adjacent]

    # --- Breeze / Pit logic ---
    if percept.get("breeze"):
        clauses.append(frozenset([b_lit]))
        # ~B ∨ P_adj1 ∨ P_adj2 ∨ ...
        clauses.append(frozenset([f"~{b_lit}"] + adj_pits))
        # For each adjacent: ~P_adjN ∨ B
        for p in adj_pits:
            clauses.append(frozenset([f"~{p}", b_lit]))
    else:
        clauses.append(frozenset([f"~{b_lit}"]))
        # No breeze → every adjacent cell is pit-free
        for p in adj_pits:
            clauses.append(frozenset([f"~{p}"]))

    # --- Stench / Wumpus logic ---
    if percept.get("stench"):
        clauses.append(frozenset([s_lit]))
        clauses.append(frozenset([f"~{s_lit}"] + adj_wumpus))
        for w in adj_wumpus:
            clauses.append(frozenset([f"~{w}", s_lit]))
    else:
        clauses.append(frozenset([f"~{s_lit}"]))
        for w in adj_wumpus:
            clauses.append(frozenset([f"~{w}"]))

    return clauses
