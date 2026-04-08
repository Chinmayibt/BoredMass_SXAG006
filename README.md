# ScholAR MVP

Hackathon MVP of an autonomous research intelligence agent.

## Backend

1. Create virtual environment and install:
   - `pip install -r backend/requirements.txt`
2. Copy env file:
   - `copy backend\\.env.example backend\\.env`
3. Run API:
   - `uvicorn app.main:app --reload --app-dir backend`

API endpoints:
- `GET /health`
- `POST /research/run`
- `GET /research/report/{job_id}.pdf`

## Frontend

1. Install and run:
   - `cd frontend`
   - `npm install`
   - `npm run dev`

Optional env:
- `VITE_API_BASE=http://localhost:8000`

## Suggested Demo Topics

- `retrieval augmented generation`
- `graph neural networks in healthcare`
- `multimodal llm safety`
