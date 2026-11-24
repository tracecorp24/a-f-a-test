# ADR 0010: KOVAN opsiyonel plugin, çekirdek bağımlılığı değil

## Durum
Accepted

## Bağlam
Kurumsal orkestrasyon veya özel test ortamları (KOVAN gibi) çekirdek sistem mimarisini kısıtlamamalıdır.

## Karar
KOVAN entegrasyonu çekirdek platformun içinde bir ön koşul değil, F8 fazında harici bir plugin adaptörü olarak konumlandırılır. Çekirdek sistem bağımsız olarak çalışır.

## Sonuçlar
- **Olumlu:** Çekirdek sistem hafif ve genel kullanıma uygun kalır.
- **Olumsuz:** İleri entegrasyonlar plugin arayüzü bekler.
