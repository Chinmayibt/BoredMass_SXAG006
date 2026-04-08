import React, { useMemo, useState } from "react";
import GraphView from "../components/GraphView";
import InsightPanel from "../components/InsightPanel";
import PaperTable from "../components/PaperTable";
import { reportUrl, runResearch } from "../services/api";

export default function Home() {
  const [topic, setTopic] = useState("retrieval augmented generation");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<any>(null);

  const logs = useMemo(() => data?.loop_logs ?? [], [data]);

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await runResearch({ topic, max_papers: 30, max_iterations: 3 });
      setData(result);
    } catch (e: any) {
      setError(e.message || "Failed to run research");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>ScholAR</h1>
      <p>Autonomous Research Intelligence Agent</p>
      <div className="card">
        <label>Research Topic</label>
        <input value={topic} onChange={(e) => setTopic(e.target.value)} />
        <button onClick={submit} disabled={loading || topic.trim().length < 3}>
          {loading ? "Running..." : "Run Autonomous Review"}
        </button>
        {data?.job_id ? (
          <a href={reportUrl(data.job_id)} target="_blank" rel="noreferrer">Download PDF Report</a>
        ) : null}
        {error ? <p className="error">{error}</p> : null}
      </div>

      <div className="grid">
        <InsightPanel insights={data?.insights} />
        <div className="card">
          <h3>Autonomous Loop Logs</h3>
          <ul>
            {logs.map((l: any, i: number) => (
              <li key={i}>
                Iter {l.iteration}: fetched {l.fetched}, accepted {l.accepted}, novelty {l.novelty_ratio}
                {l.stop_reason ? `, stop=${l.stop_reason}` : ""}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card">
        <h3>Knowledge Graph</h3>
        <GraphView nodes={data?.graph_nodes ?? []} edges={data?.graph_edges ?? []} />
      </div>
      <PaperTable papers={data?.papers} />
    </div>
  );
}
