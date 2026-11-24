# ADR 0001: Framework-independent control plane

## Durum
Accepted

## Bağlam
Agentic Arena, 10 farklı agent framework'ünü eşit koşullarda yarıştırır. Control plane (API, experiment controller, task studio, web) upstream framework'lerin SDK'larına bağımlı olursa sürüm çakışmaları, karmaşık bağımlılık ağaçları ve taraflı mimari oluşur.

## Karar
Control plane (`apps/`, `services/`, `packages/`) altındaki hiçbir kod karşılaştırılan framework'leri import edemez. Framework kodu yalnızca `runtimes/<id>/` içinde ve kendi yalıtılmış container image'ında yaşar. Kural CI'da `import-linter` ile zorlanır.

## Sonuçlar
- **Olumlu:** Sürüm çakışması imkansız hale gelir; control plane hafif ve kararlı kalır; yeni framework eklemek ana koda dokunmaz.
- **Olumsuz:** İletişim süreçler/container'lar arası sözleşmeler (stdio JSONL / HTTP) gerektirir.
