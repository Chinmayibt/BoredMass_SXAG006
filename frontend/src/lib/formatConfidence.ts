const CONFIDENCE_HINT = "Estimated from average relevance of top retrieved papers (0–100%).";

/** Turn backend progress string (e.g. "0.72" or "n/a") into display text + tooltip title. */
export function formatConfidence(raw: string | undefined | null): { display: string; title: string } {
  if (!raw || raw.toLowerCase() === "n/a") {
    return { display: "—", title: CONFIDENCE_HINT };
  }
  const n = Number.parseFloat(raw);
  if (Number.isFinite(n)) {
    const pct = n <= 1 ? Math.round(n * 100) : Math.round(n);
    const clamped = Math.min(100, Math.max(0, pct));
    return { display: `${clamped}%`, title: CONFIDENCE_HINT };
  }
  return { display: raw, title: CONFIDENCE_HINT };
}
