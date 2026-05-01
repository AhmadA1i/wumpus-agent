# 🦂 Wumpus World Logic Agent — Core Logic Report

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [How the Logic Engine Works](#how-the-logic-engine-works)
3. [API Endpoints](#api-endpoints)
4. [Technical Deep Dive](#technical-deep-dive)
5. [Complexity Analysis](#complexity-analysis)

---

## 📖 Project Overview

This Wumpus World agent is a **knowledge-based system** that uses **propositional logic** and **resolution refutation** to navigate a dangerous world while inferring cell safety. The agent:

- Converts percepts (breeze, stench, glitter) into **Conjunctive Normal Form (CNF)** clauses
- Builds a knowledge base (KB) that grows as the agent explores
- Uses **resolution refutation** to prove whether cells are safe or dangerous
- Maintains three cell states: **visited**, **safe** (proven), **unknown**, and **danger** (dead)

---

## 🧠 How the Logic Engine Works

### 1. Percept → CNF Clauses

When the agent visits cell `(r, c)` and receives percepts, we convert observations into logical clauses.

#### Example: No Breeze at (2,1)

When there's **no breeze** at cell (2,1), we know no adjacent cell has a pit:

```
~B_2_1              (unit clause: no breeze here)
~P_1_1              (pit-free for each adjacent cell)
~P_3_1
~P_2_2
```

#### Example: Breeze at (2,1)

When there **is breeze** at cell (2,1), at least one adjacent cell has a pit. This is a **biconditional**:

- **Left-to-right** (implication): If no breeze, then no adjacent pit
  ```
  ~B_2_1 ∨ P_1_1 ∨ P_3_1 ∨ P_2_2
  ```

- **Right-to-left** (converse): If any adjacent cell has pit, then breeze
  ```
  ~P_1_1 ∨ B_2_1
  ~P_3_1 ∨ B_2_1
  ~P_2_2 ∨ B_2_1
  ```

**CNF Representation:**
```
B_2_1                                     (unit clause)
~B_2_1 ∨ P_1_1 ∨ P_3_1 ∨ P_2_2          (left-to-right)
~P_1_1 ∨ B_2_1                           (right-to-left, adjacent cell 1)
~P_3_1 ∨ B_2_1                           (right-to-left, adjacent cell 2)
~P_2_2 ∨ B_2_1                           (right-to-left, adjacent cell 3)
```

### 2. Resolution Refutation

To determine if a cell is safe (has no pit), we use **resolution refutation** to prove `~P_r_c`:

#### Algorithm Steps

1. **Negate the query**: Add `{P_r_c}` as a unit clause to the KB (assume pit exists)
2. **Resolve pairs**:
   - Pick two clauses with complementary literals
   - Example: `{~P_2_2, Q}` and `{P_2_2, ~R}` resolve to `{Q, ~R}`
   - Remove the complementary pair; merge remaining literals
3. **Check for empty clause**:
   - If `{}` (empty clause) is derived → **contradiction** → `~P_r_c` is **proven TRUE** ✓
   - If no new clauses can be derived (saturation) → **query not provable** → cell is **unknown** ✗

#### Example Resolution Trace

**KB:**
```
1. ~B_2_1 ∨ P_1_1 ∨ P_3_1 ∨ P_2_2
2. ~P_1_1
3. ~P_3_1
4. P_2_2  (negated query: assume pit at (2,2))
```

**Resolution steps:**
```
5. Resolve (1, 4) on P_2_2:  ~B_2_1 ∨ P_1_1 ∨ P_3_1
6. Resolve (5, 2) on P_1_1:  ~B_2_1 ∨ P_3_1
7. Resolve (6, 3) on P_3_1:  ~B_2_1
8. If KB contains B_2_1:
   Resolve (7, 8) on B_2_1:  {} (EMPTY CLAUSE)
   → Contradiction! ~P_2_2 is PROVEN
```

### 3. Cell Status Classification

| Status    | Condition | Interpretation |
|-----------|-----------|-----------------|
| `visited` | Agent has been to this cell | No inference needed |
| `safe`    | KB **proves** `~P_r_c AND ~W_r_c` | Resolution succeeded for both pit and wumpus |
| `unknown` | Cannot prove safety or danger | Insufficient information; risky to visit |
| `danger`  | Agent died here (pit or wumpus) | Confirmed: `P_r_c OR W_r_c` |

---

## 🌐 API Endpoints

### Overview Table

| Method | Endpoint       | Body / Query Params                | Response |
|--------|----------------|-----------------------------------|----------|
| POST   | `/api/new-game`| `{ rows, cols, pit_prob }`        | Initial game state |
| POST   | `/api/move`    | `{ row, col }`                    | Updated game state + percepts |
| GET    | `/api/state`   | —                                 | Current game state (read-only) |
| GET    | `/api/reveal`  | —                                 | Full hidden world (debug/verify) |

### Endpoint Details

#### `POST /api/new-game`

**Request:**
```json
{
  "rows": 4,
  "cols": 4,
  "pit_prob": 0.2
}
```

**Response:**
```json
{
  "rows": 4,
  "cols": 4,
  "pos": [0, 0],
  "alive": true,
  "won": false,
  "cell_statuses": {
    "0,0": "visited"
  },
  "visited": [[0, 0]],
  "kb_size": 12,
  "total_inference_steps": 0,
  "inference_log": [],
  "kb_clauses_sample": [],
  "last_percepts": {}
}
```

#### `POST /api/move`

**Request:**
```json
{
  "row": 1,
  "col": 0
}
```

**Response:**
```json
{
  "status": "ok",
  "pos": [1, 0],
  "alive": true,
  "won": false,
  "last_percepts": {
    "breeze": true,
    "stench": false,
    "glitter": false
  },
  "kb_size": 28,
  "total_inference_steps": 156,
  "cell_statuses": {
    "0,0": "visited",
    "1,0": "visited",
    "0,1": "safe",
    "1,1": "unknown",
    "2,0": "unknown"
  },
  "inference_log": [
    {
      "cell": [0, 1],
      "result": "safe",
      "steps": 12,
      "kb_size": 28
    }
  ],
  "kb_clauses_sample": [
    "~B_0_0",
    "~P_0_1",
    "~P_1_0",
    "~P_0_-1",
    "B_1_0 ∨ ~P_0_0 ∨ ~P_1_1 ∨ ~P_2_0"
  ]
}
```

#### `GET /api/state`

**Response:** Same as `/api/move` response (snapshot of current state)

#### `GET /api/reveal`

**Response:** Reveals hidden world for debugging
```json
{
  "grid": [
    [
      { "pit": false, "wumpus": false, "gold": false },
      { "pit": true, "wumpus": false, "gold": false },
      ...
    ]
  ]
}
```

---

## 🔬 Technical Deep Dive

### CNF Conversion Algorithm

1. **Eliminate Biconditionals**:
   - `A ↔ B` becomes `(A → B) ∧ (B → A)`

2. **Convert Implications to Disjunctions**:
   - `A → B` becomes `¬A ∨ B`

3. **Apply De Morgan's Laws**:
   - `¬(A ∧ B)` becomes `¬A ∨ ¬B`
   - `¬(A ∨ B)` becomes `¬A ∧ ¬B`

4. **Distribute OR over AND**:
   - `A ∨ (B ∧ C)` becomes `(A ∨ B) ∧ (A ∨ C)`

### Resolution Refutation Algorithm

```python
def resolution_refutation(kb, query):
    """
    Prove ~query using resolution.
    
    Args:
        kb: Knowledge base (set of clauses in CNF)
        query: A literal to prove (e.g., "~P_1_1")
    
    Returns:
        True if query is provable (empty clause derived)
        False if query cannot be proven (saturation reached)
    """
    
    # Negate the query and add to KB
    clauses = kb.union({query.negate()})
    new = set()
    
    while True:
        # Try all pairs of clauses
        for c1 in clauses:
            for c2 in clauses:
                if c1 == c2:
                    continue
                
                # Find complementary literals
                complement = find_complement(c1, c2)
                if complement:
                    # Resolve by removing complementary pair
                    resolvent = (c1 - {complement}) | (c2 - {~complement})
                    
                    # Empty clause = contradiction = proven
                    if resolvent == {}:
                        return True
                    
                    new.add(resolvent)
        
        # No new clauses = saturation = cannot prove
        if new.issubset(clauses):
            return False
        
        clauses = clauses | new
```

### Clause Representation

In the implementation:

```python
class Clause:
    def __init__(self, literals):
        """
        literals: set of Literal objects
        Example: Clause({Literal("P", 1, 0, False), Literal("B", 2, 1, True)})
        represents: P_1_0 ∨ ~B_2_1
        """
        self.literals = set(literals)
    
    def resolve(self, other):
        """Resolve two clauses on complementary literal."""
        for lit in self.literals:
            if -lit in other.literals:  # Complement found
                return Clause((self.literals - {lit}) | (other.literals - {-lit}))
        return None
```

---

## 📊 Complexity Analysis

### Knowledge Base Growth

- **Per move**: $O(d)$ new clauses, where $d$ = number of adjacent cells (typically $d \leq 4$)
- **After $n$ moves**: $O(n \cdot d) = O(n)$ total clauses in worst case (practical: ~50-200 clauses for 4×4 grid)

### Resolution Loop

- **Worst-case**: $O(m^2)$ pairs per iteration, where $m$ = number of clauses
- **Iterations**: Up to $O(m)$ iterations until saturation
- **Overall**: $O(m^3)$ worst-case, but typically $O(m^2)$ in practice

### Per-Cell Inference

| Operation | Complexity |
|-----------|-----------|
| Query proof (pit safety) | $O(m^2)$ |
| Query proof (wumpus safety) | $O(m^2)$ |
| Query proof (glitter detection) | $O(1)$ (immediate facts) |
| Total per move | $O(m^2)$ where $m$ = KB size |

### Practical Performance (4×4 Grid)

- **New game**: ~5ms (initial KB setup)
- **Per move inference**: ~20-50ms (proves 2-4 cells)
- **Total game (16 moves)**: ~300-800ms

---

## 🎯 Key Insights

### 1. Soundness & Completeness

- **Sound**: If resolution proves `~P_r_c`, then `~P_r_c` is **definitely true** in all models satisfying KB
- **Complete**: If `~P_r_c` **must be true**, resolution will eventually prove it

### 2. Open World Assumption

- Unknown cells remain unknown (not assumed safe or dangerous)
- Only proven facts are marked as "safe"
- Risk assessment is conservative: unknown = potentially dangerous

### 3. Optimization Opportunities

- **Memoization**: Cache resolutions for repeated queries
- **Indexing**: Store clauses by predicate for faster matching
- **Subsumption**: Remove clauses subsumed by more general clauses
- **Pure literal elimination**: Remove variables that appear with only one polarity

---

## 📚 References

- **Resolution Refutation**: Robinson, J. A. (1965). "A Machine-Oriented Logic Based on the Resolution Principle"
- **Propositional Logic**: Russell, S. & Norvig, P. (2020). *Artificial Intelligence: A Modern Approach* (4th ed.)
- **Wumpus World**: Classic AI problem from early AI research

---

## 📄 Document Info

- **Created**: May 1, 2026
- **Made By**: AHMAD ALI - AI Enginner
- **Project**: Wumpus World Logic Agent
- **Type**: Technical Report (CNF Conversion & Resolution Refutation)
- **Format**: Markdown
