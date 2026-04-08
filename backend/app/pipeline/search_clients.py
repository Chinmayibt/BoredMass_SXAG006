from __future__ import annotations

import asyncio
import re
import xml.etree.ElementTree as ET
from urllib.parse import quote_plus

import httpx

from app.models.pipeline import PaperRecord


def _normalize_text(value: str | None) -> str:
    return re.sub(r"\s+", " ", (value or "")).strip()


def _normalize_doi(value: str | None) -> str | None:
    if not value:
        return None
    doi = _normalize_text(value).lower()
    doi = doi.replace("https://doi.org/", "").replace("http://doi.org/", "").replace("doi:", "")
    return doi or None


def _extract_year(value: str | int | None) -> int | None:
    if value is None:
        return None
    if isinstance(value, int):
        return value
    match = re.search(r"(19|20)\d{2}", _normalize_text(value))
    return int(match.group(0)) if match else None


async def _request_json(client: httpx.AsyncClient, url: str, headers: dict[str, str] | None = None) -> dict:
    for attempt in range(3):
        try:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            return response.json()
        except Exception:
            if attempt == 2:
                raise
            await asyncio.sleep(0.35 * (2**attempt))
    return {}


async def fetch_openalex(query: str, limit: int, mailto: str | None = None, timeout_seconds: int = 15) -> list[PaperRecord]:
    mailto_part = f"&mailto={quote_plus(mailto)}" if mailto else ""
    url = (
        "https://api.openalex.org/works?"
        f"search={quote_plus(query)}&per-page={limit}&select=id,doi,title,abstract_inverted_index,publication_year,"
        f"cited_by_count,authorships,primary_location,concepts{mailto_part}"
    )
    headers = {"User-Agent": f"ScholAR/0.2 ({mailto or 'no-email'})"}
    async with httpx.AsyncClient(timeout=timeout_seconds) as client:
        data = await _request_json(client, url, headers=headers)

    papers: list[PaperRecord] = []
    for item in data.get("results", []):
        inv = item.get("abstract_inverted_index") or {}
        abstract = ""
        if isinstance(inv, dict) and inv:
            pairs: list[tuple[int, str]] = []
            for token, positions in inv.items():
                for pos in positions:
                    pairs.append((int(pos), token))
            abstract = " ".join(token for _, token in sorted(pairs))
        doi = _normalize_doi(item.get("doi"))
        paper_id = doi or _normalize_text(item.get("id")) or f"openalex-{len(papers)}"
        authors = [((a.get("author") or {}).get("display_name") or "").strip() for a in (item.get("authorships") or [])]
        papers.append(
            PaperRecord(
                id=f"openalex:{paper_id}",
                title=_normalize_text(item.get("title")),
                abstract=_normalize_text(abstract),
                year=_extract_year(item.get("publication_year")),
                citation_count=int(item.get("cited_by_count", 0) or 0),
                url=((item.get("primary_location") or {}).get("landing_page_url")) or (f"https://doi.org/{doi}" if doi else ""),
                source="openalex",
                authors=[a for a in authors if a],
                topics=[c.get("display_name", "") for c in (item.get("concepts") or []) if c.get("display_name")],
                doi=doi,
            )
        )
    return papers


async def fetch_crossref(query: str, limit: int, mailto: str | None = None, timeout_seconds: int = 15) -> list[PaperRecord]:
    mailto_part = f"&mailto={quote_plus(mailto)}" if mailto else ""
    url = f"https://api.crossref.org/works?query={quote_plus(query)}&rows={limit}{mailto_part}"
    headers = {"User-Agent": f"ScholAR/0.2 ({mailto or 'no-email'})"}
    async with httpx.AsyncClient(timeout=timeout_seconds) as client:
        data = await _request_json(client, url, headers=headers)

    papers: list[PaperRecord] = []
    for item in ((data.get("message") or {}).get("items")) or []:
        title = _normalize_text(((item.get("title") or [""])[0] if item.get("title") else ""))
        doi = _normalize_doi(item.get("DOI"))
        date_parts = (((item.get("issued") or {}).get("date-parts")) or [[None]])[0]
        year = _extract_year(date_parts[0] if date_parts else None)
        papers.append(
            PaperRecord(
                id=f"crossref:{doi or item.get('URL', '') or len(papers)}",
                title=title,
                abstract=_normalize_text(item.get("abstract")),
                year=year,
                citation_count=int(item.get("is-referenced-by-count", 0) or 0),
                url=_normalize_text(item.get("URL")) or (f"https://doi.org/{doi}" if doi else ""),
                source="crossref",
                authors=[],
                topics=[x for x in (item.get("subject") or []) if x],
                doi=doi,
            )
        )
    return papers


async def fetch_arxiv(query: str, limit: int, timeout_seconds: int = 15) -> list[PaperRecord]:
    url = f"http://export.arxiv.org/api/query?search_query=all:{quote_plus(query)}&start=0&max_results={limit}"
    try:
        async with httpx.AsyncClient(timeout=timeout_seconds) as client:
            response = await client.get(url, headers={"User-Agent": "ScholAR/0.2"})
            response.raise_for_status()
            xml_data = response.text
    except Exception:
        return []

    root = ET.fromstring(xml_data)
    ns = {"a": "http://www.w3.org/2005/Atom"}
    papers: list[PaperRecord] = []
    for entry in root.findall("a:entry", ns):
        arxiv_id = _normalize_text(entry.findtext("a:id", "", ns))
        published = _normalize_text(entry.findtext("a:published", "", ns))
        papers.append(
            PaperRecord(
                id=f"arxiv:{arxiv_id.split('/')[-1]}",
                title=_normalize_text(entry.findtext("a:title", "", ns)),
                abstract=_normalize_text(entry.findtext("a:summary", "", ns)),
                year=int(published[:4]) if len(published) >= 4 and published[:4].isdigit() else None,
                citation_count=0,
                url=arxiv_id,
                source="arxiv",
                authors=[],
                topics=[],
            )
        )
    return papers
