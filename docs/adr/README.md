# Architecture Decision Records (ADR)

Bu dizin, Agentic Arena projesinde alınan mimari kararları (ADR) içerir. Biçim olarak MADR (Markdown Any Architecture Decision Records) standardı kullanılmıştır.

## ADR Dizini

| No | Başlık | Durum | Kaynak |
|---|---|---|---|
| [0001](0001-framework-independent-control-plane.md) | Framework-independent control plane | Accepted | GP §19.3 |
| [0002](0002-native-pipeline-single-tenant-comparison.md) | Native pipeline tek kullanıcı karşılaştırma politikası | Accepted | GP §19.3 |
| [0003](0003-single-provider-credential-single-model.md) | Tek provider credential ve tek model, tüm LLM fazları | Accepted | GP §19.3 |
| [0004](0004-runtime-isolation-versioned-oci.md) | Runtime izolasyonu ve sürümlü OCI manifest'leri | Accepted | GP §19.3 |
| [0005](0005-explicit-spec-approval-watchdog.md) | Açık gereksinim onayı, serbest alanlar, ayrı güvenlik watchdog'u | Accepted | GP §19.3 |
| [0006](0006-canonical-gateway-usage-ledger.md) | Kanonik gateway usage ledger + OTel/event tabanlı telemetri | Accepted | GP §19.3 |
| [0007](0007-hard-gates-before-weighted-ranking.md) | Kullanıcı ağırlıklı sıralamadan önce hard kabul kapıları | Accepted | GP §19.3 |
| [0008](0008-public-build-tests-private-heldout-eval.md) | Public build testleri / private held-out değerlendirme | Accepted | GP §19.3 |
| [0009](0009-secret-free-standalone-export.md) | Secret içermeyen bağımsız export | Accepted | GP §19.3 |
| [0010](0010-kovan-optional-plugin.md) | KOVAN opsiyonel plugin, çekirdek bağımlılığı değil | Accepted | GP §19.3 |
| [0011](0011-worker-transport-stdio-jsonl.md) | Worker taşıma protokolü: stdio JSONL | Accepted | İnşa Planı F2 |
| [0012](0012-postgres-persistent-job-queue.md) | Postgres tabanlı kalıcı job kuyruğu (SKIP LOCKED) | Accepted | İnşa Planı F0.10 |
| [0013](0013-json-schema-single-source-of-truth.md) | JSON Schema tek doğruluk kaynağı; Py/TS kod üretimi | Accepted | İnşa Planı §1.1 |
| [0014](0014-project-license-mit.md) | Proje lisansı (MIT) | Accepted | İnşa Planı F0.1 |
| [0015](0015-secret-encryption-aes-256-gcm.md) | Secret şifreleme (AES-256-GCM, yerel master key) | Accepted | İnşa Planı F1.1 |
| [0016](0016-modular-monolith-security-boundary-services.md) | Modüler monolit + güvenlik sınırı servisleri | Accepted | İnşa Planı §1.1 |
