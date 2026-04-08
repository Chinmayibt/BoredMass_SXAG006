export type RunRequest = {
  topic: string;
  max_papers: number;
  max_iterations: number;
};

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";

export async function runResearch(payload: RunRequest) {
  const res = await fetch(`${API_BASE}/research/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json();
}

export function reportUrl(jobId: string) {
  return `${API_BASE}/research/report/${jobId}.pdf`;
}
