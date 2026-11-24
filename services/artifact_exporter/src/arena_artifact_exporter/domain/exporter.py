"""Standalone Secret-free Project Exporter (F5.4, ADR-009, GP §13.10)."""

from typing import Any
from arena_kernel.errors import ArenaError


class ArtifactExporter:
    """Exports winning candidate pipeline as an independent, standalone codebase without secrets."""

    def export_project(
        self,
        framework_id: str,
        pipeline_code: str,
        project_name: str = "exported-agent",
    ) -> dict[str, str]:
        """Generate standalone files dictionary."""
        # Security hygiene check: ensure NO secret or master key leaked into export (ADR-009)
        if "sk-" in pipeline_code or "ARENA_MASTER_KEY" in pipeline_code:
            raise ArenaError(
                code="EXPORT_SECRET_DETECTED",
                message="Export blocked: candidate source code contains hardcoded secrets",
                retryable=False,
            )

        readme_content = f"""# {project_name}

Bu proje **Agentic Arena** tarafından {framework_id} framework'ü kullanılarak bağımsız olarak üretilmiştir.
Platformdan bağımsız, harici bir API anahtarı ile doğrudan çalıştırılabilir.

## Kurulum ve Çalıştırma

```bash
docker build -t {project_name} .
docker run -e OPENAI_API_KEY="your-key" {project_name}
```
"""

        dockerfile_content = f"""FROM python:3.12-slim
WORKDIR /app
COPY pyproject.toml main.py ./
RUN pip install --no-cache-dir {framework_id}
CMD ["python", "main.py"]
"""

        pyproject_content = f"""[project]
name = "{project_name}"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = [
    "{framework_id}",
]
"""

        return {
            "README.md": readme_content,
            "Dockerfile": dockerfile_content,
            "pyproject.toml": pyproject_content,
            "main.py": pipeline_code,
        }
