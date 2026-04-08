import React from "react";

type Paper = {
  title: string;
  year?: number;
  citation_count: number;
  source: string;
  relevance_score: number;
  url: string;
};

export default function PaperTable({ papers }: { papers?: Paper[] }) {
  return (
    <div className="card">
      <h3>Ranked Papers</h3>
      {!papers?.length ? (
        <p>No papers yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Year</th>
              <th>Citations</th>
              <th>Source</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {papers.map((p, i) => (
              <tr key={`${p.title}-${i}`}>
                <td><a href={p.url} target="_blank" rel="noreferrer">{p.title}</a></td>
                <td>{p.year ?? "-"}</td>
                <td>{p.citation_count}</td>
                <td>{p.source}</td>
                <td>{p.relevance_score.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
