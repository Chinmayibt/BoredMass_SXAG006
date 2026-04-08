import React, { useMemo } from "react";
import { PipelineEvent } from "../../services/api";
import { labelStage } from "../../lib/stageLabels";

type Props = {
  events: PipelineEvent[];
  loading: boolean;
};

function formatEventTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  } catch {
    return iso;
  }
}

export default function ExecutionLogSection({ events, loading }: Props) {
  const ordered = useMemo(() => [...events].reverse(), [events]);

  return (
    <div className="card execution-log-card">
      <h3>Execution events</h3>
      <p id="execution-log-hint" className="sr-only">
        Newest events appear first. Scroll to see earlier steps.
      </p>
      {!events.length ? (
        <p className="muted" aria-live="polite">
          {loading ? "Working…" : "No events yet."}
        </p>
      ) : (
        <ul className="execution-log-list" aria-describedby="execution-log-hint">
          {ordered.map((event) => (
            <li key={event.seq} className={`execution-log-item execution-log-item--${event.level}`}>
              <span className="execution-log-time">{formatEventTime(event.ts)}</span>
              <span className="execution-log-stage">{labelStage(event.stage)}</span>
              <span className="execution-log-msg">{event.message}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
