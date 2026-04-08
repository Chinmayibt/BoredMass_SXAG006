import faiss
import numpy as np
from typing import List

from app.podcast_agent.services.embedding_service import get_model


def build_index(embeddings: np.ndarray):
    dim = embeddings.shape[1]
    index = faiss.IndexFlatIP(dim)
    index.add(embeddings)
    return index


def search(query: str, chunks: List[str], index, top_k: int = 4) -> List[str]:
    model = get_model()
    query_embedding = model.encode(
        [query],
        convert_to_numpy=True,
        normalize_embeddings=True,
    )

    scores, indices = index.search(query_embedding, top_k)
    return [chunks[i] for i in indices[0]]
