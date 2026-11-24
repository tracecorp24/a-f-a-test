"""Unit tests for Arena CLI."""

from click.testing import CliRunner
from arena_cli.main import cli


def test_cli_version() -> None:
    runner = CliRunner()
    result = runner.invoke(cli, ["--version"])
    assert result.exit_code == 0
    assert "0.1.0" in result.output


def test_cli_list_frameworks() -> None:
    runner = CliRunner()
    result = runner.invoke(cli, ["frameworks"])
    assert result.exit_code == 0
    assert "langgraph" in result.output
    assert "google-adk" in result.output
    assert "mastra" in result.output


def test_cli_validate_spec() -> None:
    runner = CliRunner()
    spec_path = "benchmarks/tasks/doc-review/task-spec.yaml"
    result = runner.invoke(cli, ["validate-spec", spec_path])
    assert result.exit_code == 0
    assert "TaskSpec valid for project: 'doc-review'" in result.output
