"""Time and clock port/adapters."""

from datetime import datetime, timezone
import time
from typing import Protocol


class Clock(Protocol):
    """Protocol for abstracting time operations."""

    def now_utc(self) -> datetime:
        """Return the current timezone-aware UTC datetime."""
        ...

    def monotonic(self) -> float:
        """Return monotonic time in seconds."""
        ...


class SystemClock:
    """System real-time clock implementation."""

    def now_utc(self) -> datetime:
        return datetime.now(timezone.utc)

    def monotonic(self) -> float:
        return time.monotonic()


class FrozenClock:
    """Deterministic frozen clock for unit tests."""

    def __init__(self, frozen_time: datetime | None = None, monotonic_start: float = 0.0) -> None:
        self._current_time = frozen_time or datetime(2026, 11, 24, 12, 0, 0, tzinfo=timezone.utc)
        self._monotonic = monotonic_start

    def now_utc(self) -> datetime:
        return self._current_time

    def monotonic(self) -> float:
        return self._monotonic

    def advance(self, seconds: float) -> None:
        from datetime import timedelta
        self._current_time += timedelta(seconds=seconds)
        self._monotonic += seconds
