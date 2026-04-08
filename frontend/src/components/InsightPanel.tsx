import React from "react";
import { Insights } from "../services/api";

type Props = {
  insights?: Insights;
};

export default function InsightPanel({ insights }: Props) {
  if (!insights) {
    return (
      <div className="card">
        <h3>Insights</h3>
        <p className="muted">Run research to view trends, gaps, and key papers.</p>
      </div>
    );
  }

  const sections = [
    { label: "Trends", items: insights.trends },
    { label: "Research gaps", items: insights.gaps },
    { label: "Contradictions", items: insights.contradictions },
  ];

  return (
    <div className="card">
      <h3>Insights</h3>
      <div className="insight-grid">
        {sections.map((section) => (
          <section key={section.label} className="insight-block">
            <h4>{section.label}</h4>
            {!section.items.length ? (
              <p className="muted">No items</p>
            ) : (
              <ul>
                {section.items.map((item, i) => (
                  <li key={`${section.label}-${i}`}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
      <section className="insight-block">
        <h4>Key papers</h4>
        {!insights.key_papers.length ? (
          <p className="muted">No highlighted papers yet.</p>
        ) : (
          <ul>
            {insights.key_papers.map((paper, i) => (
              <li key={`paper-${i}`}>
                <a href={paper.url} target="_blank" rel="noreferrer">
                  {paper.title}
                </a>
                <p className="muted">{paper.why_important}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
