from typing import Iterable

import numpy as np
from sentence_transformers import SentenceTransformer

_model: SentenceTransformer | None = None


def get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        _model = SentenceTransformer("BAAI/bge-small-en-v1.5")
    return _model


def encode_texts(texts: Iterable[str]) -> np.ndarray:
    model = get_model()
    vectors = model.encode(list(texts), normalize_embeddings=True, show_progress_bar=False)
    return np.array(vectors)
