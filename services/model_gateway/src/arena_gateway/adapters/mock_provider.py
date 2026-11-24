"""Mock Provider Adapter for deterministic testing without external API calls (F1.5, GP §18.4)."""

from typing import Any, AsyncIterator
from arena_contracts import CapabilityStatus, UsageRecord, UsageSource
from arena_kernel.ids import generate_id


class MockProvider:
    """Deterministic mock provider with known token usage and responses."""

    def __init__(self, model_id: str = "mock-agent-model") -> None:
        self.model_id = model_id

    async def probe(self) -> dict[str, CapabilityStatus]:
        """Return verified capability set for mock provider."""
        return {
            "tool_calling": CapabilityStatus.VERIFIED,
            "streaming": CapabilityStatus.VERIFIED,
            "structured_output": CapabilityStatus.VERIFIED,
            "usage_reporting": CapabilityStatus.VERIFIED,
        }

    async def complete(
        self,
        messages: list[dict[str, str]],
        temperature: float = 0.2,
        max_tokens: int = 4096,
    ) -> dict[str, Any]:
        """Simulate single completion with deterministic token counts."""
        prompt_text = "".join(m.get("content", "") for m in messages)
        prompt_tokens = max(10, len(prompt_text.split()))
        completion_tokens = 25
        total_tokens = prompt_tokens + completion_tokens

        usage = UsageRecord(
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            total_tokens=total_tokens,
            reasoning_tokens=5,  # Sub-category
            cached_prompt_tokens=0,
            usage_source=UsageSource.PROVIDER_REPORTED,
        )

        return {
            "id": generate_id("mock_resp"),
            "model": self.model_id,
            "choices": [
                {
                    "message": {
                        "role": "assistant",
                        "content": "Analiz tamamlandı. Çelişkiler tespit edildi.",
                    },
                    "finish_reason": "stop",
                }
            ],
            "usage": usage,
        }
