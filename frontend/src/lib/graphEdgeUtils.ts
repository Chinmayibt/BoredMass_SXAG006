import { Edge, MarkerType } from "reactflow";
import { GraphEdge } from "../services/api";

const SIM_CAP = 85;

export function filterGraphEdges(edges: GraphEdge[], showAll: boolean): GraphEdge[] {
  const citations = edges.filter((e) => e.edge_type === "citation");
  const simAll = edges.filter((e) => e.edge_type === "similarity");
  if (showAll) return [...citations, ...simAll];
  const key = (e: GraphEdge) => [...[e.source, e.target]].sort().join("--");
  const byNode = new Map<string, GraphEdge[]>();
  for (const e of simAll) {
    for (const id of [e.source, e.target]) {
      if (!byNode.has(id)) byNode.set(id, []);
      byNode.get(id)!.push(e);
    }
  }
  const pickKeys = new Set<string>();
  for (const [, arr] of byNode) {
    arr.sort((a, b) => b.weight - a.weight);
    for (const e of arr.slice(0, 3)) pickKeys.add(key(e));
  }
  let sim = simAll.filter((e) => pickKeys.has(key(e)));
  sim.sort((a, b) => b.weight - a.weight);
  sim = sim.slice(0, SIM_CAP);
  return [...citations, ...sim];
}

export function graphEdgeToReactFlow(e: GraphEdge, i: number): Edge {
  const isCit = e.edge_type === "citation";
  const w = Math.min(4, 1 + e.weight * 2.5);
  const dashed = !isCit && e.weight < 0.52;
  return {
    id: `e-${i}-${e.source}-${e.target}`,
    source: e.source,
    target: e.target,
    style: {
      stroke: isCit ? "#475569" : "#94a3b8",
      strokeWidth: w,
      strokeDasharray: dashed ? "6 4" : undefined,
      opacity: isCit ? 0.95 : 0.75,
    },
    markerEnd: isCit
      ? { type: MarkerType.ArrowClosed, color: "#475569", orient: "auto", width: 16, height: 16 }
      : undefined,
  };
}
