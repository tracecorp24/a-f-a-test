# Changelog

Bu projedeki tüm önemli değişiklikler bu dosyada belgelenir.

Biçim [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) standardına, sürümleme [Semantic Versioning](https://semver.org/spec/v2.0.0.html) kurallarına uyar.

## [Unreleased]

## [0.2.0] - 2026-11-25

### Changed

- **Worker skeleton'ları gerçek LLM'e bağlandı:** 10 framework skeleton'ı (`runtimes/*/skeleton`) LLM adımlarını artık Model Gateway üzerinden gerçek provider'a yürütüyor; `ARENA_PROVIDER_API_KEY` tanımlı değilse deterministik MockProvider'a düşüyor.
- **uv workspace düzeltmeleri:** uv workspace / lockfile hizalama düzeltmeleri (`uv.lock` dahil pyproject yapılandırması).
- **Watchdog / cancel düzeltmeleri:** builder watchdog ve deney iptal akışındaki hatalar giderildi.

### Added

- **Kesin Token Telemetrisi (ADR-0006):** Token değerleri artık tahmin değil, kanonik Model Gateway usage ledger'ından gelir. Yeni `arena_gateway.runtime.ModelGateway` her fiziksel LLM isteğini provider-reported token sayısıyla ledger'a kaydeder; `WorkerProtocol.complete()` işçilerin LLM adımlarını bu gateway üzerinden yürütür ve `model.completion` olayıyla kesin kullanımı akışa yazar. 10 framework skeleton'ı gerçek gateway çağrısı yapacak şekilde güncellendi, `estimate_tokens` sezgisel tahmini kaldırıldı; aday `usage` kaydı artık `prompt_tokens` / `completion_tokens` / `requests` kırılımıyla `provider_reported` kaynağıyla raporlanır. UI etiketleri "tahmin" yerine ledger kaydını gösterir.
- **tiktoken token sayımı:** Usage raporlamayan provider'lar için `arena_gateway.domain.token_counter` modülü eklendi; `chars/4` sezgisel tahmini yerine tiktoken `o200k_base` BPE encoding'i ile tel payload üzerinden türetilmiş token sayımı (tiktoken yoksa sezgisel tahmine yavaş geçiş).
- **OpenCode transport:** `services/model_gateway/src/arena_gateway/adapters/opencode_provider.py`: OpenCode (ivmeX) sunucusunun one-shot generate uç noktası üzerinden HTTP Basic auth ile completion yönlendiren alternatif transport; `ARENA_PROVIDER_TRANSPORT=opencode` ile seçilir, `ARENA_PROVIDER_OPENCODE_USER` ve `ARENA_PROVIDER_OPENCODE_PROVIDER_ID` ile yapılandırılır.

### Added

- **Tek Tıkla Başlatma Betiği (`run_system.bat`):** Windows ortamında tüm kernel, sözleşme, SDK ve servislerin `PYTHONPATH` konfigürasyonunu otomatik ayarlayan, FastAPI API sunucusunu (port 8080) ve Vite Web UI sunucusunu (port 3000) arka planda başlatan ve tarayıcıyı doğrudan `http://localhost:3000` adresine yönlendiren tek tıkla çalıştırma aracı.
- **Şık, Minimalist ve Yüksek Kaliteli Web Arayüzü:** `apps/web`: Planın §13 bölümündeki 10 sekmenin tamamını (`Overview`, `Task Studio`, `Pipeline Designer`, `Framework Hub`, `Development Studio`, `Execution Arena`, `Telemetry Center`, `Evaluation Center`, `Comparison Lab`, `Project & Exporter`) ve referans görsel tasarımlarını (`01-live-pipeline`, `02-agent-communication`, `03-capability-matrix`, `04-recommendation-arena`) içeren, karanlık mod (`#090d12`), interaktif ağırlık kaydırıcıları ve dinamik SVG görselleştirmeleri barındıran tam entegre modern arayüz.
- **Canlı Benchmark Orkestrasyon Demosu:** `scripts/demo_benchmark.py`: TaskSpec onayından 10 framework çalıştırmasına, usage ledger mutabakatından ADR-007 öneri motoru ve ADR-009 secret-free export'a kadar tüm adımları tek komutla terminalde çalıştıran uçtan uca demo.
- **Canlı Model Gateway Provider'ı:** `services/model_gateway/src/arena_gateway/adapters/litellm_provider.py`: Canlı OpenAI/LiteLLM uyumlu LLM uç noktalarıyla konuşan, gecikme ölçen ve token hesaplayan adaptör.
- **Etkileşimli Web Arayüzü:** `apps/web`: Task Studio (interaktif TaskSpec oluşturma ve hash kilitleme), Framework Registry (10 framework doğrulama durumu), Recommendation Arena (canlı ağırlık kaydırıcıları ile sıralama) ve Artifact Exporter (bağımsız proje paketi indirme) ekranları.
- **10 Framework Runtimes & Conformance:** Katalogdaki 10 framework'ün tamamı için manifest ve native skeleton uygulamaları tamamlandı (`langgraph`, `google-adk`, `microsoft-af`, `openai-agents`, `crewai`, `agno`, `pydantic-ai`, `llama-agents`, `smolagents`, `mastra`). 10 framework'ün tümü `tests/contract/worker_conformance` test suite'inden geçti.
- **Shared Tool SDK:** `packages/shared-tool-sdk` (`arena-shared-tool-sdk`): Ortak `ToolContract` tanımlarını OpenAI/FunctionTool primitive'lerine dönüştüren ve ACL doğrulayan sarmalayıcı.
- **Genişletilmiş REST API:** `apps/api`: Framework listesi ve doğrulama (`/v1/frameworks`), onaylı spec ile deney oluşturma, 10 framework için aday üretimi (`/build`), kıyaslama (`/comparison`), kullanıcı ağırlıklı öneri sıralaması (`/rankings`) ve bağımsız export indirme (`/exports`) uç noktaları.
- **Arena CLI:** `apps/cli` (`arena-cli`): `arena --version`, `arena frameworks`, `arena validate-spec` komut satırı arayüzü.
- **F0 Foundation:** uv/pnpm monorepo iskeleti, ADR 0001–0016, 10 adet JSON Schema sözleşmesi, `arena-kernel` (ULID, clock, errors, hashing, log redaction), `apps/api` (FastAPI app factory, error/correlation middleware), Postgres DB modelleri ve ilk Alembic migration'ı, state machine'ler, lease tabanlı job kuyruğu, `apps/web` kabuğu (10 sayfa rotası), compose core profili ve CI/Security GitHub Actions iş akışları.
- **F1 Single Model Core:** `services/model_gateway` (AES-256-GCM secret store, model kilidi policy motoru, atomik token bütçe yöneticisi, çift sayımı engelleyen usage ledger, MockProvider), `services/tool_broker` (ortak araç broker'ı ve ACL denetimi).
- **F2 Pilot Runtimes:** `packages/worker-sdk/python` (stdio JSONL taşıma protokolü), 10 framework'lük `registry/framework-catalog.yaml`, LangGraph ve Google ADK manifest ve skeleton pipeline'ları, worker conformance test suite'i.
- **F3 Builder & Requirements:** `services/builder` (Clarifier motoru, prompt injection ve güvensiz kod engelleyici Security Watchdog, Coding Harness ve test-and-repair döngüsü).
- **F4-F7 Telemetri, Değerlendirme, Öneri ve Hardening:** `services/telemetry` (idempotent event store), `services/evaluation` (hard gate değerlendirme motoru), `services/recommendation` (ADR-007 hard eligibility kapısı ve ağırlıklı öneri motoru), `services/artifact_exporter` (ADR-009 secret içermeyen bağımsız proje dışa aktarımı).
- Teknik Geliştirme Planı ve faz faz İnşa Planı (`docs/plans/`).
- Repo hijyen dosyaları: README, LICENSE, CONTRIBUTING, SECURITY, CHANGELOG, `.editorconfig`, `.gitattributes`, `.gitignore`.
