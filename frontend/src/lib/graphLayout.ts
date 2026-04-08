import dagre from "dagre";
import { Edge, Node } from "reactflow";

const DEFAULT_W = 200;
const DEFAULT_H = 88;

function nodeBox(n: Node): { w: number; h: number } {
  const d = n.data as { layoutW?: number; layoutH?: number } | undefined;
  const w = typeof d?.layoutW === "number" ? d.layoutW : DEFAULT_W;
  const h = typeof d?.layoutH === "number" ? d.layoutH : DEFAULT_H;
  return { w, h };
}

export function layoutWithDagre(nodes: Node[], edges: Edge[], direction: "TB" | "LR" = "TB"): { nodes: Node[]; edges: Edge[] } {
  if (!nodes.length) {
    return { nodes: [], edges: [] };
  }

  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction, ranksep: 100, nodesep: 48 });

  nodes.forEach((n) => {
    const { w, h } = nodeBox(n);
    g.setNode(n.id, { width: w, height: h });
  });
  edges.forEach((e) => {
    if (g.hasNode(e.source) && g.hasNode(e.target)) {
      g.setEdge(e.source, e.target);
    }
  });

  dagre.layout(g);

  const nextNodes = nodes.map((n) => {
    const { w, h } = nodeBox(n);
    const pos = g.node(n.id);
    const x = pos.x - w / 2;
    const y = pos.y - h / 2;
    return {
      ...n,
      position: { x, y },
      targetPosition: direction === "LR" ? "left" : "top",
      sourcePosition: direction === "LR" ? "right" : "bottom",
    } as Node;
  });

  return { nodes: nextNodes, edges };
}
