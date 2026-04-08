from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from app.models.pipeline import PipelineRequest
from app.models.schemas import RunResearchRequest
from app.pipeline.debug_log import dbg
from app.pipeline.executor import executor

router = APIRouter(prefix="/research", tags=["research"])
REPORT_DIR = Path("reports")


@router.post("/run")
async def run_research(request: RunResearchRequest):
    # region agent log
    dbg(
        run_id="pre-fix",
        hypothesis_id="H1",
        location="research.py:16",
        message="entered /research/run",
        data={"topic_len": len(request.topic), "max_papers": request.max_papers, "max_iterations": request.max_iterations},
    )
    # endregion
    job = executor.create_job(
        PipelineRequest(topic=request.topic, max_papers=request.max_papers, max_iterations=request.max_iterations)
    )
    return {
        "job_id": job.job_id,
        "status": "queued",
        "message": "Job accepted. Poll /v2/research/jobs/{job_id} and /v2/research/jobs/{job_id}/results.",
    }


@router.get("/report/{job_id}.pdf")
async def get_report(job_id: str):
    path = REPORT_DIR / f"{job_id}.pdf"
    if not path.exists():
        raise HTTPException(status_code=404, detail="Report not found")
    return FileResponse(path, media_type="application/pdf", filename=f"{job_id}.pdf")
