"""Token counting with an open-source BPE tokenizer (tiktoken, MIT license).

OpenAI-compatible providers that do not report usage get *derived* token counts
here instead of the old ``chars/4`` heuristic: tiktoken's ``o200k_base``
encoding (used by gpt-4o-class models) is applied to the exact wire payload.
When tiktoken is unavailable (not installed, or first-use encoding download
blocked), the module degrades gracefully to the heuristic estimate.
"""

import math
import threading

_LOCK = threading.Lock()
_ENCODING: object | None = None
_ENCODING_TRIED = False


def _get_encoding() -> object | None:
    """Lazily load and cache the tiktoken encoding (thread-safe, one attempt)."""
    global _ENCODING, _ENCODING_TRIED
    with _LOCK:
        if not _ENCODING_TRIED:
            _ENCODING_TRIED = True
            try:
                import tiktoken

                _ENCODING = tiktoken.get_encoding("o200k_base")
            except Exception:  # tiktoken missing or encoding cache unavailable
                _ENCODING = None
        return _ENCODING


def count_tokens(text: str) -> int:
    """Count tokens for ``text`` using tiktoken (BPE) with a chars/4 fallback."""
    if not text:
        return 0
    encoding = _get_encoding()
    if encoding is not None:
        try:
            return len(encoding.encode(text, disallowed_special=()))  # type: ignore[attr-defined]
        except Exception:  # defensive: never fail a provider call over counting
            pass
    return max(1, math.ceil(len(text) / 4))


def token_counter_available() -> bool:
    """Whether the BPE tokenizer loaded successfully (False → heuristic fallback)."""
    return _get_encoding() is not None
