import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  podcastAudioSrc,
  postGeneratePodcast,
  type PodcastSuccess,
} from "../services/researchAgentApi";

export default function PodcastAgent() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PodcastSuccess | null>(null);

  const canSubmit = Boolean(file && !loading);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const out = await postGeneratePodcast(file);
      if (out.status === "error") {
        setError(out.message);
        return;
      }
      setData(out);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  const audioSrc = data?.audio_url ? podcastAudioSrc(data.audio_url) : null;

  return (
    <main className="workspace page-secondary">
      <header className="page-header">
        <h1>Podcast agent</h1>
        <p className="muted">
          Upload a research PDF. The pipeline uses local Ollama, embeddings, Edge TTS, and ffmpeg on the research agent server.
        </p>
      </header>

      <section className="card card--elevated agent-panel">
        <form className="agent-form" onSubmit={onSubmit}>
          <label className="agent-label agent-label--full">
            <span>Paper (PDF)</span>
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <button type="submit" className="primary" disabled={!canSubmit}>
            {loading ? "Generating podcast…" : "Generate podcast"}
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
          {audioSrc ? (
            <section className="card">
              <h2 className="agent-section-title">Audio</h2>
              <audio className="agent-audio" controls src={audioSrc} preload="metadata" />
              <p className="muted agent-audio-hint">
                <a href={audioSrc} download="podcast.mp3" target="_blank" rel="noreferrer">
                  Download MP3
                </a>
              </p>
            </section>
          ) : null}

          <section className="card">
            <h2 className="agent-section-title">Plan</h2>
            <div className="agent-markdown">
              <ReactMarkdown>{data.plan}</ReactMarkdown>
            </div>
          </section>

          <section className="card">
            <h2 className="agent-section-title">Script</h2>
            <div className="agent-markdown agent-markdown--script">
              <ReactMarkdown>{data.script}</ReactMarkdown>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
