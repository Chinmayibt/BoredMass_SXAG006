from typing import Literal
from pydantic import BaseModel, Field


class RunResearchRequest(BaseModel):
    topic: str = Field(min_length=3)
    max_papers: int = Field(default=30, ge=10, le=50)
    max_iterations: int = Field(default=3, ge=1, le=5)


class Paper(BaseModel):
    id: str
    title: str
    abstract: str = ""
    year: int | None = None
    citation_count: int = 0
    url: str = ""
    source: Literal["openalex", "crossref", "arxiv"]
    authors: list[str] = []
    topics: list[str] = []
    relevance_score: float = 0.0


class LoopLog(BaseModel):
    iteration: int
    query: str
    fetched: int
    accepted: int
    novelty_ratio: float
    stop_reason: str | None = None


class GraphNode(BaseModel):
    id: str
    label: str
    year: int | None = None
    score: float = 0.0
    cluster: int = 0
    cluster_label: str | None = None


class GraphEdge(BaseModel):
    source: str
    target: str
    weight: float
    edge_type: Literal["citation", "similarity"]


class InsightBundle(BaseModel):
    trends: list[str]
    gaps: list[str]
    key_papers: list[dict]
    contradictions: list[str] = []


class RunResearchResponse(BaseModel):
    topic: str
    papers: list[Paper]
    loop_logs: list[LoopLog]
    graph_nodes: list[GraphNode]
    graph_edges: list[GraphEdge]
    clusters: dict[str, list[str]]
    insights: InsightBundle
    report_markdown: str
    job_id: str
