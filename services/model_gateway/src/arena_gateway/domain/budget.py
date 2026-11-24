"""Token budget reservation and settlement (F1.8, İnşa Planı §5.2)."""

import asyncio
from dataclasses import dataclass
from arena_kernel.errors import BudgetExceededError


@dataclass
class BudgetState:
    limit_tokens: int
    consumed_tokens: int = 0
    reserved_tokens: int = 0


class TokenBudgetManager:
    """Thread-safe and async atomic budget reservation."""

    def __init__(self) -> None:
        self._budgets: dict[str, BudgetState] = {}
        self._lock = asyncio.Lock()

    def set_budget(self, scope_id: str, limit_tokens: int) -> None:
        self._budgets[scope_id] = BudgetState(limit_tokens=limit_tokens)

    async def reserve(self, scope_id: str, requested_tokens: int) -> int:
        """Atomically reserve tokens or raise BudgetExceededError."""
        async with self._lock:
            budget = self._budgets.get(scope_id)
            if not budget:
                # Default fallback budget if not initialized
                budget = BudgetState(limit_tokens=100000)
                self._budgets[scope_id] = budget

            remaining = budget.limit_tokens - budget.consumed_tokens - budget.reserved_tokens
            if requested_tokens > remaining:
                raise BudgetExceededError(
                    resource="tokens",
                    current=budget.consumed_tokens + budget.reserved_tokens + requested_tokens,
                    limit=budget.limit_tokens,
                )

            budget.reserved_tokens += requested_tokens
            return remaining - requested_tokens

    async def settle(self, scope_id: str, reserved_tokens: int, actual_tokens: int) -> None:
        """Settle reservation with actual consumed tokens."""
        async with self._lock:
            budget = self._budgets.get(scope_id)
            if budget:
                budget.reserved_tokens = max(0, budget.reserved_tokens - reserved_tokens)
                budget.consumed_tokens += actual_tokens
