"""Recommendation and Ranking Engine (F4.7, ADR-007, GP §12)."""

from dataclasses import dataclass
from typing import Any

from arena_kernel.errors import ArenaError


@dataclass
class CandidateBenchmarkData:
    candidate_id: str
    framework_id: str
    is_eligible: bool  # Passed all hard criteria
    quality_score: float  # 0 to 100
    speed_score: float    # 0 to 100
    token_efficiency_score: float  # 0 to 100
    reliability_score: float       # 0 to 100


class RankingEngine:
    """Ranks candidates enforcing hard eligibility gates before weighted scoring."""

    def rank_candidates(
        self,
        candidates: list[CandidateBenchmarkData],
        weights: dict[str, float] | None = None,
    ) -> dict[str, Any]:
        """Rank candidates. Candidates failing hard gates cannot win."""
        w = weights or {"quality": 40.0, "speed": 25.0, "token": 20.0, "reliability": 15.0}
        # Semantic validation (report 03 §4.1): all-zero weights used to crash with
        # ZeroDivisionError -> raw 500; negative weights silently distorted scores;
        # unknown keys inflated the denominator while never contributing to scores.
        w = {key: float(w[key]) for key in ("quality", "speed", "token", "reliability") if key in w}
        if any(v < 0 for v in w.values()):
            raise ArenaError(
                code="RANKING_WEIGHTS_INVALID",
                message="Ağırlıklar negatif olamaz.",
                details={"weights": weights},
            )
        total_w = sum(w.values())
        if total_w <= 0:
            raise ArenaError(
                code="RANKING_WEIGHTS_INVALID",
                message="Ağırlık toplamı sıfır olamaz: en az bir ağırlık pozitif olmalı.",
                details={"weights": weights},
            )

        # Step 1: Eligibility check (ADR-007)
        eligible = [c for c in candidates if c.is_eligible]
        ineligible = [c for c in candidates if not c.is_eligible]

        if not eligible:
            return {
                "status": "NO_ELIGIBLE_CANDIDATES",
                "message": "Hiçbir framework hard kabul kriterlerini geçemedi. Kazanan seçilmedi.",
                "winner": None,
                "ranked": [],
                "ineligible": [c.framework_id for c in ineligible],
            }

        # Step 2: Soft weighted ranking for eligible candidates
        scored_candidates = []
        for c in eligible:
            weighted_score = (
                c.quality_score * w.get("quality", 0)
                + c.speed_score * w.get("speed", 0)
                + c.token_efficiency_score * w.get("token", 0)
                + c.reliability_score * w.get("reliability", 0)
            ) / total_w

            scored_candidates.append({
                "candidate_id": c.candidate_id,
                "framework_id": c.framework_id,
                "total_score": round(weighted_score, 2),
                "breakdown": {
                    "quality": c.quality_score,
                    "speed": c.speed_score,
                    "token": c.token_efficiency_score,
                    "reliability": c.reliability_score,
                },
            })

        scored_candidates.sort(key=lambda x: x["total_score"], reverse=True)

        return {
            "status": "RECOMMENDED",
            "winner": scored_candidates[0]["framework_id"],
            "ranked": scored_candidates,
            "ineligible": [c.framework_id for c in ineligible],
        }
