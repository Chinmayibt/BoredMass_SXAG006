import React from "react";
import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";

type Props = {
  nodes: Array<{ id: string; label: string; cluster: number }>;
  edges: Array<{ source: string; target: string; edge_type: string }>;
};

function colorForCluster(cluster: number): string {
  const palette = ["#1f77b4", "#2ca02c", "#ff7f0e", "#9467bd", "#17becf", "#d62728"];
  return palette[cluster % palette.length];
}

export default function GraphView({ nodes, edges }: Props) {
  const flowNodes = nodes.map((n, i) => ({
    id: n.id,
    data: { label: n.label },
    position: { x: (i % 8) * 220, y: Math.floor(i / 8) * 120 },
    style: { border: `2px solid ${colorForCluster(n.cluster)}`, borderRadius: 8, padding: 6, width: 180 },
  }));
  const flowEdges = edges.map((e, i) => ({
    id: `e-${i}-${e.source}-${e.target}`,
    source: e.source,
    target: e.target,
    animated: e.edge_type === "similarity",
  }));

  return (
    <div style={{ height: 450, border: "1px solid #ddd", borderRadius: 10 }}>
      <ReactFlow nodes={flowNodes} edges={flowEdges} fitView>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
