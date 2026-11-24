# ADR 0015: Secret şifreleme (AES-256-GCM, yerel master key)

## Durum
Accepted

## Bağlam
Kullanıcının girdiği LLM API anahtarları veritabanında düz metin (plaintext) olarak saklanmamalı ve container loglarına sızmamalıdır.

## Karar
Tüm credential'lar AES-256-GCM ile şifrelenerek saklanır. Şifreleme anahtarı dosya sisteminde 0600 izinleriyle tutulan `ARENA_MASTER_KEY` üzerinden türetilir. Secret yalnızca Model Gateway süreci tarafından bellekte çözülür; hiçbir zaman iş kuyruğuna, aday koduna veya worker container'ına gönderilmez.

## Sonuçlar
- **Olumlu:** Sızma durumunda API anahtarları güvendedir.
- **Olumsuz:** Master key kaybında kayıtlı anahtarlar çözülemez, yeniden girilmelidir.
