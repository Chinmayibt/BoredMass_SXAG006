import React from "react";
import GraphView from "../GraphView";
import { GraphEdge, GraphNode, Paper } from "../../services/api";

type Props = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  papers: Paper[];
  selectedNode: string | null;
  onSelectNode: (id: string | null) => void;
};

export default function GraphSection({ nodes, edges, papers, selectedNode, onSelectNode }: Props) {
  const related =
    selectedNode &&
    papers.filter((p) => {
      const neighbor = new Set<string>([selectedNode]);
      for (const e of edges) {
        if (e.source === selectedNode) neighbor.add(e.target);
        if (e.target === selectedNode) neighbor.add(e.source);
      }
      return neighbor.has(p.id);
    });

  return (
    <section className="card graph-section" aria-label="Knowledge graph">
      <GraphView nodes={nodes} edges={edges} onSelectNode={onSelectNode} />
      {selectedNode ? (
        <div className="related-papers">
          <h4>Related papers</h4>
          {related?.length ? (
            <ul>
              {related.slice(0, 8).map((paper) => (
                <li key={paper.id}>
                  <a href={paper.url} target="_blank" rel="noreferrer">
                    {paper.title}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">No related papers found for this node.</p>
          )}
        </div>
      ) : null}
    </section>
  );
}
