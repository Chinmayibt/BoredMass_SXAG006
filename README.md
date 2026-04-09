# ScholAR MVP

Hackathon MVP of an autonomous research intelligence agent.

## Backend

1. Create virtual environment and install:
   - `pip install -r backend/requirements.txt`
2. Copy env file:
   - `copy backend\\.env.example backend\\.env`
3. Run API:
   - `uvicorn app.main:app --reload --app-dir backend`

### Backend startup: embedding warmup and memory

On startup the main API may load the sentence-transformers embedding model (`BAAI/bge-small-en-v1.5`). If Windows reports **“The paging file is too small for this operation to complete”** or similar out-of-memory errors, either increase the system page file / free RAM, or skip warmup so the process can start (the model will still load on first use that needs it):

- In `backend/.env`: set `SKIP_EMBEDDING_WARMUP=1` (see `backend/.env.example`).

API endpoints:
- `GET /health`
- `POST /research/run`
- `GET /research/report/{job_id}.pdf`

## Frontend (Mantis UI)

1. Install and run:
   - `cd frontend`
   - `npm install`
   - `npm run dev`

The app opens at `/` (landing). The research workspace is at **`/workspace`**.

Optional env (see `frontend/.env.example`):

- `VITE_API_BASE=http://localhost:8000` (main research API, `backend/`)
- `VITE_RESEARCH_AGENT_BASE=http://localhost:8001` (Debate / Roadmap / Podcast; `research_agent/` — do not point this at the same URL as `VITE_API_BASE` unless both APIs are merged into one server)

## Research agent (second API)

The **Agents** pages in the frontend talk to a separate FastAPI app under `research_agent/`. Run it on **port 8001** while the main backend stays on **8000**:

```powershell
cd research_agent
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8001
```

See [research_agent/README.md](research_agent/README.md) for env vars (`GROQ_API_KEY`, Ollama, CORS) and troubleshooting.

## Suggested Demo Topics

- `retrieval augmented generation`
- `graph neural networks in healthcare`
- `multimodal llm safety`
