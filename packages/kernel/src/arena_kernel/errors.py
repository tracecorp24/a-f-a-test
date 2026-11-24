"""Domain error hierarchy and catalog codes."""

from typing import Any


class ArenaError(Exception):
    """Base exception for all domain errors."""

    def __init__(
        self,
        code: str,
        message: str,
        retryable: bool = False,
        details: Any = None,
    ) -> None:
        super().__init__(message)
        self.code = code
        self.message = message
        self.retryable = retryable
        self.details = details


class ModelOverrideDeniedError(ArenaError):
    def __init__(self, requested_model: str, locked_model: str) -> None:
        super().__init__(
            code="GATEWAY_MODEL_OVERRIDE_DENIED",
            message=f"Model override denied. Requested: '{requested_model}', Locked: '{locked_model}'",
            retryable=False,
            details={"requested_model": requested_model, "locked_model": locked_model},
        )


class BudgetExceededError(ArenaError):
    def __init__(self, resource: str, current: float | int, limit: float | int) -> None:
        super().__init__(
            code="BUDGET_EXCEEDED",
            message=f"Budget exceeded for {resource}. Current: {current}, Limit: {limit}",
            retryable=False,
            details={"resource": resource, "current": current, "limit": limit},
        )


class IllegalStateTransitionError(ArenaError):
    def __init__(self, current: str, target: str) -> None:
        super().__init__(
            code="ILLEGAL_STATE_TRANSITION",
            message=f"Illegal transition from state '{current}' to '{target}'",
            retryable=False,
            details={"current": current, "target": target},
        )


class SpecNotApprovedError(ArenaError):
    def __init__(self, spec_id: str) -> None:
        super().__init__(
            code="SPEC_NOT_APPROVED",
            message=f"Task specification '{spec_id}' has not been approved by the user",
            retryable=False,
            details={"spec_id": spec_id},
        )


class ResourceNotFoundError(ArenaError):
    def __init__(self, resource_type: str, resource_id: str) -> None:
        super().__init__(
            code="RESOURCE_NOT_FOUND",
            message=f"{resource_type} with id '{resource_id}' was not found",
            retryable=False,
            details={"resource_type": resource_type, "resource_id": resource_id},
        )
