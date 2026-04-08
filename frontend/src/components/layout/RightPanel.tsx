import React from "react";
import { Activity, X } from "lucide-react";
import { RunResearchResponse } from "../../services/api";
import { formatConfidence } from "../../lib/formatConfidence";
import { labelStage } from "../../lib/stageLabels";

type RightPanelProps = {
  id?: string;
  data: RunResearchResponse | null;
  loading: boolean;
  reportLink: string | null;
  stage: string;
  sourcesAnalyzed: number;
  confidence: string;
  /** When true, panel is a slide-over drawer (narrow viewports). */
  floating?: boolean;
  drawerOpen?: boolean;
  onDrawerClose?: () => void;
};

export default function RightPanel({
  id,
  data,
  loading,
  reportLink,
  stage,
  sourcesAnalyzed,
  confidence,
  floating = false,
  drawerOpen = false,
  onDrawerClose,
}: RightPanelProps) {
  const statusLabel = loading ? "Running" : data ? "Completed" : "Idle";
  const { display: confDisplay, title: confTitle } = formatConfidence(confidence);

  const panelClass = [
    "right-panel",
    "card",
    floating ? "right-panel--floating" : "",
    floating && drawerOpen ? "right-panel--open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <aside id={id} className={panelClass} aria-label="Session summary">
      <div className="right-panel__head">
        <h2>
          <Activity size={16} aria-hidden /> Session
        </h2>
        {floating && drawerOpen ? (
          <button type="button" className="icon-button" onClick={onDrawerClose} aria-label="Close panel">
            <X size={18} />
          </button>
        ) : null}
      </div>
      <div className="panel-group">
        <p className="muted">Status</p>
        <p className={`status status-${statusLabel.toLowerCase()}`}>{statusLabel}</p>
      </div>

      <div className="panel-group">
        <p className="muted">Processing stage</p>
        <p className="metric">{labelStage(stage)}</p>
      </div>

      <div className="panel-group">
        <p className="muted">Sources analyzed</p>
        <p className="metric">{sourcesAnalyzed}</p>
      </div>

      <div className="panel-group">
        <p className="muted">Confidence</p>
        <p className="metric" title={confTitle}>
          {confDisplay}
        </p>
        <p className="muted panel-hint">{confTitle}</p>
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
