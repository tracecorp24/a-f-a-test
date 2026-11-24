"""Canonical JSON (RFC 8785 JCS) and SHA-256 hashing."""

import hashlib
import json
from typing import Any


def canonical_json_bytes(obj: Any) -> bytes:
    """Serialize data into deterministic canonical JSON (RFC 8785) bytes."""
    return json.dumps(
        obj,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8")


def canonical_json_hash(obj: Any) -> str:
    """Compute deterministic SHA-256 hex digest of canonical JSON bytes."""
    return hashlib.sha256(canonical_json_bytes(obj)).hexdigest()
