from __future__ import annotations

from typing import Protocol


class GraphStore(Protocol):
    def upsert_papers(self, papers: list[dict]) -> None:
        ...

    def upsert_edges(self, edges: list[dict]) -> None:
        ...
