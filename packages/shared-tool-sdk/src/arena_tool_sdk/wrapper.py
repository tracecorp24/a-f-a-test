"""Shared Tool SDK mapping common ToolContract to framework tool primitives (F1.12, GP §14.3)."""

from typing import Any, Callable
from arena_contracts import ToolContract
from arena_kernel.errors import ArenaError


class SharedToolWrapper:
    """Wraps a ToolContract into a callable function tool for agent frameworks."""

    def __init__(self, contract: ToolContract, executor: Callable[[str, dict[str, Any]], Any]) -> None:
        self.contract = contract
        self._executor = executor

    @property
    def name(self) -> str:
        return self.contract.name

    @property
    def description(self) -> str:
        return self.contract.description

    def to_openai_tool(self) -> dict[str, Any]:
        """Convert ToolContract into OpenAI-compatible tool definition."""
        return {
            "type": "function",
            "function": {
                "name": self.contract.name,
                "description": self.contract.description,
                "parameters": self.contract.input_schema,
            },
        }

    def execute(self, **kwargs: Any) -> Any:
        """Validate required arguments and invoke executor."""
        required = self.contract.input_schema.get("required", [])
        for req_field in required:
            if req_field not in kwargs:
                raise ArenaError(
                    code="TOOL_ARGUMENT_MISSING",
                    message=f"Missing required parameter '{req_field}' for tool '{self.contract.name}'",
                    retryable=False,
                )
        return self._executor(self.contract.name, kwargs)
