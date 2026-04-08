import { useCallback, useRef, useState } from "react";
import { fetchPipelineResult, PipelineEvent, RunResearchResponse, runResearch } from "../services/api";

const REPORTS_KEY = "researchReports";

function persistReportMeta(jobId: string, topic: string) {
  try {
    const prev = JSON.parse(window.localStorage.getItem(REPORTS_KEY) ?? "[]") as Array<{
      jobId: string;
      topic: string;
      finishedAt: string;
    }>;
    window.localStorage.setItem(
      REPORTS_KEY,
      JSON.stringify([{ jobId, topic, finishedAt: new Date().toISOString() }, ...prev].slice(0, 40))
    );
  } catch {
    /* ignore quota */
  }
}

export function useResearchRun(initialTopic = "") {
  const [topic, setTopic] = useState(initialTopic);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<RunResearchResponse | null>(null);
  const [events, setEvents] = useState<PipelineEvent[]>([]);
  const [stage, setStage] = useState("idle");
  const [sourcesAnalyzed, setSourcesAnalyzed] = useState(0);
  const [confidence, setConfidence] = useState("n/a");
  const abortRef = useRef<AbortController | null>(null);

  const resetRunState = useCallback(() => {
    setEvents([]);
    setStage("queued");
    setSourcesAnalyzed(0);
    setConfidence("n/a");
    setError("");
  }, []);

  const submit = useCallback(async () => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setLoading(true);
    resetRunState();
    try {
      const result = await runResearch(
        { topic },
        {
          signal: ac.signal,
          onEvent: (evt) => {
            setEvents((prev) => [...prev, evt]);
            setStage(evt.stage || "running");
            const sourceCount = Number(evt.meta?.sources_analyzed);
            if (!Number.isNaN(sourceCount) && sourceCount > 0) {
              setSourcesAnalyzed(sourceCount);
            }
          },
          onProgress: (progress) => {
            if (progress.stage) setStage(progress.stage);
            if (progress.sources_analyzed) setSourcesAnalyzed(Number(progress.sources_analyzed) || 0);
            if (progress.confidence) setConfidence(progress.confidence);
          },
        }
      );
      setData(result);
      setStage("completed");
      setSourcesAnalyzed(result.papers.length);
      persistReportMeta(result.job_id, result.topic);
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === "AbortError") {
        setStage("idle");
      } else {
        setError(e instanceof Error ? e.message : "Failed to run research");
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }, [topic, resetRunState]);

  const hydrateFromResult = useCallback((result: RunResearchResponse) => {
    setData(result);
    setTopic(result.topic);
    setStage("completed");
    setSourcesAnalyzed(result.papers.length);
    setEvents([]);
    setError("");
  }, []);

  const loadJob = useCallback(
    async (jobId: string) => {
      setLoading(true);
      setError("");
      try {
        const result = await fetchPipelineResult(jobId);
        hydrateFromResult(result);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load saved run");
      } finally {
        setLoading(false);
      }
    },
    [hydrateFromResult]
  );

  return {
    topic,
    setTopic,
    loading,
    error,
    data,
    setData,
    events,
    stage,
    sourcesAnalyzed,
    confidence,
    submit,
    hydrateFromResult,
    loadJob,
  };
}
