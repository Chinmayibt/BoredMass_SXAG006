/** Produce a short readable label from a long academic title (show in graph nodes). */
export function shortTitle(full: string, maxLen = 36): string {
  if (!full) return "";
  let t = full.trim();
  const lower = full.toLowerCase();
  for (const phrase of [
    "a comprehensive review of",
    "a systematic review of",
    "a survey of",
    "survey of",
    "review of",
    "towards ",
    "an overview of",
  ]) {
    if (lower.includes(phrase)) {
      const i = lower.indexOf(phrase);
      t = full.slice(i + phrase.length).trim();
      break;
    }
  }
  const colon = t.indexOf(":");
  if (colon > 8 && colon < 60) {
    t = t.slice(0, colon).trim();
  }
  t = t.replace(/\s+/g, " ");
  if (t.length <= maxLen) return t;
  const cut = t.slice(0, maxLen - 1);
  const lastSpace = cut.lastIndexOf(" ");
  if (lastSpace > 18) return `${cut.slice(0, lastSpace)}…`;
  return `${cut}…`;
}
