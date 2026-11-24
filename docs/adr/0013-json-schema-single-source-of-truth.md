# ADR 0013: JSON Schema tek doğruluk kaynağı; Py/TS kod üretimi

## Durum
Accepted

## Bağlam
Python (backend) ve TypeScript (frontend/Mastra worker) arasında veri modelleri elle senkronize edilirse kaçınılmaz olarak uyumsuzluk ve tipler arası sapma doğar.

## Karar
Tüm veri sözleşmeleri (TaskSpec, ArenaEvent, RunSpec, ToolContract vb.) `packages/contracts/schemas/` altında JSON Schema (Draft 2020-12) olarak yazılır. Python Pydantic sınıfları ve TypeScript tipleri bu şemalardan otomatik araçlarla (`datamodel-code-generator`, `json-schema-to-typescript`) üretilir. Elle DTO kopyalamak yasaktır.

## Sonuçlar
- **Olumlu:** Çapraz dil mutlak tip uyumu ve tek doğruluk kaynağı.
- **Olumsuz:** Şema değişikliği sonrası kod üretim adımı gerekir.
