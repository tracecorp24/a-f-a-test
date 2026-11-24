# ADR 0007: Kullanıcı ağırlıklı sıralamadan önce hard kabul kapıları

## Durum
Accepted

## Bağlam
Testleri geçemeyen veya bütçe aşan adayların ağırlıklı skorlarla kazanan ilan edilmesi yanıltıcıdır.

## Karar
Değerlendirme iki aşamalıdır: (1) Hard kapılar (tüm kabul testlerinden geçme, bütçe aşmama, güvenlik ihlali yapmama). (2) Hard kapıları geçen adaylar arasında kullanıcının kalite/hız/maliyet ağırlıklarına göre sıralama (soft ranking). Hard kapıyı geçemeyen aday kazanan olamaz.

## Sonuçlar
- **Olumlu:** Çalışmayan veya kural çiğneyen adaylar elenir; güvenilir öneri sağlanır.
- **Olumsuz:** Tüm adaylar elenirse kazanan seçilemez (`NO_ELIGIBLE_CANDIDATES`).
