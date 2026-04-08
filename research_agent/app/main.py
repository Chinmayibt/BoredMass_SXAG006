import os
import uuid
from pathlib import Path
from typing import List

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from app.services.pdf_service import extract_text_from_pdf
from app.services.paper_service import extract_paper
from app.agents.debate_agents import run_debate

from app.agents.roadmap_agent import generate_roadmap
from app.podcast_agent.pipeline.orchestrator import run_podcast_pipeline

RESEARCH_AGENT_ROOT = Path(__file__).resolve().parent.parent
GENERATED_AUDIO_DIR = RESEARCH_AGENT_ROOT / "generated_audio"


def _cors_origins() -> list[str]:
    raw = os.getenv("RESEARCH_AGENT_CORS_ORIGINS", "").strip()
    if raw:
        return [o.strip() for o in raw.split(",") if o.strip()]
    return [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Research Agent API is running 🚀"}


@app.post("/debate-pdf")
async def debate_pdf(
    file_A: UploadFile = File(...),
    file_B: UploadFile = File(...),
):
    text_A = extract_text_from_pdf(await file_A.read())
    text_B = extract_text_from_pdf(await file_B.read())
    result = run_debate(text_A, text_B)
    return result


@app.post("/roadmap-pdf")
async def roadmap_pdf(
    topic: str = Form(...),
    files: List[UploadFile] = File(...),
):
    papers = []

    for file in files:
        contents = await file.read()
        text = extract_text_from_pdf(contents)
        paper = extract_paper(text)
        papers.append(paper)

    result = generate_roadmap(
        topic=topic,
        paper_paths=papers,
        user_level="beginner",
    )

    return result


@app.post("/generate-podcast")
async def generate_podcast(file: UploadFile = File(...)):
    job_id = str(uuid.uuid4())
    work_dir = GENERATED_AUDIO_DIR / job_id
    work_dir.mkdir(parents=True, exist_ok=True)

    pdf_path = work_dir / "input.pdf"
    contents = await file.read()
    pdf_path.write_bytes(contents)

    result = await run_podcast_pipeline(str(pdf_path.resolve()), work_dir=str(work_dir.resolve()))

    if result.get("status") == "success":
        result = {
            **result,
            "audio_url": f"/podcast-audio/{job_id}",
        }

    return result


@app.get("/podcast-audio/{job_id}")
def podcast_audio(job_id: str):
    if "/" in job_id or "\\" in job_id or ".." in job_id:
        raise HTTPException(status_code=400, detail="Invalid job id")

    base = GENERATED_AUDIO_DIR.resolve()
    job_dir = (GENERATED_AUDIO_DIR / job_id).resolve()
    try:
        job_dir.relative_to(base)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid job id")
    if job_dir == base:
        raise HTTPException(status_code=400, detail="Invalid job id")

    audio_file = job_dir / "podcast.mp3"
    if not audio_file.is_file():
        raise HTTPException(status_code=404, detail="Audio not found")

    return FileResponse(
        path=str(audio_file),
        media_type="audio/mpeg",
        filename="podcast.mp3",
    )
