# ADR 0009: Secret içermeyen bağımsız export

## Durum
Accepted

## Bağlam
Kullanıcı kazanan pipeline'ı kendi bağımsız projesine aktarmak ister.

## Karar
Dışa aktarılan (export) proje dizini hiçbir platform gizli bilgisini (API anahtarı, Arena token'ı) barındırmaz. Standart bir `pyproject.toml` veya `package.json` ile Dockerfile içeren, arena platformuna bağımlı olmadan tek başına çalışan bağımsız bir kod tabanı olarak paketlenir.

## Sonuçlar
- **Olumlu:** Vendor lock-in yoktur; kullanıcı kodu istediği yere deploy edebilir.
- **Olumsuz:** Export üretimi ek paketleme şablonları gerektirir.
