"""Agentic Arena Command Line Interface (CLI) application."""

from pathlib import Path
import sys
import click
import yaml
from arena_contracts import TaskSpec


@click.group()
@click.version_option(version="0.1.0")
def cli() -> None:
    """Agentic Arena CLI: One task. One model. Ten frameworks. Measurable results."""
    pass


@cli.command("frameworks")
def list_frameworks() -> None:
    """List all registered agent frameworks and their status."""
    catalog_path = Path("registry/framework-catalog.yaml")
    if not catalog_path.exists():
        click.echo("Error: Framework catalog not found.")
        sys.exit(1)

    with open(catalog_path, encoding="utf-8") as f:
        data = yaml.safe_load(f)

    click.echo(f"{'ID':<18} {'NAME':<24} {'RUNTIME':<12} {'PARADIGM':<28} {'STATUS'}")
    click.echo("-" * 92)
    for fw in data.get("frameworks", []):
        click.echo(
            f"{fw['id']:<18} {fw['name']:<24} {fw['runtime']:<12} {fw['paradigm']:<28} {fw['status']}"
        )


@cli.command("validate-spec")
@click.argument("spec_path", type=click.Path(exists=True))
def validate_spec(spec_path: str) -> None:
    """Validate a TaskSpec YAML file against schema and security policies."""
    with open(spec_path, encoding="utf-8") as f:
        raw_data = yaml.safe_load(f)

    try:
        spec = TaskSpec(**raw_data)
        click.echo(click.style(f"✓ TaskSpec valid for project: '{spec.project_id}'", fg="green"))
        click.echo(f"  Revision: {spec.revision}")
        click.echo(f"  Frameworks: {', '.join(spec.frameworks)}")
        click.echo(f"  Comparison mode: {spec.comparison_mode}")
    except Exception as e:
        click.echo(click.style(f"✗ TaskSpec validation failed: {e}", fg="red"))
        sys.exit(1)


if __name__ == "__main__":
    cli()
