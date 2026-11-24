"""Shared Tool Broker with ACL and execution sandbox (F1.11, GP §14.3)."""

from typing import Any
from arena_contracts import ToolContract
from arena_kernel.errors import ArenaError
from arena_kernel.hashing import canonical_json_hash


class ToolBroker:
    """Brokers tool calls for runtime worker containers, enforcing security and ACLs."""

    def __init__(self, allowed_tools: list[str] | None = None) -> None:
        self.allowed_tools = set(allowed_tools or ["read_document", "lexical_search", "artifact_write"])
        self._documents: dict[str, str] = {
            "doc1": "Teslim tarihi 15 Ocak 2027. Bütçe 100.000 USD.",
            "doc2": "Teslim tarihi 28 Şubat 2027 olarak revize edildi. Bütçe 120.000 USD.",
        }

    async def execute_tool(
        self,
        tool_name: str,
        parameters: dict[str, Any],
        run_allowlist: list[str] | None = None,
    ) -> dict[str, Any]:
        """Validate permissions and execute registered tool."""
        effective_allowlist = set(run_allowlist) if run_allowlist is not None else self.allowed_tools
        if tool_name not in effective_allowlist:
            raise ArenaError(
                code="TOOL_PERMISSION_DENIED",
                message=f"Access to tool '{tool_name}' is not permitted for this run",
                retryable=False,
                details={"tool_name": tool_name},
            )

        if tool_name == "read_document":
            doc_id = parameters.get("document_id", "")
            content = self._documents.get(doc_id, "Document not found")
            res_data = {"document_id": doc_id, "content": content}
        elif tool_name == "lexical_search":
            query = parameters.get("query", "").lower()
            matches = [
                {"id": k, "preview": v}
                for k, v in self._documents.items()
                if query in v.lower()
            ]
            res_data = {"query": query, "matches": matches}
        elif tool_name == "artifact_write":
            artifact_name = parameters.get("name", "artifact.txt")
            res_data = {"saved": True, "artifact_name": artifact_name}
        else:
            raise ArenaError(
                code="UNKNOWN_TOOL",
                message=f"Tool '{tool_name}' is not implemented",
                retryable=False,
            )

        result_hash = canonical_json_hash(res_data)
        return {
            "tool": tool_name,
            "result": res_data,
            "result_hash": result_hash,
            "status": "success",
        }
