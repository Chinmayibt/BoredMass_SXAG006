import React from "react";

export type WorkspaceTabId = "overview" | "sources" | "graph" | "report";

const TABS: { id: WorkspaceTabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "sources", label: "Sources" },
  { id: "graph", label: "Graph" },
  { id: "report", label: "Report" },
];

type Props = {
  active: WorkspaceTabId;
  onChange: (id: WorkspaceTabId) => void;
};

export default function WorkspaceTabs({ active, onChange }: Props) {
  return (
    <nav className="workspace-tabs" aria-label="Workspace sections">
      {TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`workspace-tab ${active === t.id ? "active" : ""}`}
          aria-selected={active === t.id}
          role="tab"
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}
