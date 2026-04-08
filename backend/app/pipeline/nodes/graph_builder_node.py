from __future__ import annotations

from app.core.config import get_settings
from app.pipeline.state import PipelineStateDict
from app.repositories.adapters.neo4j_store import Neo4jGraphStore
from app.services.embeddings import encode_texts


def graph_builder_node(state: PipelineStateDict) -> PipelineStateDict:
    papers = state.get("papers", [])
    if not papers:
        return {"graph_summary": {"nodes": 0, "edges": 0}}

    embeddings = encode_texts([(p.title + " " + p.abstract).strip() for p in papers])
    sim = embeddings @ embeddings.T
    edges: list[dict] = []
    for i in range(len(papers)):
        for j in range(i + 1, len(papers)):
            w = float(sim[i, j])
            if w > 0.7:
                edges.append({"source": papers[i].id, "target": papers[j].id, "weight": w, "kind": "similarity"})

    for p in papers:
        if p.citation_count > 0:
            # proxy citation edge for MVP; replace with real refs when metadata provides explicit targets
            edges.append({"source": p.id, "target": papers[0].id, "weight": 1.0, "kind": "citation"})

    settings = get_settings()
    store = Neo4jGraphStore(settings.neo4j_uri, settings.neo4j_user, settings.neo4j_password, settings.neo4j_database)
    store.upsert_papers([p.model_dump() for p in papers])
    store.upsert_edges(edges)
    return {"graph_summary": {"nodes": len(papers), "edges": len(edges)}}
