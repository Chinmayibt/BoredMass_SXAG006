# Research agent API (FastAPI)

Debate, roadmap, and podcast pipelines. Runs as a **separate** process from the main ScholAR `backend` so each service can use its own port and dependencies.

## Why a virtual environment

Use a **dedicated venv** inside this repo (not the global Python `site-packages`) so optional heavy packages (e.g. TensorFlow pulled in by other tools) do not affect this app and startup logs stay predictable.

```powershell
cd path\to\BoredMass_SXAG006\research_agent
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Run the server (port 8001)

The main ScholAR API uses **8000** by default. This app must use another port, typically **8001**, so both can run at once and the frontend can find each service.

```powershell
cd path\to\BoredMass_SXAG006\research_agent
python -m uvicorn app.main:app --reload --port 8001
```

Open `http://127.0.0.1:8001/docs` for interactive API docs.

## Frontend configuration

The Vite app calls this service using `VITE_RESEARCH_AGENT_BASE`. If unset, it defaults to `http://localhost:8001`.

- Default: no env file needed if you use port **8001** as above.
- Custom port: set `VITE_RESEARCH_AGENT_BASE=http://localhost:<port>` in `frontend/.env` or your shell.
- Dev proxy: you can use `VITE_RESEARCH_AGENT_BASE=/research-agent` with the proxy in `frontend/vite.config.ts` (target `127.0.0.1:8001`).

## Environment variables

- **`GROQ_API_KEY`**: required for debate and roadmap (`app/services/llm_service.py`). Use a `.env` file in `research_agent/` (see `python-dotenv` loading in that module).
- **Podcast pipeline**: local **Ollama** at `http://localhost:11434` (see `app/podcast_agent/services/llm_service.py`), plus **ffmpeg** and **edge-tts** at runtime.
- **`RESEARCH_AGENT_CORS_ORIGINS`**: optional comma-separated list of browser origins; defaults include `http://localhost:5173` for Vite.

## Optional: quieter TensorFlow logs

If TensorFlow appears in the console even though this project does not import it directly, it is usually coming from another package in your environment. You can set `TF_ENABLE_ONEDNN_OPTS=0` to reduce oneDNN messages, or rely on a clean venv as above.
