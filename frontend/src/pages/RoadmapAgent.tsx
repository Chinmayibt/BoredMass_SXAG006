import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { postRoadmapPdf, type RoadmapStep, type RoadmapSuccess } from "../services/researchAgentApi";

export default function RoadmapAgent() {
  const [topic, setTopic] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RoadmapSuccess | null>(null);
  const [roadmapError, setRoadmapError] = useState<string | null>(null);

  const canSubmit = topic.trim().length >= 3 && files.length > 0 && !loading;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    setData(null);
    setRoadmapError(null);
    try {
      const out = await postRoadmapPdf(topic.trim(), files);
      if ("error" in out) {
        setRoadmapError(out.error);
        return;
      }
      setData(out);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="workspace page-secondary">
      <header className="page-header">
        <h1>Roadmap agent</h1>
        <p className="muted">Enter a topic and upload one or more PDFs to get a grounded learning roadmap and a critic pass.</p>
      </header>

      <section className="card card--elevated agent-panel">
        <form className="agent-form" onSubmit={onSubmit}>
          <label className="agent-label agent-label--full">
            <span>Topic</span>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. graph neural networks in healthcare"
              minLength={3}
            />
          </label>
          <label className="agent-label agent-label--full">
            <span>Papers (PDF)</span>
            <input
              type="file"
              accept=".pdf,application/pdf"
              multiple
              onChange={(e) => setFiles(e.target.files ? Array.from(e.target.files) : [])}
            />
          </label>
          <button type="submit" className="primary" disabled={!canSubmit}>
            {loading ? "Generating…" : "Generate roadmap"}
          </button>
        </form>
      </section>

      {error ? (
        <section className="card agent-alert" role="alert">
          <p className="agent-alert-title">Error</p>
          <pre className="agent-output-pre">{error}</pre>
        </section>
      ) : null}

      {roadmapError ? (
        <section className="card agent-alert" role="alert">
          <p className="agent-alert-title">Roadmap could not be generated</p>
          <pre className="agent-output-pre">{roadmapError}</pre>
        </section>
      ) : null}

      {data ? (
        <div className="agent-output-stack">
          <section className="card">
            <h2 className="agent-section-title">Roadmap</h2>
            <div className="agent-table-wrap">
              <table className="agent-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Paper</th>
                    <th>Concept</th>
                    <th>Reason</th>
                    <th>What you learn</th>
                  </tr>
                </thead>
                <tbody>
                  {data.roadmap.map((step: RoadmapStep) => (
                    <tr key={step.step}>
                      <td>{step.step}</td>
                      <td>{step.paper_title}</td>
                      <td>{step.concept_from_paper}</td>
                      <td>{step.reason}</td>
                      <td>{step.what_you_learn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card">
            <h2 className="agent-section-title">Critic</h2>
            <div className="agent-markdown">
              <ReactMarkdown>{data.critic}</ReactMarkdown>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
