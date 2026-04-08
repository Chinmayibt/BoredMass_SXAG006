from datetime import datetime
from app.models.schemas import Paper


def _norm(value: float, max_value: float) -> float:
    if max_value <= 0:
        return 0.0
    return min(value / max_value, 1.0)


def score_papers(topic: str, papers: list[Paper]) -> list[Paper]:
    now = datetime.utcnow().year
    max_citations = max((p.citation_count for p in papers), default=1)
    topic_tokens = {t.lower() for t in topic.split()}

    for paper in papers:
        hay = f"{paper.title} {paper.abstract}".lower()
        overlap = sum(1 for t in topic_tokens if t in hay)
        semantic_similarity = _norm(overlap, max(len(topic_tokens), 1))
        citation_norm = _norm(float(paper.citation_count), float(max_citations))
        recency_norm = 0.5
        if paper.year:
            age = max(now - paper.year, 0)
            recency_norm = max(0.0, 1.0 - min(age, 15) / 15)
        base_score = 0.5 * semantic_similarity + 0.3 * citation_norm + 0.2 * recency_norm
        # Penalize sparse metadata so ranking prefers complete evidence.
        if not paper.title:
            base_score -= 0.25
        if not paper.abstract:
            base_score -= 0.1
        paper.relevance_score = round(max(0.0, base_score), 4)

    return sorted(papers, key=lambda p: p.relevance_score, reverse=True)
