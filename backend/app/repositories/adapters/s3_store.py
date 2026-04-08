from __future__ import annotations

from pathlib import Path
import re

import boto3


class S3ObjectStore:
    def __init__(
        self,
        bucket: str | None,
        region: str,
        endpoint_url: str | None = None,
        access_key_id: str | None = None,
        secret_access_key: str | None = None,
    ) -> None:
        self.bucket = bucket
        self._local_fallback_root = Path("reports/assets")
        self._local_fallback_root.mkdir(parents=True, exist_ok=True)
        self._client = None

        if bucket:
            self._client = boto3.client(
                "s3",
                region_name=region,
                endpoint_url=endpoint_url,
                aws_access_key_id=access_key_id,
                aws_secret_access_key=secret_access_key,
            )

    def _safe_local_key(self, key: str) -> str:
        # Windows local filesystem fallback cannot store path segments with reserved characters.
        parts = [p for p in key.replace("\\", "/").split("/") if p]
        safe_parts = [re.sub(r'[<>:"/\\|?*]', "_", part) for part in parts]
        return "/".join(safe_parts) if safe_parts else "asset.bin"

    def put_bytes(self, key: str, data: bytes, content_type: str = "application/octet-stream") -> str:
        if self._client and self.bucket:
            self._client.put_object(Bucket=self.bucket, Key=key, Body=data, ContentType=content_type)
            return f"s3://{self.bucket}/{key}"
        out = self._local_fallback_root / self._safe_local_key(key)
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_bytes(data)
        return str(out)

    def put_text(self, key: str, text: str, content_type: str = "text/plain") -> str:
        return self.put_bytes(key, text.encode("utf-8"), content_type=content_type)
