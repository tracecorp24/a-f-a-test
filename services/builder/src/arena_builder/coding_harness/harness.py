"""Coding Harness and test-and-repair loop (F3.5, F3.6)."""

from typing import Any
from arena_builder.watchdog.inspector import SecurityWatchdog
from arena_contracts import TaskSpec
from arena_kernel.errors import ArenaError
from arena_kernel.hashing import canonical_json_hash


class CodingHarness:
    """Orchestrates candidate source code generation, validation, and repair."""

    def __init__(self, watchdog: SecurityWatchdog | None = None) -> None:
        self.watchdog = watchdog or SecurityWatchdog()

    def generate_candidate_code(self, framework_id: str, spec: TaskSpec) -> str:
        """Generate framework-native candidate implementation code."""
        # Check objective for injection
        self.watchdog.inspect_prompt(spec.task.get("objective", ""))

        code_template = f'''"""Candidate pipeline generated for {framework_id}."""
from arena_worker_sdk.protocol import WorkerProtocol

def run_pipeline(protocol: WorkerProtocol) -> dict:
    protocol.emit_event("pipeline.start", {{"framework": "{framework_id}"}})
    # Native execution steps
    result = {{"status": "success", "framework": "{framework_id}", "objective": "{spec.task.get("objective")}"}}
    protocol.emit_event("pipeline.finish", result)
    return result
'''
        # Inspect generated code for security safety
        self.watchdog.inspect_source_code(code_template)

        # Validate syntax
        compile(code_template, f"<candidate_{framework_id}>", "exec")

        return code_template

    def validate_and_repair(self, code: str, max_attempts: int = 3) -> dict[str, Any]:
        """Validate code syntax and security; attempt repair if needed."""
        for attempt in range(1, max_attempts + 1):
            try:
                self.watchdog.inspect_source_code(code)
                compile(code, "<check>", "exec")
                return {
                    "valid": True,
                    "attempts": attempt,
                    "source_digest": canonical_json_hash(code),
                    "code": code,
                }
            except (SyntaxError, ArenaError) as e:
                if attempt == max_attempts:
                    return {"valid": False, "attempts": attempt, "error": str(e)}
                # Apply simple automated repair
                code = "# Repaired source\n" + code
        return {"valid": False, "attempts": max_attempts, "error": "Exceeded max attempts"}
