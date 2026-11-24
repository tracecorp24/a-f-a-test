# Güvenlik Politikası

## Desteklenen sürümler

Proje planlama aşamasındadır; henüz yayımlanmış ve desteklenen bir sürüm yoktur. `v1.0.0` sonrasında destek tablosu burada yayımlanacaktır.

## Güvenlik açığı bildirimi

Güvenlik açıklarını **herkese açık issue olarak bildirmeyin.** Bunun yerine GitHub'ın [private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability) özelliğini kullanın (repo → **Security** → **Report a vulnerability**).

Bildiriminizde şunları paylaşın:

- Etkilenen bileşen (ör. model gateway, tool broker, runtime sandbox).
- Yeniden üretme adımları ve beklenen / gözlenen davranış.
- Olası etki (secret sızıntısı, sandbox kaçışı, değerlendirme manipülasyonu vb.).

## Kapsam

Özellikle şu alanlardaki bulgular önceliklidir (bkz. Teknik Geliştirme Planı §16):

- Üretilen kodun sandbox dışına çıkması veya host / Docker erişimi.
- Provider API anahtarının gateway dışına sızması.
- Gateway model kilidinin atlatılması.
- Held-out değerlendirme verisine builder veya worker erişimi.
- Arşiv importunda path traversal / symlink açıkları.
