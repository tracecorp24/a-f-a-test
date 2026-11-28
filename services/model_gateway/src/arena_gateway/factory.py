"""Provider factory: builds the right adapter from ``<PREFIX>_`` environment variables.

Supported prefixes: ``ARENA_PROVIDER`` (benchmark gateway) and ``ARENA_DESIGN``
(task design). Transports:

- ``openai`` (default): OpenAI-compatible ``/chat/completions`` endpoint.
- ``opencode``: ivmeX/OpenCode server (HTTP Basic auth; the API key is the
  server password, ``<PREFIX>_MODEL`` selects the model id).
- no key: ``None`` (caller decides the fallback, e.g. the offline MockProvider).
"""

import os

from arena_gateway.adapters.litellm_provider import LiveProviderAdapter
from arena_gateway.adapters.mock_provider import MockProvider
from arena_gateway.adapters.opencode_provider import OpenCodeServerAdapter

Provider = LiveProviderAdapter | OpenCodeServerAdapter | MockProvider


def build_provider(prefix: str, default_model: str = "selected-model") -> Provider | None:
    """Build a provider adapter from environment variables, or ``None`` without a key."""
    api_key = os.environ.get(f"{prefix}_API_KEY", "")
    if not api_key:
        return None
    model_id = os.environ.get(f"{prefix}_MODEL", "")
    if not model_id and prefix == "ARENA_PROVIDER":
        model_id = os.environ.get("ARENA_MODEL_ID", "")  # legacy variable name
    if not model_id:
        model_id = default_model
    base_url = os.environ.get(f"{prefix}_BASE_URL", "https://api.openai.com/v1")
    transport = (os.environ.get(f"{prefix}_TRANSPORT", "") or "openai").strip().lower()
    if transport == "opencode":
        return OpenCodeServerAdapter(
            base_url=base_url,
            username=os.environ.get(f"{prefix}_OPENCODE_USER", "opencode"),
            password=api_key,
            model_id=model_id,
            provider_id=os.environ.get(f"{prefix}_OPENCODE_PROVIDER_ID", model_id),
        )
    return LiveProviderAdapter(base_url=base_url, api_key=api_key, model_id=model_id)
