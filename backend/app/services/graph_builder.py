import networkx as nx
import numpy as np
from sklearn.cluster import KMeans

from app.models.schemas import GraphEdge, GraphNode, Paper


def build_graph(papers: list[Paper], embeddings: np.ndarray, top_k: int = 3) -> tuple[list[GraphNode], list[GraphEdge], dict[str, list[str]]]:
    graph = nx.Graph()
    ids = [p.id for p in papers]

    for paper in papers:
        graph.add_node(paper.id, label=paper.title, year=paper.year, score=paper.relevance_score)

    sim = embeddings @ embeddings.T
    for i in range(len(papers)):
        row = sim[i]
        top_idx = np.argsort(row)[::-1]
        linked = 0
        for j in top_idx:
            if i == j:
                continue
            if linked >= top_k:
                break
            w = float(row[j])
            graph.add_edge(ids[i], ids[j], weight=w, edge_type="similarity")
            linked += 1

    for i in range(len(papers) - 1):
        if papers[i].citation_count > 0:
            graph.add_edge(ids[i], ids[i + 1], weight=1.0, edge_type="citation")

    cluster_count = min(6, max(2, len(papers) // 8)) if len(papers) >= 4 else 1
    labels = [0] * len(papers)
    if cluster_count > 1:
        km = KMeans(n_clusters=cluster_count, random_state=42, n_init=10)
        labels = km.fit_predict(embeddings).tolist()

    for pid, label in zip(ids, labels):
        graph.nodes[pid]["cluster"] = int(label)

    nodes = [
        GraphNode(
            id=n,
            label=graph.nodes[n]["label"],
            year=graph.nodes[n]["year"],
            score=float(graph.nodes[n]["score"]),
            cluster=int(graph.nodes[n].get("cluster", 0)),
        )
        for n in graph.nodes
    ]
    edges = [
        GraphEdge(source=u, target=v, weight=float(d.get("weight", 0.0)), edge_type=d.get("edge_type", "similarity"))
        for u, v, d in graph.edges(data=True)
    ]

    clusters: dict[str, list[str]] = {}
    for paper, label in zip(papers, labels):
        key = f"cluster_{label}"
        clusters.setdefault(key, []).append(paper.title)

    return nodes, edges, clusters
