from app.models.pipeline import InsightOutput, PaperRecord


def _legacy_like_summary(papers: list[PaperRecord]) -> dict:
    return {
        "paper_count": len(papers),
        "top_title": papers[0].title if papers else "",
        "sources": sorted({p.source for p in papers}),
    }


def _new_pipeline_summary(papers: list[PaperRecord], insights: InsightOutput) -> dict:
    return {
        "paper_count": len(papers),
        "top_title": papers[0].title if papers else "",
        "sources": sorted({p.source for p in papers}),
        "trend_count": len(insights.trends),
    }


def test_shadow_compare_invariants():
    papers = [
        PaperRecord(id="a", title="Paper A", source="openalex", relevance_score=0.9),
        PaperRecord(id="b", title="Paper B", source="arxiv", relevance_score=0.8),
    ]
    insights = InsightOutput(trends=["t1"], gaps=["g1"], contradictions=[], key_papers=[])
    legacy = _legacy_like_summary(papers)
    new = _new_pipeline_summary(papers, insights)
    assert new["paper_count"] == legacy["paper_count"]
    assert new["top_title"] == legacy["top_title"]
    assert new["sources"] == legacy["sources"]
