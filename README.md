# Agentic Framework Arena

> **One task. One model. Ten frameworks. Measurable results.**

Agentic Framework Arena is an open-source platform that builds independent, native
pipelines for *your own task* on ten agentic frameworks, runs them against the same
model under equal conditions, measures the results, and recommends the best framework
with evidence — not marketing.

## How it works

1. The task is described in natural language (or imported); ambiguities are resolved
   with clarifying questions and locked into an approved task spec.
2. For each framework, an independent worker is generated using that framework's
   native primitives, tested, and frozen.
3. All candidates run with the same model, data, tools, and budget.
4. Quality, latency, tokens, and reliability are measured; candidates that pass the
   hard criteria are ranked with the user's weights.
5. The winning pipeline is exported as a secret-free, platform-independent project.

### Guiding rules

- **Single repo** — upstream framework repos are not cloned into the workspace.
- **One API key, one model** — planning, code generation, all pipelines, and
  evaluation hit the same model; no hidden fallbacks.
- **Native comparison only** — every framework solves the task with its own
  orchestration primitives.
- **No measurement, no claim** — missing or estimated metrics are labeled; a winner
  is never declared without evidence.

## Architecture

```
apps/            User-facing applications
  api/           FastAPI control plane (experiments, runs, rankings, exports)
  web/           React + Vite web UI (10 tabs: Task Studio → Comparison Lab → Export)
  cli/           arena-cli command-line interface
services/        Domain services (pure-Python packages, src layout)
  experiment_controller/  Experiment lifecycle & orchestration
  model_gateway/          Single-provider LLM gateway, budget, usage ledger
  tool_broker/            Shared tool broker with ACL checks
  builder/                Clarifier, security watchdog, coding harness
  telemetry/              Idempotent event store
  evaluation/             Hard-gate evaluation engine
  recommendation/         Weighted, eligibility-gated ranking
  artifact_exporter/      Secret-free standalone project export
packages/        Shared libraries
  kernel/                 arena_kernel: ULID, clock, errors, hashing, log redaction
  contracts/              arena_contracts: schemas, usage records, protocol types
  worker-sdk/             arena_worker_sdk: stdio JSONL WorkerProtocol
  shared-tool-sdk/        arena_tool_sdk: ToolContract wrappers + ACL
runtimes/        One worker skeleton per framework (10 total), each with a manifest
registry/        framework-catalog.yaml (the 10-framework catalog)
```

The control plane never imports framework code; framework code lives only under
`runtimes/<id>/` and talks to the platform exclusively through `WorkerProtocol`.

## Quick start (Windows)

```bat
copy .env.example .env
run_system.bat
```

`run_system.bat` loads `.env`, wires up `PYTHONPATH` for every local package,
starts the API on `http://localhost:8080` and the web UI on
`http://localhost:3000`, then opens the browser.

Key environment variables (see [.env.example](.env.example) for the full list;
put real values in your local `.env`, never in the repo):

- `ARENA_PROVIDER_API_KEY` — benchmark model credential. When set, workers call the
  real model; when empty they run against the deterministic offline mock.
- `ARENA_PROVIDER_TRANSPORT` — `openai` (default) or `opencode`.
- `ARENA_MODEL_ID` — the single model all pipelines share (e.g. `gpt-4o-mini`).
- `ARENA_DESIGN_API_KEY` / `ARENA_DESIGN_MODEL` — optional key for AI-assisted task
  design; falls back to built-in templates when unset.
- `ARENA_STATE_FILE` — control-plane state file (default `./data/arena_state.json`).

### Docker Compose alternative

```bash
docker compose --profile core up -d --build
# API: http://localhost:8000 - Web UI: http://localhost:3000
```

This starts PostgreSQL, the API, the web UI, and an OTel collector. The sandbox
network has zero internet egress (ADR-004).

## Model gateway: transports & token counting

- **OpenAI transport (default):** an OpenAI-compatible `/chat/completions` endpoint.
  Configure with `ARENA_PROVIDER_BASE_URL` and `ARENA_MODEL_ID`.
- **OpenCode transport:** when the platform credential lives inside an
  [OpenCode](https://opencode.ai) server instead of being handed to the arena,
  set `ARENA_PROVIDER_TRANSPORT=opencode` to route completions through the
  server's one-shot generate endpoint with HTTP Basic auth (the API key is the
  server password; optional extras: `ARENA_PROVIDER_OPENCODE_USER`,
  `ARENA_PROVIDER_OPENCODE_PROVIDER_ID`).
- **Exact token usage (ADR-0006):** the canonical usage ledger in the model gateway
  records provider-reported tokens for every physical LLM call — no estimates.
  When a provider does not report usage, tokens are *derived* with
  [tiktoken](https://github.com/openai/tiktoken) (`o200k_base` BPE encoding)
  over the exact wire payload, degrading to a heuristic only if tiktoken is
  unavailable.

## Running tests

PowerShell:

```powershell
$env:PYTHONPATH = "packages\kernel\src;packages\contracts\python\src;packages\worker-sdk\python\src;packages\shared-tool-sdk\src;services\experiment_controller\src;services\model_gateway\src;services\tool_broker\src;services\builder\src;services\telemetry\src;services\evaluation\src;services\recommendation\src;services\artifact_exporter\src;apps\api\src;apps\cli\src"
python -m pytest tests packages services apps -q
```

The `PYTHONPATH` is required because the packages use a `src` layout without a
single editable root install. `run_system.bat` sets the same value for you.

Other useful commands: `make lint` (ruff + mypy), `make format`, `make contracts`
(regenerate Python/TS contracts from JSON Schema).

## Framework catalog

| Framework | Runtime | Native paradigm |
|---|---|---|
| [LangGraph](https://github.com/langchain-ai/langgraph) | Python | State / graph |
| [Google ADK](https://github.com/google/adk-python) | Python | Hierarchical agents / workflow |
| [Microsoft Agent Framework](https://github.com/microsoft/agent-framework) | Python | Agent / executor / workflow |
| [OpenAI Agents SDK](https://github.com/openai/openai-agents-python) | Python | Agent loop / handoff |
| [CrewAI](https://github.com/crewAIInc/crewAI) | Python | Crew / role / task / flow |
| [Agno](https://github.com/agno-agi/agno) | Python | Agent / Team / Workflow |
| [Pydantic AI](https://github.com/pydantic/pydantic-ai) | Python | Typed agent / dependency / graph |
| [LlamaAgents](https://github.com/run-llama/llama-agents) | Python | Event-driven async workflow |
| [Smolagents](https://github.com/huggingface/smolagents) | Python | Code / tool-calling agent |
| [Mastra](https://github.com/mastra-ai/mastra) | TypeScript | Agent / workflow |

## Project documentation

| Document | Contents |
|---|---|
| [Technical Development Plan](docs/plans/gelistirme-plani.md) | Product requirements, architecture, data model, API, telemetry, evaluation, acceptance tests — *what and why* |
| [Build Plan](docs/plans/insa-plani.md) | Phase-by-phase implementation order, work packages, engineering standards, CI/CD — *how and in which order* |
| [Live Test Report](docs/plans/canli-test-raporu.md) | Notes from a live end-to-end run |

## Roadmap

| Phase | Name | Target |
|---|---|---|
| F0 | Foundation — repo, contracts, CI | `v0.1.0` |
| F1 | Single Model Core — gateway, budget, usage ledger | `v0.2.0` |
| F2 | Pilot runtimes — LangGraph + Google ADK | `v0.3.0` |
| F3 | Builder & requirements | `v0.4.0` |
| F4 | Telemetry, evaluation & recommendation | `v0.5.0` |
| F5 | Five-runtime alpha | `v0.6.0` |
| F6 | Ten-runtime beta | `v0.7.0` |
| F7 | Release hardening — first complete release | `v1.0.0` |
| F8 | Plugins | `v1.1.0` |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution rules and
[SECURITY.md](SECURITY.md) for reporting vulnerabilities.

## License

[MIT](LICENSE)
