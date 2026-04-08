import React from "react";
import { LoopLog, RunResearchResponse } from "../../services/api";

type RightPanelProps = {
  data: RunResearchResponse | null;
  loading: boolean;
  reportLink: string | null;
};

function latestLog(logs: LoopLog[]): LoopLog | null {
  return logs.length ? logs[logs.length - 1] : null;
}

export default function RightPanel({ data, loading, reportLink }: RightPanelProps) {
  const log = data ? latestLog(data.loop_logs) : null;
  const statusLabel = loading ? "Running" : data ? "Completed" : "Idle";

  return (
    <aside className="right-panel card">
      <h2>Info</h2>
      <div className="panel-group">
        <p className="muted">Status</p>
        <p className={`status status-${statusLabel.toLowerCase()}`}>{statusLabel}</p>
      </div>

      <div className="panel-group">
        <p className="muted">Documents</p>
        <p className="metric">{data?.papers.length ?? 0}</p>
      </div>

      <div className="panel-group">
        <p className="muted">Graph</p>
        <p className="metric">
          {data?.graph_nodes.length ?? 0} nodes / {data?.graph_edges.length ?? 0} edges
        </p>
      </div>

      <div className="panel-group">
        <p className="muted">Last loop</p>
        {log ? (
          <p className="metric">
            Iter {log.iteration}: accepted {log.accepted} of {log.fetched}
          </p>
        ) : (
          <p className="metric">No loop data yet</p>
        )}
      </div>

      {reportLink ? (
        <a className="button-link" href={reportLink} target="_blank" rel="noreferrer">
          Download PDF report
        </a>
      ) : (
        <button type="button" className="button-link disabled" disabled>
          PDF available after run
        </button>
      )}
    </aside>
  );
}
