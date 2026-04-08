from __future__ import annotations

import json
from pathlib import Path

import faiss
import numpy as np


class FaissVectorStore:
    def __init__(self, index_path: str, metadata_path: str) -> None:
        self.index_path = Path(index_path)
        self.metadata_path = Path(metadata_path)
        self.index_path.parent.mkdir(parents=True, exist_ok=True)
        self.metadata_path.parent.mkdir(parents=True, exist_ok=True)
        self._ids: list[str] = []
        self._meta: list[dict] = []
        self._index: faiss.IndexFlatIP | None = None
        self._load()

    def _load(self) -> None:
        if self.index_path.exists():
            self._index = faiss.read_index(str(self.index_path))
        if self.metadata_path.exists():
            raw = json.loads(self.metadata_path.read_text(encoding="utf-8"))
            self._ids = raw.get("ids", [])
            self._meta = raw.get("meta", [])

    def _save(self) -> None:
        if self._index is not None:
            faiss.write_index(self._index, str(self.index_path))
        self.metadata_path.write_text(json.dumps({"ids": self._ids, "meta": self._meta}), encoding="utf-8")

    def upsert(self, ids: list[str], vectors: np.ndarray, metadata: list[dict]) -> None:
        if vectors.size == 0:
            return
        vectors = vectors.astype(np.float32)
        if self._index is None:
            self._index = faiss.IndexFlatIP(vectors.shape[1])
        self._index.add(vectors)
        self._ids.extend(ids)
        self._meta.extend(metadata)
        self._save()

    def search(self, query_vector: np.ndarray, top_k: int = 10) -> list[tuple[str, float, dict]]:
        if self._index is None or not self._ids:
            return []
        q = query_vector.astype(np.float32).reshape(1, -1)
        scores, idxs = self._index.search(q, top_k)
        out: list[tuple[str, float, dict]] = []
        for score, idx in zip(scores[0], idxs[0]):
            if idx < 0 or idx >= len(self._ids):
                continue
            out.append((self._ids[idx], float(score), self._meta[idx]))
        return out
