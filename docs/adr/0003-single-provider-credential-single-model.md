# ADR 0003: Tek provider credential ve tek model, tüm LLM fazları

## Durum
Accepted

## Bağlam
Farklı adımlarda (kod üretimi, çalıştırma, hakemlik) farklı modeller veya gizli fallback'ler kullanılması sonuçları saptırır ve maliyet/kalite adaletini bozar.

## Karar
Tüm LLM trafiği kullanıcının tanımladığı tek bir API anahtarı ve tek bir model üzerinden yönlendirilir. Kod üretimi, aday çalıştırma ve hakem değerlendirmesinde model fallback'i yasaktır. Gateway dışarıdan gelen model override isteklerini reddeder.

## Sonuçlar
- **Olumlu:** %100 adil ve tekrarlanabilir benchmark; gizli maliyet yok.
- **Olumsuz:** Model sağlayıcı kesintiye uğrarsa pipeline geçici olarak bekler.
