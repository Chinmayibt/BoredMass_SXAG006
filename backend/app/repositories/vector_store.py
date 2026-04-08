from __future__ import annotations

from typing import Protocol

import numpy as np


class VectorStore(Protocol):
    def upsert(self, ids: list[str], vectors: np.ndarray, metadata: list[dict]) -> None:
        ...

    def search(self, query_vector: np.ndarray, top_k: int = 10) -> list[tuple[str, float, dict]]:
        ...
