import { Edge, Node } from "reactflow";
import type { GraphEdge, GraphNode, Insights, Paper } from "../services/api";
import { filterGraphEdges, graphEdgeToReactFlow } from "./graphEdgeUtils";
import { shortTitle } from "./shortTitle";

export const CLUSTER_PREFIX = "cluster-";

export type BuildResearchMapParams = {
  graphNodes: GraphNode[];
  graphEdges: GraphEdge[];
  papers: Paper[];
  expandedClusters: Set<number>;
  showAllEdges: boolean;
  clusterLabels: Map<number, string>;
  clusterColors: Map<number, string>;
  trendingClusterId: number | null;
  starPaperIds: Set<string>;
  filterText: string;
};

const CLUSTER_W = 248;
const CLUSTER_H = 108;
const PAPER_W = 200;
const PAPER_H = 88;

function paperMatchesFilter(p: Paper, t: string): boolean {
  if (p.title.toLowerCase().includes(t)) return true;
  if (p.abstract?.toLowerCase().includes(t)) return true;
  for (const topic of p.topics ?? []) {
    if (topic.toLowerCase().includes(t)) return true;
  }
  for (const a of p.authors ?? []) {
    if (a.toLowerCase().includes(t)) return true;
  }
  return false;
}

function focusPaperIds(papers: Paper[], q: string): Set<string> | null {
  const t = q.trim().toLowerCase();
  if (!t) return null;
  const ids = new Set<string>();
  for (const p of papers) {
    if (paperMatchesFilter(p, t)) ids.add(p.id);
  }
  return ids;
}

function applyFocus(nodes: Node[], edges: Edge[], focusIds: Set<string> | null, graphNodes: GraphNode[]): { nodes: Node[]; edges: Edge[] } {
  if (!focusIds || focusIds.size === 0) {
    return { nodes, edges };
  }
  const clusterHasFocus = new Map<number, boolean>();
  for (const gn of graphNodes) {
    if (focusIds.has(gn.id)) clusterHasFocus.set(gn.cluster, true);
  }
  const nextNodes = nodes.map((n) => {
    if (n.type === "cluster") {
      const cid = (n.data as { clusterId?: number }).clusterId ?? -1;
      const show = clusterHasFocus.get(cid) ?? false;
      return { ...n, style: { ...n.style, opacity: show ? 1 : 0.2 } };
    }
    const show = focusIds.has(n.id);
    return { ...n, style: { ...n.style, opacity: show ? 1 : 0.18 } };
  });
  const idSet = new Set(nextNodes.filter((x) => (x.style?.opacity ?? 1) > 0.5).map((x) => x.id));
  const nextEdges = edges.map((e) => {
    const on = idSet.has(e.source) && idSet.has(e.target);
    return { ...e, style: { ...e.style, opacity: on ? (e.style?.opacity ?? 0.75) : 0.08 } };
  });
  return { nodes: nextNodes, edges: nextEdges };
}

export function buildResearchMapGraph(p: BuildResearchMapParams): { nodes: Node[]; edges: Edge[] } {
  const {
    graphNodes,
    graphEdges,
    papers,
    expandedClusters,
    showAllEdges,
    clusterLabels,
    clusterColors,
    trendingClusterId,
    starPaperIds,
    filterText,
  } = p;

  const paperCluster = new Map<string, number>();
  for (const n of graphNodes) paperCluster.set(n.id, n.cluster);

  const clusters = [...new Set(graphNodes.map((n) => n.cluster))].sort((a, b) => a - b);
  const fe = filterGraphEdges(graphEdges, showAllEdges);
  const focusIds = focusPaperIds(papers, filterText);

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const l1Only = expandedClusters.size === 0;

  if (l1Only) {
    for (const c of clusters) {
      const count = graphNodes.filter((n) => n.cluster === c).length;
      const label = clusterLabels.get(c) ?? `Theme ${c + 1}`;
      nodes.push({
        id: `${CLUSTER_PREFIX}${c}`,
        type: "cluster",
        position: { x: 0, y: 0 },
        data: {
          clusterId: c,
          label,
          paperCount: count,
          trending: trendingClusterId === c,
          themeColor: clusterColors.get(c) ?? "#2563eb",
          layoutW: CLUSTER_W,
          layoutH: CLUSTER_H,
        },
      });
    }
    const agg = new Map<string, { count: number }>();
    for (const e of fe) {
      const ca = paperCluster.get(e.source);
      const cb = paperCluster.get(e.target);
      if (ca === undefined || cb === undefined || ca === cb) continue;
      const a = Math.min(ca, cb);
      const b = Math.max(ca, cb);
      const k = `${a}-${b}`;
      const cur = agg.get(k) ?? { count: 0 };
      cur.count += 1;
      agg.set(k, cur);
    }
    let ei = 0;
    for (const [k, { count }] of agg) {
      const [a, b] = k.split("-").map(Number);
      edges.push({
        id: `agg-${ei++}`,
        source: `${CLUSTER_PREFIX}${a}`,
        target: `${CLUSTER_PREFIX}${b}`,
        style: { stroke: "#94a3b8", strokeWidth: 1 + Math.min(2.5, count / 4), strokeDasharray: "5 4", opacity: 0.7 },
        label: String(count),
        labelStyle: { fontSize: 10, fill: "#64748b" },
        labelBgStyle: { fill: "#f1f5f9" },
        labelBgPadding: [4, 2] as [number, number],
      });
    }
    return applyFocus(nodes, edges, focusIds, graphNodes);
  }

  for (const c of clusters) {
    const theme = clusterColors.get(c) ?? "#2563eb";
    const label = clusterLabels.get(c) ?? `Theme ${c + 1}`;
    if (expandedClusters.has(c)) {
      for (const gn of graphNodes.filter((n) => n.cluster === c)) {
        nodes.push({
          id: gn.id,
          type: "paper",
          position: { x: 0, y: 0 },
          data: {
            label: shortTitle(gn.label),
            fullTitle: gn.label,
            summary: `${gn.year ?? "n/a"} · relevance ${gn.score.toFixed(2)}`,
            cluster: c,
            themeColor: theme,
            isStar: starPaperIds.has(gn.id),
            layoutW: PAPER_W,
            layoutH: PAPER_H,
          },
        });
      }
    } else {
      const count = graphNodes.filter((n) => n.cluster === c).length;
      nodes.push({
        id: `${CLUSTER_PREFIX}${c}`,
        type: "cluster",
        position: { x: 0, y: 0 },
        data: {
          clusterId: c,
          label,
          paperCount: count,
          trending: trendingClusterId === c,
          themeColor: theme,
          layoutW: CLUSTER_W,
          layoutH: CLUSTER_H,
        },
      });
    }
  }

  const visiblePapers = new Set(nodes.filter((n) => n.type === "paper").map((n) => n.id));

  fe.forEach((e, idx) => {
    if (!visiblePapers.has(e.source) || !visiblePapers.has(e.target)) return;
    const ca = paperCluster.get(e.source);
    const cb = paperCluster.get(e.target);
    if (ca === undefined || cb === undefined) return;
    if (!showAllEdges && ca !== cb) return;
    edges.push(graphEdgeToReactFlow(e, idx + 1000));
  });

  return applyFocus(nodes, edges, focusIds, graphNodes);
}

export function starPaperIdsFromInsights(papers: Paper[], insights: Insights | undefined): Set<string> {
  const s = new Set<string>();
  if (!insights?.key_papers?.length) return s;
  for (const kp of insights.key_papers) {
    if (kp.paper_id && papers.some((p) => p.id === kp.paper_id)) {
      s.add(kp.paper_id);
      continue;
    }
    const p = papers.find((x) => x.title === kp.title || (kp.url && x.url === kp.url));
    if (p) s.add(p.id);
  }
  return s;
}
