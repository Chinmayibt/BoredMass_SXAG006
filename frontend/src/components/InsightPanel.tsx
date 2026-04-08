import React from "react";

type Props = {
  insights?: {
    trends: string[];
    gaps: string[];
    contradictions: string[];
    key_papers: Array<{ title: string; why_important: string; url: string }>;
  };
};

export default function InsightPanel({ insights }: Props) {
  if (!insights) return <div className="card">Run research to view insights.</div>;

  return (
    <div className="card">
      <h3>Insights</h3>
      <p><strong>Trends</strong></p>
      <ul>{insights.trends.map((x, i) => <li key={`t-${i}`}>{x}</li>)}</ul>
      <p><strong>Research Gaps</strong></p>
      <ul>{insights.gaps.map((x, i) => <li key={`g-${i}`}>{x}</li>)}</ul>
      <p><strong>Key Papers</strong></p>
      <ul>
        {insights.key_papers.map((k, i) => (
          <li key={`k-${i}`}>
            <a href={k.url} target="_blank" rel="noreferrer">{k.title}</a> - {k.why_important}
          </li>
        ))}
      </ul>
      <p><strong>Contradictions (Experimental)</strong></p>
      <ul>{insights.contradictions.map((x, i) => <li key={`c-${i}`}>{x}</li>)}</ul>
    </div>
  );
}
