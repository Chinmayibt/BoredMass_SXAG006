from __future__ import annotations

from collections import Counter

from app.models.pipeline import InsightOutput
from app.pipeline.llm import ask_json
from app.pipeline.state import PipelineStateDict


def insight_node(state: PipelineStateDict) -> PipelineStateDict:
    papers = state.get("papers", [])
    if not papers:
        return {"insights": InsightOutput()}

    top = sorted(papers, key=lambda p: (p.relevance_score, p.citation_count), reverse=True)[:8]
    tokens = Counter()
    for p in papers:
        for w in (p.title + " " + p.abstract).lower().split():
            if len(w) > 5:
                tokens[w.strip(".,:;()[]{}")] += 1

    fallback = {
        "trends": ["Recent work emphasizes larger-scale evaluation and reproducibility."],
        "gaps": ["Limited cross-dataset reporting with consistent metrics."],
        "contradictions": ["Some papers report conflicting gains under similar settings."],
        "research_fronts": ["foundation models", "domain adaptation", "multimodal reasoning"],
        "open_problems": ["benchmark standardization", "deployment reliability"],
    }
    prompt = (
        "Return JSON keys trends,gaps,contradictions,research_fronts,open_problems for this topic "
        f"{state['topic']} and keywords {', '.join([k for k, _ in tokens.most_common(12)])}"
    )
    generated = ask_json(prompt, fallback=fallback)
    insights = InsightOutput(
        trends=generated.get("trends", fallback["trends"]),
        gaps=generated.get("gaps", fallback["gaps"]),
        contradictions=generated.get("contradictions", fallback["contradictions"]),
        research_fronts=generated.get("research_fronts", fallback["research_fronts"]),
        open_problems=generated.get("open_problems", fallback["open_problems"]),
        key_papers=[
            {
                "paper_id": p.id,
                "title": p.title,
                "url": p.url,
                "why_important": f"Relevance {p.relevance_score:.2f}, citations {p.citation_count}",
            }
            for p in top
        ],
    )
    return {"insights": insights}
