import React, { useMemo, useState } from "react";
import { Paper } from "../services/api";

export default function PaperTable({ papers }: { papers?: Paper[] }) {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("all");
  const [sort, setSort] = useState<"desc" | "asc">("desc");

  const rows = useMemo(() => {
    const list = papers ?? [];
    return list
      .filter((p) => {
        const matchQuery = p.title.toLowerCase().includes(query.toLowerCase());
        const matchSource = source === "all" || p.source === source;
        return matchQuery && matchSource;
      })
      .sort((a, b) =>
        sort === "desc" ? b.relevance_score - a.relevance_score : a.relevance_score - b.relevance_score
      );
  }, [papers, query, source, sort]);

  return (
    <div className="card">
      <h3>Ranked Papers</h3>
      <div className="table-toolbar">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by title"
          aria-label="Filter papers by title"
        />
        <select value={source} onChange={(e) => setSource(e.target.value)} aria-label="Filter papers by source">
          <option value="all">All sources</option>
          <option value="openalex">OpenAlex</option>
          <option value="crossref">Crossref</option>
          <option value="arxiv">arXiv</option>
        </select>
        <button type="button" onClick={() => setSort((v) => (v === "desc" ? "asc" : "desc"))}>
          Score: {sort === "desc" ? "High to low" : "Low to high"}
        </button>
      </div>
      {!papers?.length ? (
        <p>No papers yet.</p>
      ) : (
        <div className="table-wrap">
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
              {rows.map((p, i) => (
                <tr key={`${p.id}-${i}`}>
                  <td>
                    <a href={p.url} target="_blank" rel="noreferrer">
                      {p.title}
                    </a>
                  </td>
                  <td>{p.year ?? "-"}</td>
                  <td>{p.citation_count}</td>
                  <td>
                    <span className={`badge source-${p.source}`}>{p.source}</span>
                  </td>
                  <td>
                    <span className="badge score">{p.relevance_score.toFixed(2)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
