from __future__ import annotations

import math
from collections import Counter

from sklearn.cluster import KMeans

from app.core.config import get_settings
from app.models.pipeline import GraphEdgeRecord, GraphNodeRecord
from app.pipeline.state import PipelineStateDict
from app.pipeline.telemetry import emit_event
from app.repositories.adapters.neo4j_store import Neo4jGraphStore
from app.services.embeddings import encode_texts


def graph_builder_node(state: PipelineStateDict) -> PipelineStateDict:
    emit_event(state, "graph_builder", "Building knowledge graph.")
    papers = state.get("papers", [])
    if not papers:
        return {"graph_nodes": [], "graph_edges": [], "graph_summary": {"nodes": 0, "edges": 0}}

    embeddings = encode_texts([(p.title + " " + p.abstract).strip() for p in papers])
    sim = embeddings @ embeddings.T
    sim_threshold = 0.52
    n_papers = len(papers)
    min_top_k = 1 if n_papers > 10 else (2 if n_papers > 2 else 1)
    edge_map: dict[tuple[str, str, str], GraphEdgeRecord] = {}

    for i in range(len(papers)):
        candidates: list[tuple[int, float]] = []
        for j in range(len(papers)):
            if i == j:
                continue
            w = float(sim[i, j])
            candidates.append((j, w))
            if w >= sim_threshold:
                source, target = sorted([papers[i].id, papers[j].id])
                edge_map[(source, target, "similarity")] = GraphEdgeRecord(
                    source=source, target=target, weight=round(w, 4), edge_type="similarity"
                )

        candidates.sort(key=lambda item: item[1], reverse=True)
        for j, w in candidates[:min_top_k]:
            if w <= 0:
                continue
            source, target = sorted([papers[i].id, papers[j].id])
            key = (source, target, "similarity")
            if key not in edge_map:
                edge_map[key] = GraphEdgeRecord(source=source, target=target, weight=round(w, 4), edge_type="similarity")

    ranked = sorted(papers, key=lambda p: p.citation_count, reverse=True)
    for p in papers:
        if p.citation_count <= 0:
            continue
        if ranked and ranked[0].id != p.id:
            source, target = sorted([p.id, ranked[0].id])
            edge_map[(source, target, "citation")] = GraphEdgeRecord(
                source=source,
                target=target,
                weight=round(min(1.0, math.log10(p.citation_count + 1) / 2), 4),
                edge_type="citation",
            )

    if n_papers <= 1:
        labels = [0]
    else:
        n_clusters = max(2, min(10, int(round(math.sqrt(n_papers)))))
        n_clusters = min(n_clusters, n_papers)
        km = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        labels = [int(x) for x in km.fit_predict(embeddings)]

    topic_counts: dict[int, Counter[str]] = {}
    for idx, p in enumerate(papers):
        lab = labels[idx]
        topic_counts.setdefault(lab, Counter())
        for top in p.topics:
            t = (top or "").strip()
            if t:
                topic_counts[lab][t] += 1

    cluster_labels: dict[int, str] = {}
    for lab in sorted(set(labels)):
        ctr = topic_counts.get(lab, Counter())
        cluster_labels[lab] = ctr.most_common(1)[0][0] if ctr else f"Theme {lab + 1}"

    graph_nodes = [
        GraphNodeRecord(
            id=p.id,
            label=p.title,
            year=p.year,
            score=p.relevance_score,
            cluster=labels[i],
            cluster_label=cluster_labels.get(labels[i]),
        )
        for i, p in enumerate(papers)
    ]

    graph_edges = list(edge_map.values())

    settings = get_settings()
    store = Neo4jGraphStore(settings.neo4j_uri, settings.neo4j_user, settings.neo4j_password, settings.neo4j_database)
    store.upsert_papers([p.model_dump() for p in papers])
    store.upsert_edges(
        [{"source": e.source, "target": e.target, "weight": e.weight, "kind": e.edge_type} for e in graph_edges]
    )
    emit_event(
        state,
        "graph_builder",
        f"Built graph with {len(graph_nodes)} nodes and {len(graph_edges)} edges.",
        {"nodes": len(graph_nodes), "edges": len(graph_edges)},
    )
    return {
        "graph_nodes": graph_nodes,
        "graph_edges": graph_edges,
        "graph_summary": {"nodes": len(graph_nodes), "edges": len(graph_edges)},
    }
