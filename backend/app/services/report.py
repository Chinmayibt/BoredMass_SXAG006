import re
from pathlib import Path
from fpdf import FPDF

from app.models.schemas import InsightBundle, Paper


def build_markdown_report(topic: str, papers: list[Paper], insights: InsightBundle, clusters: dict[str, list[str]]) -> str:
    lines = [
        f"# Literature Review: {topic}",
        "",
        "## Introduction",
        f"This report summarizes an autonomous literature analysis run for **{topic}**.",
        "",
        "## Key Themes",
    ]
    for cluster, titles in clusters.items():
        lines.append(f"- **{cluster}**: {', '.join(titles[:3])}")
    lines += ["", "## Important Papers"]
    for kp in insights.key_papers:
        lines.append(f"- [{kp['title']}]({kp['url']}) - {kp['why_important']}")
    lines += ["", "## Trends"]
    lines += [f"- {t}" for t in insights.trends]
    lines += ["", "## Research Gaps"]
    lines += [f"- {g}" for g in insights.gaps]
    lines += ["", "## Future Directions", "- Build stronger contradiction detection with NLI models.", "- Expand to multi-paper comparative dashboards."]
    return "\n".join(lines)


def export_pdf(markdown: str, output_path: Path) -> None:
    unicode_replacements = {
        "\u2010": "-",  # hyphen
        "\u2011": "-",  # non-breaking hyphen
        "\u2012": "-",  # figure dash
        "\u2013": "-",  # en dash
        "\u2014": "-",  # em dash
        "\u2018": "'",
        "\u2019": "'",
        "\u201c": '"',
        "\u201d": '"',
        "\u2026": "...",
        "\u00a0": " ",
    }

    def sanitize_pdf_line(text: str) -> str:
        # Convert markdown links to plain labels to avoid long URL tokens in PDF text flow.
        text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
        text = text.replace("**", "").replace("#", "").replace("`", "")
        for src, target in unicode_replacements.items():
            text = text.replace(src, target)
        # Remove pathological unbroken tokens that can trigger FPDF line-break failures.
        text = re.sub(r"\S{40,}", "[long-token-omitted]", text)
        text = re.sub(r"\s+", " ", text).strip()
        # Core FPDF fonts are latin-1 only; drop unsupported characters safely.
        text = text.encode("latin-1", "ignore").decode("latin-1")
        if len(text) > 500:
            text = text[:500] + "..."
        return text

    output_path.parent.mkdir(parents=True, exist_ok=True)
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=12)
    pdf.add_page()
    pdf.set_font("Arial", size=11)

    def write_line_safe(value: str) -> None:
        # Reset cursor to left margin before every wrapped write.
        pdf.set_x(pdf.l_margin)
        width = max(10, pdf.w - pdf.l_margin - pdf.r_margin)
        try:
            pdf.multi_cell(width, 7, txt=value, new_x="LMARGIN", new_y="NEXT")
        except TypeError:
            pdf.multi_cell(width, 7, txt=value)

    for line in markdown.splitlines():
        text = sanitize_pdf_line(line)
        if not text:
            pdf.ln(4)
            continue
        try:
            write_line_safe(text)
        except Exception:
            fallback = re.sub(r"\S{20,}", "[token]", text)
            fallback = fallback[:300] + ("..." if len(fallback) > 300 else "")
            write_line_safe(fallback or "[omitted]")
    pdf.output(str(output_path))
