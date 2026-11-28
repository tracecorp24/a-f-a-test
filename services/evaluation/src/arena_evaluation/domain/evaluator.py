"""Evaluation Engine evaluating hard gates and criteria (F4.5, ADR-007, GP §11)."""

from typing import Any
from arena_contracts import CriterionPolicy, CriterionResult, CriterionStatus, UsageSource


class EvaluationEngine:
    """Evaluates candidate outputs against hard and soft criteria on held-out datasets."""

    def evaluate_criterion(
        self,
        criterion_id: str,
        policy: CriterionPolicy,
        actual_value: float | bool | str | None,
        threshold: float | bool | str | None,
        evaluator_name: str,
    ) -> CriterionResult:
        """Evaluate single criterion enforcing threshold pass/fail conditions."""
        is_passed = True

        if threshold is not None and actual_value is not None:
            if isinstance(threshold, bool) or isinstance(actual_value, bool):
                # bool must be checked before the numeric branch: bool is a subclass
                # of int, so `isinstance(True, (int, float))` is True and the old
                # ordering made the bool branch unreachable (report 03 §3.1).
                is_passed = bool(actual_value) == bool(threshold)
            elif isinstance(threshold, (int, float)) and isinstance(actual_value, (int, float)):
                is_passed = actual_value >= threshold

        status = CriterionStatus.PASSED if is_passed else CriterionStatus.FAILED

        return CriterionResult(
            criterion_id=criterion_id,
            policy=policy,
            value=actual_value,
            threshold=threshold,
            status=status,
            evaluator=evaluator_name,
            sample_count=1,
            confidence=UsageSource.MEASURED,
        )

    def check_hard_gates(self, results: list[CriterionResult]) -> bool:
        """Return True if all 'required' criteria passed. Any failure blocks eligibility."""
        for r in results:
            if r.policy == CriterionPolicy.REQUIRED and r.status != CriterionStatus.PASSED:
                return False
        return True
