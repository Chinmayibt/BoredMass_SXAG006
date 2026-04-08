import React, { useCallback, useEffect, useMemo } from "react";
import ReactFlow, { Background, Controls, Edge, MiniMap, Node, useEdgesState, useNodesState } from "reactflow";
import "reactflow/dist/style.css";
import { GraphEdge, GraphNode } from "../services/api";
import { layoutWithDagre } from "../lib/graphLayout";
import PaperGraphNode, { PaperNodeData } from "./PaperGraphNode";

const nodeTypes = { paper: PaperGraphNode };

type Props = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onSelectNode?: (nodeId: string) => void;
};

function truncateLabel(text: string, max = 42): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

export default function GraphView({ nodes, edges, onSelectNode }: Props) {
  const initial = useMemo(() => {
    if (!nodes.length) {
      return { nodes: [] as Node[], edges: [] as Edge[] };
    }
    const rfNodes: Node<PaperNodeData>[] = nodes.map((n) => ({
      id: n.id,
      type: "paper",
      position: { x: 0, y: 0 },
      data: {
        label: truncateLabel(n.label),
        fullTitle: n.label,
        summary: `${n.year ?? "n/a"} · relevance ${n.score.toFixed(2)}`,
        cluster: n.cluster,
      },
    }));
    const rfEdges: Edge[] = edges.map((e, i) => ({
      id: `e-${i}-${e.source}-${e.target}`,
      source: e.source,
      target: e.target,
      animated: e.edge_type === "similarity",
    }));
    return layoutWithDagre(rfNodes, rfEdges, "TB");
  }, [nodes, edges]);

  const [rfNodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [rfEdges, setEdges, onEdgesChange] = useEdgesState(initial.edges);

  useEffect(() => {
    setNodes(initial.nodes);
    setEdges(initial.edges);
  }, [initial, setNodes, setEdges]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onSelectNode?.(node.id);
    },
    [onSelectNode]
  );

  if (!nodes.length) {
    return (
      <div className="graph-empty">
        <p className="muted">No graph data yet. Run research to generate a knowledge graph.</p>
      </div>
    );
  }

  return (
    <div className="graph-wrap">
      <div className="graph-header">
        <h4>Knowledge graph</h4>
        <p className="muted">Papers as nodes; edges show similarity and citation links. Pan and zoom to explore.</p>
      </div>
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        fitView
        minZoom={0.2}
        maxZoom={1.5}
      >
        <Background gap={18} />
        <Controls />
        <MiniMap pannable zoomable className="graph-minimap" />
      </ReactFlow>
    </div>
  );
}
