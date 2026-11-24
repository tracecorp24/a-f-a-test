"""Policy engine enforcing model and connection locks (F1.7, AC03, ADR-003)."""

from arena_kernel.errors import ModelOverrideDeniedError


class PolicyEngine:
    """Enforces immutable single-model and single-connection policies."""

    def __init__(self, locked_model_id: str, locked_connection_ref: str) -> None:
        self.locked_model_id = locked_model_id
        self.locked_connection_ref = locked_connection_ref

    def enforce_model_lock(self, requested_model: str) -> None:
        """Reject model overrides with 403 ModelOverrideDeniedError."""
        if requested_model != self.locked_model_id:
            raise ModelOverrideDeniedError(
                requested_model=requested_model,
                locked_model=self.locked_model_id,
            )

    def enforce_connection_lock(self, connection_ref: str) -> None:
        """Ensure connection matches the single locked connection."""
        if connection_ref != self.locked_connection_ref:
            from arena_kernel.errors import ArenaError
            raise ArenaError(
                code="CONNECTION_OVERRIDE_DENIED",
                message=f"Connection override denied. Requested: '{connection_ref}', Locked: '{self.locked_connection_ref}'",
                retryable=False,
            )
