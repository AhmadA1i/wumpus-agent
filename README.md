# 🦂 Wumpus World — Dynamic Logic Agent

A web-based Knowledge-Based Agent that navigates a Wumpus World grid using **Propositional Logic** and **Resolution Refutation** to infer safe cells. For Complete Understanding of Project Logic and Flow, Read Report.md

---

## 🔗 Links

| Resource       | URL |
|----------------|-----|
| Live Demo      | _paste your Vercel URL here_ |
| LinkedIn Post  | _paste your LinkedIn URL here_ |

---

## 📐 Architecture

```
wumpus-agent/
├── backend/                  # Python (Flask)
│   ├── app.py                # REST API (4 endpoints)
│   ├── agent.py              # KB-based agent logic
│   ├── kb.py                 # Knowledge Base (TELL / ASK)
│   ├── resolution.py         # CNF conversion + Resolution Refutation
│   ├── world.py              # Grid, hazard placement, percepts
│   └── requirements.txt
└── frontend/                 # React
    ├── src/
    │   ├── App.jsx           # Main app
    │   ├── api.js            # Fetch helpers
    │   └── components/
    │       ├── Grid.jsx      # Visual grid
    │       ├── Dashboard.jsx # Metrics + inference log
    │       ├── Controls.jsx  # Game controls
    │       └── Legend.jsx    # Color legend
    └── public/index.html
```


## 🚀 Running Locally

### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
# Runs on http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```

> The `"proxy": "http://localhost:5000"` in `package.json` forwards `/api/*` calls to Flask automatically.
