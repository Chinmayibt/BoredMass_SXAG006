import dagre from "dagre";
import { Edge, Node } from "reactflow";

const NODE_W = 200;
const NODE_H = 88;

export function layoutWithDagre(nodes: Node[], edges: Edge[], direction: "TB" | "LR" = "TB"): { nodes: Node[]; edges: Edge[] } {
  if (!nodes.length) {
    return { nodes: [], edges: [] };
  }

  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction, ranksep: 90, nodesep: 40 });

  nodes.forEach((n) => {
    g.setNode(n.id, { width: NODE_W, height: NODE_H });
  });
  edges.forEach((e) => {
    if (g.hasNode(e.source) && g.hasNode(e.target)) {
      g.setEdge(e.source, e.target);
    }
  });

  dagre.layout(g);

  const nextNodes = nodes.map((n) => {
    const pos = g.node(n.id);
    const x = pos.x - NODE_W / 2;
    const y = pos.y - NODE_H / 2;
    return {
      ...n,
      position: { x, y },
      targetPosition: direction === "LR" ? "left" : "top",
      sourcePosition: direction === "LR" ? "right" : "bottom",
    } as Node;
  });

  return { nodes: nextNodes, edges };
}
