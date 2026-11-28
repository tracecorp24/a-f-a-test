"""Mock Provider Adapter for deterministic testing without external API calls (F1.5, GP §18.4)."""

import json
import re
from typing import Any
from arena_contracts import CapabilityStatus, UsageRecord, UsageSource
from arena_kernel.ids import generate_id

_DATE_RE = re.compile(r"\b\d{1,2}\s+[A-ZÇĞİÖŞÜ][a-zçğıöşü]+\s+\d{4}\b")
_MONEY_RE = re.compile(r"\d[\d.,]*\s*(?:USD|EUR|TRY|TL)\b", re.IGNORECASE)


def _deterministic_conflicts(documents: list[str]) -> list[dict[str, str]]:
    """Rule-based conflict audit over the provided documents (deterministic mock).

    Groups stated values per subject (dates, budget amounts); every subject with
    two or more distinct values becomes one reported conflict. This keeps the
    offline benchmark path meaningful while staying fully deterministic.
    """
    dates = sorted({match.group(0) for text in documents for match in _DATE_RE.finditer(text)})
    amounts = sorted({match.group(0) for text in documents for match in _MONEY_RE.finditer(text)})
    conflicts: list[dict[str, str]] = []
    if len(dates) >= 2:
        conflicts.append({"aspect": "teslim tarihi", "detail": "Tarihler çelişiyor: " + " vs ".join(dates)})
    if len(amounts) >= 2:
        conflicts.append({"aspect": "bütçe", "detail": "Tutarlar çelişiyor: " + " vs ".join(amounts)})
    return conflicts


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
        messages: list[dict[str, Any]],
        temperature: float = 0.2,
        max_tokens: int = 4096,
    ) -> dict[str, Any]:
        """Simulate a completion: conflict-audit steps get a deterministic analysis."""
        user_content = str(messages[-1].get("content", "")) if messages else ""
        documents: list[str] = []
        try:
            payload = json.loads(user_content)
            if isinstance(payload, dict):
                raw_documents = payload.get("documents")
                if isinstance(raw_documents, list):
                    documents = [str(doc) for doc in raw_documents]
                elif isinstance(payload.get("claims"), list):
                    documents = [str(claim.get("claim", "")) for claim in payload["claims"] if isinstance(claim, dict)]
        except ValueError:
            documents = []

        if documents:
            content = json.dumps({"conflicts": _deterministic_conflicts(documents)}, ensure_ascii=False)
        else:
            content = "Analiz tamamlandı. Çelişkiler tespit edildi."

        prompt_text = "".join(str(m.get("content", "")) for m in messages)
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
                        "content": content,
                    },
                    "finish_reason": "stop",
                }
            ],
            "usage": usage,
        }
