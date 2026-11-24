# ADR 0004: Runtime izolasyonu ve sürümlü OCI manifest'leri

## Durum
Accepted

## Bağlam
Farklı Python paketleri (örn. LangGraph ve CrewAI) bağımlılık çakışması yaşar ve çalıştırılan aday kodlarının sisteme zarar vermemesi gerekir.

## Karar
Her framework ayrı bir OCI (Docker) container image'ı olarak paketlenir. Image'lar non-root kullanıcı, salt-okunur dosya sistemi ve `internal: true` sandbox ağı ile çalıştırılır. Sürümler `manifest.yaml` dosyasında OCI digest ile sabitlenir.

## Sonuçlar
- **Olumlu:** Bağımlılık çakışması önlenir; güvenlik yalıtımı sağlanır.
- **Olumsuz:** Image boyutu ve build süresi yönetimi gerektirir.
