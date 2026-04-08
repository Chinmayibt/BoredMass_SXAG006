import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CommandActions from "../components/workspace/CommandActions";
import ExecutionLogSection from "../components/workspace/ExecutionLogSection";
import GraphSection from "../components/workspace/GraphSection";
import InsightPanel from "../components/InsightPanel";
import LiveMetricsStrip from "../components/workspace/LiveMetricsStrip";
import PaperTable from "../components/PaperTable";
import ReportSection from "../components/workspace/ReportSection";
import RightPanel from "../components/layout/RightPanel";
import Topbar from "../components/layout/Topbar";
import WorkspaceTabs, { WorkspaceTabId } from "../components/workspace/WorkspaceTabs";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { useResearchRun } from "../hooks/useResearchRun";
import { reportUrl } from "../services/api";

function validTab(t: string | null): WorkspaceTabId {
  const allowed: WorkspaceTabId[] = ["overview", "sources", "graph", "report"];
  return allowed.includes(t as WorkspaceTabId) ? (t as WorkspaceTabId) : "overview";
}

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const narrowRail = useMediaQuery("(max-width: 1280px)");

  const {
    topic,
    setTopic,
    loading,
    error,
    data,
    events,
    stage,
    sourcesAnalyzed,
    confidence,
    submit,
    loadJob,
  } = useResearchRun("retrieval augmented generation");

  const tab = validTab(searchParams.get("tab"));

  const setTab = (id: WorkspaceTabId) => {
    setSearchParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        p.set("tab", id);
        return p;
      },
      { replace: true }
    );
  };

  const jobIdParam = searchParams.get("jobId");
  useEffect(() => {
    if (!jobIdParam) return;
    void loadJob(jobIdParam);
  }, [jobIdParam, loadJob]);

  const reportHref = data?.job_id ? reportUrl(data.job_id) : null;
  const metricSources = sourcesAnalyzed || data?.papers.length || 0;

  return (
    <>
      <main className={`workspace page-home ${!data && !loading ? "page-home--empty" : ""}`}>
        <Topbar topic={topic} onTopicChange={setTopic} onSubmit={submit} loading={loading} canSubmit={!loading && topic.trim().length >= 3} />

        <CommandActions reportPdfHref={reportHref} error={error} />

        <LiveMetricsStrip sourcesAnalyzed={metricSources} stageKey={stage} confidenceRaw={confidence} />

        <WorkspaceTabs active={tab} onChange={setTab} />

        {tab === "overview" ? (
          <section className="workspace-panel" aria-label="Overview">
            {loading && !events.length ? <div className="skeleton skeleton--hero" aria-hidden /> : null}
            <div className="grid">
              <InsightPanel insights={data?.insights} />
              <ExecutionLogSection events={events} loading={loading} />
            </div>
          </section>
        ) : null}

        {tab === "sources" ? (
          <section className="workspace-panel" aria-label="Sources">
            <PaperTable papers={data?.papers} />
          </section>
        ) : null}

        {tab === "graph" ? (
          <section className="workspace-panel" aria-label="Graph">
            <GraphSection
              nodes={data?.graph_nodes ?? []}
              edges={data?.graph_edges ?? []}
              papers={data?.papers ?? []}
              insights={data?.insights}
              selectedNode={selectedNode}
              onSelectNode={setSelectedNode}
            />
          </section>
        ) : null}

        {tab === "report" ? (
          <section className="workspace-panel" aria-label="Report">
            <ReportSection
              reportMarkdown={data?.report_markdown}
              onCopyFull={() => {
                if (data?.report_markdown) void navigator.clipboard.writeText(data.report_markdown);
              }}
            />
          </section>
        ) : null}
      </main>

      {narrowRail ? (
        <>
          <button type="button" className="rail-toggle" onClick={() => setDrawerOpen(true)} aria-expanded={drawerOpen} aria-controls="session-rail">
            Session
          </button>
          {drawerOpen ? <div className="rail-backdrop" aria-hidden onClick={() => setDrawerOpen(false)} /> : null}
        </>
      ) : null}

      <RightPanel
        id="session-rail"
        data={data}
        loading={loading}
        reportLink={reportHref}
        stage={stage}
        sourcesAnalyzed={metricSources}
        confidence={confidence}
        floating={narrowRail}
        drawerOpen={drawerOpen}
        onDrawerClose={() => setDrawerOpen(false)}
      />
    </>
  );
}
