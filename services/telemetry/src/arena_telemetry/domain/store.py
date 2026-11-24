"""Telemetry Event Store and Aggregator (F4.1, GP §10.2)."""

from typing import Any
from arena_contracts import ArenaEvent


class TelemetryEventStore:
    """Stores ArenaEvents with deduplication by event_id and aggregates metrics."""

    def __init__(self) -> None:
        self._events: dict[str, ArenaEvent] = {}
        self._run_events: dict[str, list[ArenaEvent]] = {}

    def append_event(self, event: ArenaEvent) -> bool:
        """Idempotently append event. Returns True if inserted, False if duplicate."""
        if event.event_id in self._events:
            return False  # Deduplicated

        self._events[event.event_id] = event
        if event.run_id:
            if event.run_id not in self._run_events:
                self._run_events[event.run_id] = []
            self._run_events[event.run_id].append(event)
        return True

    def get_run_events(self, run_id: str) -> list[ArenaEvent]:
        """Return chronological list of events for a run."""
        events = self._run_events.get(run_id, [])
        return sorted(events, key=lambda e: (e.seq, e.timestamp))
