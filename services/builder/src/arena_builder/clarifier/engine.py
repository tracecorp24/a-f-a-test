"""Task Clarifier Engine resolving ambiguities into structured policy fields (F3.1, GP §5.2)."""

from typing import Any
from arena_contracts import TaskSpec


class ClarifierEngine:
    """Interactively clarifies user task objectives and generates requirement policy fields."""

    def clarify_task(self, objective: str, user_answers: dict[str, str] | None = None) -> dict[str, Any]:
        answers = user_answers or {}
        policy_fields: dict[str, Any] = {
            "output_format": {
                "field": "output_schema",
                "policy": "required" if "schema" in answers else "preferred",
                "value": answers.get("schema", "schemas/default_output.json"),
            },
            "duration": {
                "field": "max_seconds",
                "policy": "required" if "timeout" in answers else "free",
                "value": int(answers["timeout"]) if "timeout" in answers else None,
            },
            "quality_threshold": {
                "field": "min_quality",
                "policy": "required" if "min_score" in answers else "preferred",
                "value": float(answers.get("min_score", 0.85)),
            },
        }

        # Questions for remaining unresolved fields
        questions = []
        if "schema" not in answers:
            questions.append({
                "field": "schema",
                "question": "Çıktı için katı bir JSON Schema gerekli mi?",
                "options": ["Evet, katı şema zorunlu", "Hayır, serbest metin veya markdown yeterli"],
            })
        if "timeout" not in answers:
            questions.append({
                "field": "timeout",
                "question": "Her bir çalışmanın maksimum süresi (saniye) ne olmalıdır?",
                "options": ["300 saniye (5 dk)", "600 saniye (10 dk)", "Serbest (kısıtlama yok)"],
            })

        is_complete = len(questions) == 0
        return {
            "objective": objective,
            "policy_fields": policy_fields,
            "pending_questions": questions,
            "ready_for_approval": is_complete,
        }
