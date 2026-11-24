# ADR 0016: Modüler monolit + güvenlik sınırı servisleri

## Durum
Accepted

## Bağlam
Tam bir mikroservis mimarisi tek geliştirici veya küçük ekipler için aşırı operasyonel karmaşıklık getirir. Tam bir monolit ise Docker yetkisi ve LLM secret'ları için gereken güvenlik yalıtımını sağlayamaz.

## Karar
Hibrit bir yapı benimsenir: Task Studio, Experiment Controller, Evaluation, Recommendation ve Exporter aynı API sürecinde modüler bir monolit olarak koşar. Ancak güvenlik sınırı gerektiren servisler (Model Gateway - secret yönetimi; Runtime Manager - Docker API erişimi; Tool Broker - korumalı veri erişimi) ayrı süreçler/container'lar olarak izole edilir.

## Sonuçlar
- **Olumlu:** Basit geliştirme ve dağıtım dengesi; asgari saldırı yüzeyi.
- **Olumsuz:** Süreçler arası yapılandırma ve port yönetimi gerekir.
