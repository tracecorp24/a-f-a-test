# Changelog

Bu projedeki tüm önemli değişiklikler bu dosyada belgelenir.

Biçim [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) standardına, sürümleme [Semantic Versioning](https://semver.org/spec/v2.0.0.html) kurallarına uyar.

## [Unreleased]

### Added

- **F0 Foundation:** uv/pnpm monorepo iskeleti, ADR 0001–0016, 10 adet JSON Schema sözleşmesi, `arena-kernel` (ULID, clock, errors, hashing, log redaction), `apps/api` (FastAPI app factory, error/correlation middleware), Postgres DB modelleri ve ilk Alembic migration'ı, state machine'ler, lease tabanlı job kuyruğu, `apps/web` kabuğu (10 sayfa rotası), compose core profili ve CI/Security GitHub Actions iş akışları.
- **F1 Single Model Core:** `services/model_gateway` (AES-256-GCM secret store, model kilidi policy motoru, atomik token bütçe yöneticisi, çift sayımı engelleyen usage ledger, MockProvider), `services/tool_broker` (ortak araç broker'ı ve ACL denetimi).
- **F2 Pilot Runtimes:** `packages/worker-sdk/python` (stdio JSONL taşıma protokolü), 10 framework'lük `registry/framework-catalog.yaml`, LangGraph ve Google ADK manifest ve skeleton pipeline'ları, worker conformance test suite'i.
- **F3 Builder & Requirements:** `services/builder` (Clarifier motoru, prompt injection ve güvensiz kod engelleyici Security Watchdog, Coding Harness ve test-and-repair döngüsü).
- **F4-F7 Telemetri, Değerlendirme, Öneri ve Hardening:** `services/telemetry` (idempotent event store), `services/evaluation` (hard gate değerlendirme motoru), `services/recommendation` (ADR-007 hard eligibility kapısı ve ağırlıklı öneri motoru), `services/artifact_exporter` (ADR-009 secret içermeyen bağımsız proje dışa aktarımı).
- Teknik Geliştirme Planı ve faz faz İnşa Planı (`temp-dosyalar/`).
- Repo hijyen dosyaları: README, LICENSE, CONTRIBUTING, SECURITY, CHANGELOG, `.editorconfig`, `.gitattributes`, `.gitignore`.
