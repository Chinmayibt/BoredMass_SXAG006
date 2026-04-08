import React, { useMemo, useState } from "react";
import GraphView from "../components/GraphView";
import InsightPanel from "../components/InsightPanel";
import PaperTable from "../components/PaperTable";
import RightPanel from "../components/layout/RightPanel";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import { reportUrl, RunResearchResponse, runResearch } from "../services/api";

export default function Home() {
  const [topic, setTopic] = useState("retrieval augmented generation");
  const [maxPapers, setMaxPapers] = useState(30);
  const [maxIterations, setMaxIterations] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<RunResearchResponse | null>(null);

  const logs = useMemo(() => data?.loop_logs ?? [], [data]);
  const canSubmit = !loading && topic.trim().length >= 3;

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await runResearch({ topic, max_papers: maxPapers, max_iterations: maxIterations });
      setData(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to run research");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <Sidebar active="Projects" />
      <main className="workspace">
        <Topbar
          topic={topic}
          onTopicChange={setTopic}
          onSubmit={submit}
          loading={loading}
          canSubmit={canSubmit}
        />

        <section className="card command-card">
          <div className="command-row">
            <div>
              <label htmlFor="topic-main">Research topic</label>
              <input
                id="topic-main"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter a domain or problem statement"
                aria-label="Research topic input"
              />
            </div>
            <div>
              <label htmlFor="max-papers">Max papers</label>
              <input
                id="max-papers"
                type="number"
                min={10}
                max={50}
                value={maxPapers}
                onChange={(e) => setMaxPapers(Number(e.target.value))}
                aria-label="Maximum number of papers"
              />
            </div>
            <div>
              <label htmlFor="max-iterations">Max iterations</label>
              <input
                id="max-iterations"
                type="number"
                min={1}
                max={5}
                value={maxIterations}
                onChange={(e) => setMaxIterations(Number(e.target.value))}
                aria-label="Maximum number of iterations"
              />
            </div>
            <button type="button" className="primary" onClick={submit} disabled={!canSubmit}>
              {loading ? "Running..." : "Run autonomous review"}
            </button>
          </div>
          {data?.job_id ? (
            <a className="button-link" href={reportUrl(data.job_id)} target="_blank" rel="noreferrer">
              Download PDF report
            </a>
          ) : null}
          {error ? <p className="error">{error}</p> : null}
        </section>

        <section className="kpi-grid">
          <div className="card">
            <p className="muted">Papers</p>
            <p className="kpi-value">{data?.papers.length ?? 0}</p>
          </div>
          <div className="card">
            <p className="muted">Accepted in latest loop</p>
            <p className="kpi-value">{logs.length ? logs[logs.length - 1].accepted : 0}</p>
          </div>
          <div className="card">
            <p className="muted">Knowledge graph nodes</p>
            <p className="kpi-value">{data?.graph_nodes.length ?? 0}</p>
          </div>
        </section>

        <section className="grid">
          <InsightPanel insights={data?.insights} />
          <div className="card">
            <h3>Autonomous Loop Logs</h3>
            {!logs.length ? (
              <p className="muted">No loop logs yet.</p>
            ) : (
              <ul className="loop-list">
                {logs.map((l) => (
                  <li key={l.iteration}>
                    <strong>Iter {l.iteration}</strong>: fetched {l.fetched}, accepted {l.accepted}, novelty{" "}
                    {l.novelty_ratio}
                    {l.stop_reason ? `, stop=${l.stop_reason}` : ""}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="card">
          <GraphView nodes={data?.graph_nodes ?? []} edges={data?.graph_edges ?? []} />
        </section>

        <PaperTable papers={data?.papers} />
      </main>

      <RightPanel data={data} loading={loading} reportLink={data?.job_id ? reportUrl(data.job_id) : null} />
    </div>
  );
}
