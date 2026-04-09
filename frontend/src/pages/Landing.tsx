import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, LayoutDashboard, MessageSquare, Map, Mic, FileText } from "lucide-react";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function Landing() {
  useDocumentTitle("Mantis");

  return (
    <div className="landing">
      <header className="landing-header">
        <div className="landing-header-inner">
          <span className="landing-logo-mark">M</span>
          <span className="landing-logo-text">Mantis</span>
          <Link to="/workspace" className="landing-header-cta button-link">
            Open workspace
          </Link>
        </div>
      </header>

      <main className="landing-main">
        <section className="landing-hero">
          <p className="landing-eyebrow">Research intelligence</p>
          <h1 className="landing-title">From topic to insight, faster</h1>
          <p className="landing-lead">
            Mantis runs autonomous literature discovery, builds evidence maps, and ships agent tools for debate, learning
            roadmaps, and podcasts—all from your browser.
          </p>
          <div className="landing-actions">
            <Link to="/workspace" className="primary landing-primary">
              Start researching
              <ArrowRight size={18} aria-hidden className="landing-primary-icon" />
            </Link>
            <Link to="/reports" className="button-ghost landing-secondary">
              View reports
            </Link>
          </div>
        </section>

        <section className="landing-features" aria-labelledby="landing-features-heading">
          <h2 id="landing-features-heading" className="landing-features-title">
            What you can do
          </h2>
          <ul className="landing-feature-grid">
            <li className="landing-feature-card">
              <LayoutDashboard className="landing-feature-icon" size={24} strokeWidth={1.75} aria-hidden />
              <h3>Workspace</h3>
              <p className="muted">Run a topic through the full pipeline: sources, graph, and exportable report.</p>
              <Link to="/workspace" className="landing-feature-link">
                Go to workspace
              </Link>
            </li>
            <li className="landing-feature-card">
              <MessageSquare className="landing-feature-icon" size={24} strokeWidth={1.75} aria-hidden />
              <h3>Debate agent</h3>
              <p className="muted">Pit two PDFs against each other with structured rounds and a neutral verdict.</p>
              <Link to="/debate" className="landing-feature-link">
                Open debate
              </Link>
            </li>
            <li className="landing-feature-card">
              <Map className="landing-feature-icon" size={24} strokeWidth={1.75} aria-hidden />
              <h3>Roadmap agent</h3>
              <p className="muted">Turn papers into a grounded learning path for any topic you choose.</p>
              <Link to="/roadmap" className="landing-feature-link">
                Build roadmap
              </Link>
            </li>
            <li className="landing-feature-card">
              <Mic className="landing-feature-icon" size={24} strokeWidth={1.75} aria-hidden />
              <h3>Podcast agent</h3>
              <p className="muted">Generate a short audio episode from a single research PDF.</p>
              <Link to="/podcast" className="landing-feature-link">
                Create podcast
              </Link>
            </li>
            <li className="landing-feature-card">
              <FileText className="landing-feature-icon" size={24} strokeWidth={1.75} aria-hidden />
              <h3>Reports</h3>
              <p className="muted">Reopen saved runs on this device and download PDFs.</p>
              <Link to="/reports" className="landing-feature-link">
                Browse reports
              </Link>
            </li>
          </ul>
        </section>
      </main>

      <footer className="landing-footer">
        <p className="muted">
          <Link to="/settings">Settings</Link>
          <span className="landing-footer-sep"> · </span>
          <span>Mantis</span>
        </p>
      </footer>
    </div>
  );
}
