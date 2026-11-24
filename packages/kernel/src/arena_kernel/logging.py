"""Structured logging with redaction for sensitive secrets."""

import re
from typing import Any, MutableMapping
import structlog

# Regex patterns matching API keys, tokens and secrets
SECRET_PATTERNS = [
    re.compile(r"sk-[a-zA-Z0-9_-]{20,}", re.IGNORECASE),
    re.compile(r"bearer\s+[a-zA-Z0-9_\-\.]{20,}", re.IGNORECASE),
    re.compile(r"AIzaSy[a-zA-Z0-9_-]{30,40}", re.IGNORECASE),
]


def redact_secrets_processor(
    logger: Any, method_name: str, event_dict: MutableMapping[str, Any]
) -> MutableMapping[str, Any]:
    """Structlog processor that masks sensitive tokens with [REDACTED]."""
    for key, value in list(event_dict.items()):
        if isinstance(value, str):
            redacted = value
            for pattern in SECRET_PATTERNS:
                redacted = pattern.sub("[REDACTED]", redacted)
            event_dict[key] = redacted
    return event_dict


def configure_logging(log_level: str = "INFO") -> None:
    """Configure global structlog formatting and redaction."""
    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.TimeStamper(fmt="iso", utc=True),
            redact_secrets_processor,
            structlog.processors.JSONRenderer(),
        ],
        wrapper_class=structlog.make_filtering_bound_logger(
            getattr(structlog.stdlib, log_level.upper(), 20)
        ),
    )


def get_logger(name: str = "arena") -> structlog.BoundLogger:
    """Get a structured logger instance."""
    return structlog.get_logger(name)
