import React from "react";

export default function Settings() {
  const apiBase = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";

  return (
    <main className="workspace page-secondary">
      <header className="page-header">
        <h1>Settings</h1>
        <p className="muted">Backend configuration uses environment variables; nothing sensitive is stored in the browser.</p>
      </header>
      <section className="card card--elevated">
        <p className="muted">API base (build-time)</p>
        <p>
          <code className="settings-code">{String(apiBase)}</code>
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
        </ul>
      </section>
    </main>
  );
}
