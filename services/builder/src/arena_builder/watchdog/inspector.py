"""Security Watchdog scanning code and inputs for injections and dangerous constructs (F3.4, GP §16.1)."""

import re
from typing import Any
from arena_kernel.errors import ArenaError

FORBIDDEN_CODE_PATTERNS = [
    re.compile(r"\b(eval|exec)\s*\(", re.IGNORECASE),
    re.compile(r"\b(subprocess|os\.system|pty)\b", re.IGNORECASE),
    re.compile(r"\b(socket|urllib\.request|requests)\b", re.IGNORECASE),
    re.compile(r"\b(__import__|globals\(\)|locals\(\))\b", re.IGNORECASE),
]

INJECTION_PATTERNS = [
    re.compile(r"ignore\s+(all\s+)?previous\s+instructions", re.IGNORECASE),
    re.compile(r"you\s+are\s+now\s+in\s+developer\s+mode", re.IGNORECASE),
    re.compile(r"disregard\s+system\s+prompt", re.IGNORECASE),
]


class SecurityWatchdog:
    """Audits user text prompts and generated pipeline source code for safety."""

    def inspect_prompt(self, text: str) -> None:
        """Scan input text for prompt injection patterns."""
        for pattern in INJECTION_PATTERNS:
            if pattern.search(text):
                raise ArenaError(
                    code="PROMPT_INJECTION_DETECTED",
                    message="Security watchdog detected forbidden prompt injection pattern",
                    retryable=False,
                )

    def inspect_source_code(self, source_code: str) -> None:
        """Scan generated Python code for prohibited system calls or network imports."""
        for pattern in FORBIDDEN_CODE_PATTERNS:
            match = pattern.search(source_code)
            if match:
                raise ArenaError(
                    code="UNSAFE_CODE_DETECTED",
                    message=f"Generated code contains forbidden construct: '{match.group()}'",
                    retryable=False,
                    details={"forbidden_construct": match.group()},
                )
