# ADR 0011: Worker taşıma protokolü: stdio JSONL (HTTP opsiyonel)

## Durum
Accepted

## Bağlam
Runtime worker container'ı ile control plane arasında hızlı, güvenilir ve çift yönlü bir iletişim kanalı lazımdır.

## Karar
Varsayılan worker iletişim protokolü stdin/stdout üzerinden satır bazlı JSONL akışıdır (stdio JSONL). Bu sayede port dinleme, ağ yapılandırması veya soket karmaşası olmadan container `docker run -i` ile doğrudan kontrol edilir. İleri senaryolarda HTTP ikincil taşıyıcıdır.

## Sonuçlar
- **Olumlu:** Basit, sıfır ağ açığı, port çakışması yok.
- **Olumsuz:** stdout üzerindeki düz metin loglarının JSONL mesajlarıyla karışmaması için yapılandırılmış log protokolü şarttır.
