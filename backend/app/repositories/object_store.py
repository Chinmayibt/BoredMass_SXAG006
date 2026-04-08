from __future__ import annotations

from typing import Protocol


class ObjectStore(Protocol):
    def put_bytes(self, key: str, data: bytes, content_type: str = "application/octet-stream") -> str:
        ...

    def put_text(self, key: str, text: str, content_type: str = "text/plain") -> str:
        ...
