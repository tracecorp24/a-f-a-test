# ADR 0008: Public build testleri / private held-out değerlendirme, immutable candidate

## Durum
Accepted

## Bağlam
Pipeline üretiminde adayların test verisine ezber yapması (overfitting) benchmark sonuçlarını yanıltır.

## Karar
Geliştirme ve onarım döngüsünde yalnızca public test setleri gösterilir. Nihai değerlendirme ve yarışma ise asla builder bağlamına girmeyen gizli (held-out) veri seti ile yapılır. Bir aday oluşturulduktan sonra immutable (değiştirilemez) olarak dondurulur (freeze).

## Sonuçlar
- **Olumlu:** Gerçek genelleme kabiliyeti ve dürüst ölçüm.
- **Olumsuz:** Held-out test verisi için ayrı veri yönetimi gerekir.
