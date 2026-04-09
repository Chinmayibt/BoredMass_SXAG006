import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { postDebatePdf, type DebateResponse } from "../services/researchAgentApi";

export default function DebateAgent() {
  useDocumentTitle("Mantis · Debate agent");
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DebateResponse | null>(null);

  const canSubmit = Boolean(fileA && fileB && !loading);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fileA || !fileB) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const out = await postDebatePdf(fileA, fileB);
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
        <h1>Debate agent</h1>
        <p className="muted">Upload two PDFs. Each side is summarized and debated; a judge and critic round out the run.</p>
      </header>

      <section className="card card--elevated agent-panel">
        <form className="agent-form" onSubmit={onSubmit}>
          <div className="agent-form-row">
            <label className="agent-label">
              <span>Paper A (PDF)</span>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => setFileA(e.target.files?.[0] ?? null)}
              />
            </label>
            <label className="agent-label">
              <span>Paper B (PDF)</span>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => setFileB(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>
          <button type="submit" className="primary" disabled={!canSubmit}>
            {loading ? "Running…" : "Run debate"}
          </button>
        </form>
      </section>

      {error ? (
        <section className="card agent-alert" role="alert">
          <p className="agent-alert-title">Error</p>
          <pre className="agent-output-pre">{error}</pre>
        </section>
      ) : null}

      {data ? (
        <div className="agent-output-stack">
          <section className="card">
            <h2 className="agent-section-title">Round 1</h2>
            <details open>
              <summary>Agent A</summary>
              <div className="agent-markdown">
                <ReactMarkdown>{data.round_1.A}</ReactMarkdown>
              </div>
            </details>
            <details open>
              <summary>Agent B</summary>
              <div className="agent-markdown">
                <ReactMarkdown>{data.round_1.B}</ReactMarkdown>
              </div>
            </details>
          </section>

          <section className="card">
            <h2 className="agent-section-title">Round 2 (rebuttals)</h2>
            <details open>
              <summary>Agent A rebuttal</summary>
              <div className="agent-markdown">
                <ReactMarkdown>{data.round_2.A_rebuttal}</ReactMarkdown>
              </div>
            </details>
            <details open>
              <summary>Agent B rebuttal</summary>
              <div className="agent-markdown">
                <ReactMarkdown>{data.round_2.B_rebuttal}</ReactMarkdown>
              </div>
            </details>
          </section>

          <section className="card">
            <h2 className="agent-section-title">Final verdict</h2>
            <div className="agent-markdown">
              <ReactMarkdown>{data.final_verdict}</ReactMarkdown>
            </div>
          </section>

          <section className="card">
            <h2 className="agent-section-title">Critic review</h2>
            <div className="agent-markdown">
              <ReactMarkdown>{data.critic}</ReactMarkdown>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
