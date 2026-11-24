"""Unit tests for Shared Tool SDK."""

import pytest
from arena_contracts import ToolContract
from arena_kernel.errors import ArenaError
from arena_tool_sdk.wrapper import SharedToolWrapper


def dummy_executor(name: str, args: dict) -> dict:
    return {"status": "ok", "executed": name, "args": args}


def test_shared_tool_sdk_conversion() -> None:
    contract = ToolContract(
        name="read_document",
        version="1",
        description="Read an approved document by ID",
        input_schema={
            "type": "object",
            "properties": {"document_id": {"type": "string"}},
            "required": ["document_id"],
        },
        permission="dataset_read",
        timeout_ms=5000,
    )

    wrapper = SharedToolWrapper(contract, dummy_executor)
    openai_tool = wrapper.to_openai_tool()

    assert openai_tool["type"] == "function"
    assert openai_tool["function"]["name"] == "read_document"
    assert "document_id" in openai_tool["function"]["parameters"]["required"]


def test_shared_tool_sdk_execution() -> None:
    contract = ToolContract(
        name="find_evidence",
        version="1",
        description="Search for evidence",
        input_schema={
            "type": "object",
            "properties": {"query": {"type": "string"}},
            "required": ["query"],
        },
        permission="dataset_read",
        timeout_ms=5000,
    )
    wrapper = SharedToolWrapper(contract, dummy_executor)

    # Missing required argument raises ArenaError
    with pytest.raises(ArenaError) as exc_info:
        wrapper.execute(wrong_param="value")
    assert exc_info.value.code == "TOOL_ARGUMENT_MISSING"

    # Valid arguments execute
    res = wrapper.execute(query="delivery date")
    assert res["status"] == "ok"
    assert res["args"]["query"] == "delivery date"
