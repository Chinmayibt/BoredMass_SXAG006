import asyncio
import hashlib
import json
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from app.agents.insight import generate_insights
from app.agents.planner import generate_queries, should_stop
from app.agents.relevance import score_papers
from app.agents.search import fetch_arxiv, fetch_crossref, fetch_openalex
from app.core.config import get_settings
from app.models.schemas import LoopLog, Paper, RunResearchRequest, RunResearchResponse
from app.services.cache import TTLCache
from app.services.embeddings import encode_texts
from app.services.graph_builder import build_graph
from app.services.report import build_markdown_report, export_pdf

router = APIRouter(prefix="/research", tags=["research"])
_cache = TTLCache(ttl_seconds=get_settings().cache_ttl_seconds)
REPORT_DIR = Path("reports")


def _cache_key(payload: RunResearchRequest) -> str:
    raw = json.dumps(payload.model_dump(), sort_keys=True)
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def _norm_title(value: str) -> str:
    return " ".join(value.lower().split())


def _merge_and_dedup_papers(items: list[Paper]) -> list[Paper]:
    merged: dict[str, Paper] = {}
    for p in items:
        doi_key = ""
        if "doi.org/" in p.url.lower():
            doi_key = p.url.lower().split("doi.org/")[-1]
        arxiv_key = p.id if p.id.startswith("arxiv:") else ""
        title_key = f"{_norm_title(p.title)}::{p.year or 0}"
        key = doi_key or arxiv_key or title_key or p.id

        existing = merged.get(key)
        if not existing:
            merged[key] = p
            continue

        existing.citation_count = max(existing.citation_count, p.citation_count)
        if not existing.abstract and p.abstract:
            existing.abstract = p.abstract
        if not existing.url and p.url:
            existing.url = p.url
        if existing.source != "openalex" and p.source == "openalex":
            existing.source = "openalex"
        existing.authors = list(dict.fromkeys(existing.authors + p.authors))
        existing.topics = list(dict.fromkeys(existing.topics + p.topics))
    return list(merged.values())


@router.post("/run", response_model=RunResearchResponse)
async def run_research(request: RunResearchRequest) -> RunResearchResponse:
    key = _cache_key(request)
    cached = _cache.get(key)
    if cached:
        return cached

    settings = get_settings()
    all_papers: dict[str, Paper] = {}
    logs: list[LoopLog] = []

    for iteration in range(1, request.max_iterations + 1):
        queries = generate_queries(request.topic, iteration)
        iteration_before = len(all_papers)
        fetched_count = 0

        for query in queries:
            openalex_task = fetch_openalex(
                query,
                limit=12,
                mailto=settings.openalex_email,
                timeout_seconds=settings.source_timeout_seconds,
            )
            crossref_task = fetch_crossref(
                query,
                limit=10,
                mailto=settings.crossref_mailto,
                timeout_seconds=settings.source_timeout_seconds,
            )
            arxiv_task = fetch_arxiv(query, limit=8, timeout_seconds=settings.source_timeout_seconds)
            source_results = await asyncio.gather(openalex_task, crossref_task, arxiv_task, return_exceptions=True)
            fetched: list[Paper] = []
            for result in source_results:
                if isinstance(result, Exception):
                    continue
                fetched.extend(result)
            fetched = _merge_and_dedup_papers(fetched)
            fetched_count += len(fetched)
            ranked = score_papers(request.topic, fetched)
            for paper in ranked:
                if paper.relevance_score >= 0.2:
                    all_papers[paper.id] = paper

        accepted = len(all_papers) - iteration_before
        novelty_ratio = accepted / max(fetched_count, 1)
        log = LoopLog(
            iteration=iteration,
            query=" | ".join(queries),
            fetched=fetched_count,
            accepted=accepted,
            novelty_ratio=round(novelty_ratio, 3),
        )
        logs.append(log)
        stop, reason = should_stop(logs, len(all_papers), request.max_papers)
        if stop:
            logs[-1].stop_reason = reason
            break

    papers = score_papers(request.topic, list(all_papers.values()))[: request.max_papers]
    if not papers:
        raise HTTPException(status_code=404, detail="No papers found for this topic.")

    embeddings = encode_texts([(p.title + " " + p.abstract).strip() for p in papers])
    nodes, edges, clusters = build_graph(papers, embeddings)
    insights = generate_insights(request.topic, papers, clusters)
    markdown = build_markdown_report(request.topic, papers, insights, clusters)

    job_id = str(uuid4())
    pdf_path = REPORT_DIR / f"{job_id}.pdf"
    export_pdf(markdown, pdf_path)

    response = RunResearchResponse(
        topic=request.topic,
        papers=papers,
        loop_logs=logs,
        graph_nodes=nodes,
        graph_edges=edges,
        clusters=clusters,
        insights=insights,
        report_markdown=markdown,
        job_id=job_id,
    )
    _cache.set(key, response)
    return response


@router.get("/report/{job_id}.pdf")
async def get_report(job_id: str):
    path = REPORT_DIR / f"{job_id}.pdf"
    if not path.exists():
        raise HTTPException(status_code=404, detail="Report not found")
    return FileResponse(path, media_type="application/pdf", filename=f"{job_id}.pdf")
