/** HTTP client for the research_agent FastAPI app only (not backend/). Default base: http://localhost:8001 */
const rawBase = import.meta.env.VITE_RESEARCH_AGENT_BASE;
const RESEARCH_AGENT_BASE =
  rawBase !== undefined && rawBase !== ""
    ? String(rawBase).replace(/\/$/, "")
    : "http://localhost:8001";

function researchUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${RESEARCH_AGENT_BASE}${p}`;
}

export type DebateResponse = {
  round_1: { A: string; B: string };
  round_2: { A_rebuttal: string; B_rebuttal: string };
  final_verdict: string;
  critic: string;
};

export type RoadmapStep = {
  step: number;
  paper_title: string;
  concept_from_paper: string;
  reason: string;
  what_you_learn: string;
};

export type RoadmapSuccess = {
  roadmap: RoadmapStep[];
  critic: string;
};

export type RoadmapError = {
  error: string;
};

export type PodcastSuccess = {
  status: "success";
  plan: string;
  script: string;
  audio_path?: string;
  audio_url?: string;
};

export type PodcastError = {
  status: "error";
  message: string;
};

export type PodcastResponse = PodcastSuccess | PodcastError;

export function podcastAudioSrc(audioUrlPath: string | undefined): string | null {
  if (!audioUrlPath) return null;
  return researchUrl(audioUrlPath);
}

export async function postDebatePdf(fileA: File, fileB: File): Promise<DebateResponse> {
  const form = new FormData();
  form.append("file_A", fileA);
  form.append("file_B", fileB);

  const res = await fetch(researchUrl("/debate-pdf"), {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    throw new Error((await res.text()) || `Debate failed (${res.status})`);
  }

  return res.json() as Promise<DebateResponse>;
}

export async function postRoadmapPdf(topic: string, files: File[]): Promise<RoadmapSuccess | RoadmapError> {
  const form = new FormData();
  form.append("topic", topic);
  for (const f of files) {
    form.append("files", f);
  }

  const res = await fetch(researchUrl("/roadmap-pdf"), {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    throw new Error((await res.text()) || `Roadmap failed (${res.status})`);
  }

  return res.json() as Promise<RoadmapSuccess | RoadmapError>;
}

export async function postGeneratePodcast(file: File): Promise<PodcastResponse> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(researchUrl("/generate-podcast"), {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    throw new Error((await res.text()) || `Podcast failed (${res.status})`);
  }

  return res.json() as Promise<PodcastResponse>;
}

export { RESEARCH_AGENT_BASE };
