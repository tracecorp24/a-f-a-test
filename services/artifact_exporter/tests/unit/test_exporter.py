"""Unit tests for standalone secret-free project exporter (ADR-009)."""

import pytest
from arena_artifact_exporter.domain.exporter import ArtifactExporter
from arena_kernel.errors import ArenaError


def test_artifact_exporter_standalone_generation() -> None:
    exporter = ArtifactExporter()
    pipeline_code = """# Clean agent code
def main():
    print('Agent running successfully')
if __name__ == '__main__':
    main()
"""
    files = exporter.export_project("langgraph", pipeline_code, "my-agent")
    assert "Dockerfile" in files
    assert "pyproject.toml" in files
    assert "README.md" in files
    assert "main.py" in files
    assert "langgraph" in files["pyproject.toml"]


def test_artifact_exporter_blocks_secrets() -> None:
    exporter = ArtifactExporter()
    leaked_code = """
API_KEY = "sk-1234567890abcdef1234567890"
"""
    with pytest.raises(ArenaError) as exc_info:
        exporter.export_project("langgraph", leaked_code)
    assert exc_info.value.code == "EXPORT_SECRET_DETECTED"
