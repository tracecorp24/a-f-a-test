# ADR 0012: Postgres tabanlı kalıcı job kuyruğu (SKIP LOCKED)

## Durum
Accepted

## Bağlam
Görevlerin asenkron yürütülmesi, ölçeklenmesi ve kesintilerde iş kaybı yaşanmaması için bir kuyruk mekanizması gerekir. Ekstra bir kuyruk servisi (Redis, RabbitMQ) operasyonel yükü artırır.

## Karar
Job kuyruğu PostgreSQL tablosu üzerinde `FOR UPDATE SKIP LOCKED` mantığı ile çalışan atomik lease mekanizmasıyla inşa edilir. Her iş belirli bir süre için kiralanır; heartbeat ile güncellenir; düşen işler timeout sonrasında havuza geri döner.

## Sonuçlar
- **Olumlu:** Sıfır ek altyapı bağımlılığı; ACID garantisi; transactional iş üretimi.
- **Olumsuz:** Çok yüksek frekansta (saniyede on binlerce job) Redis kadar hızlı değildir, ancak benchmark orkestrasyonu için fazlasıyla yeterlidir.
