/** Maps backend/SSE pipeline stage ids to short user-facing labels. */
const STAGE_LABELS: Record<string, string> = {
  idle: "Ready",
  queued: "Queued",
  running: "Running",
  planner: "Planning search",
  search: "Searching literature",
  pdf_extract: "Extracting PDFs",
  asset_store: "Storing assets",
  structuring: "Structuring facts",
  memory: "Indexing memory",
  graph_builder: "Building knowledge graph",
  insight: "Generating insights",
  report: "Writing report",
  completed: "Completed",
  partial_success: "Completed (partial)",
  failed: "Failed",
  done: "Finished",
};

export function labelStage(stage: string | undefined | null): string {
  if (!stage) return STAGE_LABELS.idle;
  const key = stage.toLowerCase().trim();
  return STAGE_LABELS[key] ?? stage.replace(/_/g, " ");
}
