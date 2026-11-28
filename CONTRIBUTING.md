# Katkı Rehberi

Agentic Arena'ya katkı verdiğiniz için teşekkürler. Bu dosya kısa kuralları özetler; ayrıntılı mühendislik standartları [İnşa Planı §1](docs/plans/insa-plani.md#1-mühendislik-ilkeleri-ve-standartlar) içindedir.

## Başlamadan önce

- Ürün kararları için [Teknik Geliştirme Planı](docs/plans/gelistirme-plani.md), uygulama sırası için [İnşa Planı](docs/plans/insa-plani.md) okunmalıdır.
- Büyük bir değişiklikten önce bir issue açın ve ilgili faz (`phase:F*`) ile epic'i (`epic:E*`) belirtin.
- Mimari bir seçim değişiyorsa `docs/adr/` altında yeni bir ADR önerin.

## İş akışı

1. `main`'den kısa ömürlü bir dal açın: `<tür>/<faz>-<konu>` (ör. `feat/f1-budget-reservation`).
2. Commit mesajları [Conventional Commits](https://www.conventionalcommits.org/) biçimindedir; scope paket veya servis adıdır:
   `feat(gateway): reject model override with 403`
3. PR tek bir mantıksal değişiklik içerir; hedef ≤ ~400 satır diff.
4. PR şablonunu doldurun: amaç, ilgili GP bölümü, test kanıtı, güvenlik etkisi.
5. CI yeşil ve en az bir onay sonrası squash merge yapılır.

## Kod standartları (özet)

- Python: `ruff` (lint + format), `mypy --strict`, `pytest`.
- TypeScript: `strict: true`, ESLint + Prettier, Vitest, Playwright.
- Control plane kodu karşılaştırılan framework'leri import etmez; framework kodu yalnızca `runtimes/<id>/` içindedir.
- Domain katmanı saf kalır: I/O, saat ve rastgelelik port olarak enjekte edilir.
- Gerçek API anahtarı, kişisel veri veya kullanıcı belgesi commit edilmez.

## Definition of Done

- [ ] Lint, tip kontrolü ve testler yeşil.
- [ ] Public arayüzler belgelenmiş.
- [ ] Sözleşme değiştiyse schema sürümü ve üretilmiş kod güncel.
- [ ] Güvenlik etkisi değerlendirilmiş.
- [ ] `CHANGELOG.md` içinde `Unreleased` altına satır eklenmiş.
