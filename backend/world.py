"""
Wumpus World Environment
Handles grid creation, random hazard placement, and percept generation.
"""

import random


def create_world(rows: int, cols: int, pit_prob: float = 0.2) -> list[list[dict]]:
    """
    Create a grid with randomly placed pits and one Wumpus.
    Cell (0,0) is always safe (agent start position).

    Each cell: { pit: bool, wumpus: bool, gold: bool }
    """
    grid = [
        [{"pit": False, "wumpus": False, "gold": False} for _ in range(cols)]
        for _ in range(rows)
    ]

    # Place pits randomly (skip start cell)
    for r in range(rows):
        for c in range(cols):
            if (r, c) == (0, 0):
                continue
            if random.random() < pit_prob:
                grid[r][c]["pit"] = True

    # Place exactly one Wumpus (non-start, non-pit cell)
    candidates = [
        (r, c)
        for r in range(rows)
        for c in range(cols)
        if (r, c) != (0, 0) and not grid[r][c]["pit"]
    ]
    if candidates:
        wr, wc = random.choice(candidates)
        grid[wr][wc]["wumpus"] = True

    # Place gold in a random non-start, non-hazard cell
    safe_candidates = [
        (r, c)
        for r in range(rows)
        for c in range(cols)
        if (r, c) != (0, 0) and not grid[r][c]["pit"] and not grid[r][c]["wumpus"]
    ]
    if safe_candidates:
        gr, gc = random.choice(safe_candidates)
        grid[gr][gc]["gold"] = True

    return grid


def get_adjacent(grid: list, row: int, col: int) -> list[tuple[int, int]]:
    """Return valid adjacent (up/down/left/right) cells."""
    rows = len(grid)
    cols = len(grid[0])
    neighbors = []
    for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
        nr, nc = row + dr, col + dc
        if 0 <= nr < rows and 0 <= nc < cols:
            neighbors.append((nr, nc))
    return neighbors


def get_percepts(grid: list, row: int, col: int) -> dict:
    """
    Generate percepts for the agent at (row, col):
      - breeze:  any adjacent cell has a pit
      - stench:  any adjacent cell has the wumpus
      - glitter: current cell has gold
    """
    adjacent = get_adjacent(grid, row, col)
    return {
        "breeze":  any(grid[r][c]["pit"]    for r, c in adjacent),
        "stench":  any(grid[r][c]["wumpus"] for r, c in adjacent),
        "glitter": grid[row][col]["gold"],
    }


def serialize_world(grid: list) -> list[list[dict]]:
    """Return the full hidden world (for reveal/debug endpoint)."""
    return [
        [
            {
                "pit":    grid[r][c]["pit"],
                "wumpus": grid[r][c]["wumpus"],
                "gold":   grid[r][c]["gold"],
            }
            for c in range(len(grid[0]))
        ]
        for r in range(len(grid))
    ]
