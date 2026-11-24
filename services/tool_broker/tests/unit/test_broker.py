"""Unit tests for Tool Broker permissions and execution."""

import pytest
from arena_kernel.errors import ArenaError
from arena_tool_broker.domain.broker import ToolBroker


@pytest.mark.asyncio
async def test_tool_broker_execution() -> None:
    broker = ToolBroker()

    # 1. read_document execution
    res = await broker.execute_tool("read_document", {"document_id": "doc1"})
    assert res["status"] == "success"
    assert "15 Ocak 2027" in res["result"]["content"]
    assert len(res["result_hash"]) == 64

    # 2. lexical_search execution
    search_res = await broker.execute_tool("lexical_search", {"query": "revize"})
    assert search_res["status"] == "success"
    assert len(search_res["result"]["matches"]) >= 1


@pytest.mark.asyncio
async def test_tool_broker_acl_denied() -> None:
    broker = ToolBroker()

    # Tool not in allowlist
    with pytest.raises(ArenaError) as exc_info:
        await broker.execute_tool(
            "unauthorized_shell",
            {},
            run_allowlist=["read_document"],
        )
    assert exc_info.value.code == "TOOL_PERMISSION_DENIED"
