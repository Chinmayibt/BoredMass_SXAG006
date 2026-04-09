import React from "react";
import { Link } from "react-router-dom";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { reportUrl } from "../services/api";

type StoredReport = {
  jobId: string;
  topic: string;
  finishedAt: string;
};

function readStoredReports(): StoredReport[] {
  const raw = window.localStorage.getItem("researchReports");
  if (!raw) return [];
  try {
    return JSON.parse(raw) as StoredReport[];
  } catch {
    return [];
  }
}

export default function Reports() {
  useDocumentTitle("Mantis · Reports");
  const reports = readStoredReports();

  return (
    <main className="workspace page-secondary">
      <header className="page-header">
        <h1>Reports</h1>
        <p className="muted">Saved runs on this device. Open a run in the workspace or download the PDF.</p>
      </header>
      <section className="card card--elevated">
        {!reports.length ? (
          <p className="muted empty-state">No reports yet. Run a topic from the workspace to create one.</p>
        ) : (
          <ul className="report-list">
            {reports.map((report) => (
              <li key={report.jobId} className="report-item">
                <div>
                  <p className="report-item-title">{report.topic}</p>
                  <p className="muted">{new Date(report.finishedAt).toLocaleString()}</p>
                </div>
                <div className="report-item-actions">
                  <Link
                    className="button-link"
                    to={`/workspace?jobId=${encodeURIComponent(report.jobId)}&tab=overview`}
                  >
                    Open in workspace
                  </Link>
                  <a className="button-link" href={reportUrl(report.jobId)} target="_blank" rel="noreferrer">
                    Download PDF
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
