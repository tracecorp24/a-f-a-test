# ADR 0006: Kanonik gateway usage ledger + OTel/event tabanlı telemetri

## Durum
Accepted

## Bağlam
Token ve maliyet ölçümlerinin güvenilir olması için tek bir mutabakat noktası gereklidir.

## Karar
Tüm token tüketimi Model Gateway üzerindeki `usage_ledger` tablosunda kanonik olarak kaydedilir. İkincil olarak OpenTelemetry ve olay akışı üzerinden telemetri zenginleştirilir. Raporlama ve bütçe denetiminde tek gerçek kaynak gateway usage ledger'dır.

## Sonuçlar
- **Olumlu:** Manipüle edilemez, kesin ve denetlenebilir tüketim kaydı.
- **Olumsuz:** Gateway süreçlerinin kesintisiz çalışması şarttır.
