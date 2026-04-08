import React from "react";
import { RESEARCH_AGENT_BASE } from "../services/researchAgentApi";

function normalizeApiBase(u: string): string {
  return u.replace(/\/$/, "");
}

export default function Settings() {
  const apiBase = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";
  const researchRaw = import.meta.env.VITE_RESEARCH_AGENT_BASE;

  const mainResolved = normalizeApiBase(String(apiBase));
  const agentResolved = normalizeApiBase(String(RESEARCH_AGENT_BASE));
  const agentCollidesWithMain =
    researchRaw !== undefined &&
    researchRaw !== "" &&
    mainResolved === agentResolved;

  return (
    <main className="workspace page-secondary">
      <header className="page-header">
        <h1>Settings</h1>
        <p className="muted">Backend configuration uses environment variables; nothing sensitive is stored in the browser.</p>
      </header>

      {agentCollidesWithMain ? (
        <section className="card agent-alert settings-config-warning" role="alert">
          <p className="agent-alert-title">Research agents URL matches main API</p>
          <p className="muted settings-config-warning-body">
            <code>VITE_RESEARCH_AGENT_BASE</code> resolves to the same base as <code>VITE_API_BASE</code>. Debate, Roadmap, and
            Podcast call the <strong>research_agent</strong> server (typically port <code>8001</code>), not the main{" "}
            <code>backend/</code> app. Set <code>VITE_RESEARCH_AGENT_BASE=http://localhost:8001</code> or remove the override
            so the default applies. See <code>frontend/.env.example</code>.
          </p>
        </section>
      ) : null}

      <section className="card card--elevated">
        <p className="muted">Main ScholAR API (build-time)</p>
        <p>
          <code className="settings-code">{String(apiBase)}</code>
        </p>
        <p className="muted">Set via <code>VITE_API_BASE</code> (e.g. <code>http://localhost:8000</code>).</p>

        <h2 className="settings-heading">Research agents API</h2>
        <p>
          <code className="settings-code">{RESEARCH_AGENT_BASE}</code>
        </p>
        <p className="muted">
          Set via <code>VITE_RESEARCH_AGENT_BASE</code>. Default is <code>http://localhost:8001</code> if unset. For Vite dev
          proxy, use <code>VITE_RESEARCH_AGENT_BASE=/research-agent</code> (see <code>vite.config.ts</code>).
        </p>

        <h2 className="settings-heading">Environment variables</h2>
        <ul className="settings-list">
          <li>
            <code>OPENROUTER_API_KEY</code>, <code>GROQ_API_KEY</code>
          </li>
          <li>
            <code>DEFAULT_MAX_PAPERS</code>, <code>DEFAULT_MAX_ITERATIONS</code>
          </li>
          <li>
            <code>OPENALEX_EMAIL</code>, <code>CROSSREF_MAILTO</code>
          </li>
          <li>
            Research agent server: <code>GROQ_API_KEY</code> (debate/roadmap), Ollama on <code>localhost:11434</code> (podcast),
            optional <code>RESEARCH_AGENT_CORS_ORIGINS</code> (comma-separated) for CORS.
          </li>
          {researchRaw !== undefined && researchRaw !== "" ? (
            <li>
              Frontend override active: <code>VITE_RESEARCH_AGENT_BASE={String(researchRaw)}</code>
            </li>
          ) : null}
        </ul>
      </section>
    </main>
  );
}
