"""Prefixed ULID and ID generators."""

import secrets
import time

CROCKFORD_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"


def _encode_crockford(value: int, length: int) -> str:
    chars: list[str] = []
    for _ in range(length):
        chars.append(CROCKFORD_ALPHABET[value & 0x1F])
        value >>= 5
    return "".join(reversed(chars))


def generate_ulid() -> str:
    """Generate a 26-character Crockford Base32 ULID string."""
    time_ms = int(time.time() * 1000)
    time_part = _encode_crockford(time_ms, 10)
    rand_int = secrets.randbits(80)
    rand_part = _encode_crockford(rand_int, 16)
    return f"{time_part}{rand_part}"


def generate_id(prefix: str) -> str:
    """Generate a domain resource ID with prefix (e.g. exp_01JDX...)."""
    return f"{prefix}_{generate_ulid()}"
