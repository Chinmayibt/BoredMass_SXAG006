import { GraphNode, Paper } from "../services/api";

const PALETTE = ["#2563eb", "#059669", "#d97706", "#7c3aed", "#0891b2", "#dc2626", "#4f46e5", "#ca8a04"];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function colorForTheme(label: string): string {
  return PALETTE[hashString(label) % PALETTE.length];
}

/** Human-readable cluster label from topic metadata, or backend cluster_label. */
export function clusterLabelsFromGraph(graphNodes: GraphNode[], papers: Paper[]): Map<number, string> {
  const byCluster = new Map<number, GraphNode[]>();
  for (const n of graphNodes) {
    if (!byCluster.has(n.cluster)) byCluster.set(n.cluster, []);
    byCluster.get(n.cluster)!.push(n);
  }

  const labels = new Map<number, string>();
  for (const [cid, ns] of byCluster) {
    const backend = ns.find((x) => x.cluster_label?.trim())?.cluster_label?.trim();
    if (backend) {
      labels.set(cid, backend.length > 42 ? `${backend.slice(0, 39)}…` : backend);
      continue;
    }
    const freq = new Map<string, number>();
    for (const n of ns) {
      const p = papers.find((x) => x.id === n.id);
      for (const t of p?.topics ?? []) {
        const k = t.trim();
        if (k) freq.set(k, (freq.get(k) ?? 0) + 1);
      }
    }
    if (freq.size) {
      const top = [...freq.entries()].sort((a, b) => b[1] - a[1])[0][0];
      labels.set(cid, top.length > 42 ? `${top.slice(0, 39)}…` : top);
    } else {
      labels.set(cid, `Research theme ${cid + 1}`);
    }
  }
  return labels;
}

export function clusterThemeColors(labels: Map<number, string>): Map<number, string> {
  const colors = new Map<number, string>();
  for (const [cid, label] of labels) {
    colors.set(cid, colorForTheme(label));
  }
  return colors;
}

export function averageRelevanceByCluster(graphNodes: GraphNode[]): Map<number, number> {
  const sums = new Map<number, { sum: number; n: number }>();
  for (const node of graphNodes) {
    const x = sums.get(node.cluster) ?? { sum: 0, n: 0 };
    x.sum += node.score;
    x.n += 1;
    sums.set(node.cluster, x);
  }
  const out = new Map<number, number>();
  for (const [cid, { sum, n }] of sums.entries()) {
    out.set(cid, n ? sum / n : 0);
  }
  return out;
}

export function trendingClusterId(graphNodes: GraphNode[]): number | null {
  const avg = averageRelevanceByCluster(graphNodes);
  if (!avg.size) return null;
  let best = -1;
  let bestId: number | null = null;
  for (const [cid, v] of avg) {
    if (v > best) {
      best = v;
      bestId = cid;
    }
  }
  return bestId;
}
