from typing import Iterable
from threading import Lock

import numpy as np
from sentence_transformers import SentenceTransformer

_model: SentenceTransformer | None = None
_model_lock = Lock()


def get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        with _model_lock:
            if _model is None:
                _model = SentenceTransformer("BAAI/bge-small-en-v1.5")
    return _model


def encode_texts(texts: Iterable[str]) -> np.ndarray:
    model = get_model()
    vectors = model.encode(list(texts), normalize_embeddings=True, show_progress_bar=False)
    return np.array(vectors)


def warmup_embeddings_model() -> None:
    # Force one-time model load during startup instead of first request.
    get_model()
