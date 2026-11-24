# ADR 0005: Açık gereksinim onayı, serbest alanlar, ayrı güvenlik watchdog'u

## Durum
Accepted

## Bağlam
Belirsiz veya eksik gereksinimlerle pipeline üretimi başarısızlığa ve kaynak israfına yol açar. Güvensiz kullanıcı girdileri prompt injection tehlikesi barındırır.

## Karar
Görev gereksinimleri kullanıcının açık onayı ile TaskSpec olarak kilitlenir. Onaysız inşa yapılamaz. Kullanıcı metinleri ayrı bir güvenlik watchdog'u tarafından denetlenir ve kilitlenen TaskSpec kanonik RFC 8785 hash'i ile mühürlenir.

## Sonuçlar
- **Olumlu:** Tutarlı gereksinimler; onaylanan kapsam dışına çıkılamaz.
- **Olumsuz:** Kullanıcıdan başlangıçta onay adımı gerektirir.
