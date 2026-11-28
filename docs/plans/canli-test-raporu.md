# Canlı API Entegrasyon Test Raporu

**Tarih:** 25 Kasım 2026
**Sağlayıcı:** ivmeX/OpenCode sunucusu (`http://127.0.0.1:4096`, HTTP Basic auth)
**Model:** `genel` (Yapay Zeka Merkezi — `api.yapayzekamerkezi.tr` arkasında, OpenAI-uyumlu)
**Kapsam:** Arena sisteminin gerçek LLM'e bağlanması + uçtan uca canlı test

---

## Tur 3 — Yeniden Koşum + Kabul Eşiği Düzeltmesi (28 Kasım 2026)

Deney `exp_01M88V9T1D5WCQGPQXVYZ3QYXE` (hedef metni: "Summarize contracts", gerçek benchmark:
**doc-review**) yeniden koşturuldu. Sonuçlar `data/arena_state.json` içinde:

| Framework | Durum | Token (tiktoken, derived) | conflict_F1 | Kabul |
|---|---|---|---|---|
| langgraph | completed | 2.366 | 0.80 | **eligible: false** |
| google-adk | completed | 1.399 | 0.80 | **eligible: false** |
| crewai | completed | 2.177 | 0.80 | **eligible: false** |

**Önemli düzeltme (bkz. Tur 2 tablosundan farklı okuma):** "completed" yalnızca orkestrasyonun
hatasız bittiği anlamına gelir; **kabul eşiği geçilmedi**. Spec'te `task_data.threshold` alanı boş
bırakıldığı için kod varsayılanı `DEFAULT_THRESHOLD = 0.90` (`doc-review` spec'i ile tutarlı)
uygulandı; F1 0.80 < 0.90 olduğundan üç candidate de `eligible: false`. ADR-007 gereği bu adaylar
ranking'te kazanan olamaz. (Tur 2'deki tablo, ayrı bir koşumdur; token değerleri farklıdır.)

### Koşum sırasında gözlenen geçici hata ve kalıcı düzeltme

- İlk yeniden deneme, OpenCode sunucusunun model kaydını yeniden yüklediği saniyelere denk geldi;
  worker'lar hatayı **failed + açık hata mesajıyla** raporladı (yeniden başlatma sonrası
  zombie-denetimi de doğru çalıştı). Başarısızlıklar ölçülmüş sonuç olarak kaydedilir — retry
  yoktur (`runner.py`: "worker failure is a measured outcome").
- **Kalıcı düzeltme:** `opencode_provider.py` (stateless yol) artık model referansı 404 döndüğünde
  anında sunucu-varsayılanına düşmüyor; önce aynı referansla 2 kez (2s/4s backoff) yeniden
  deneniyor, hâlâ 404 ise varsayılana düşüyor. Böylece geçici kayıt-yenileme pencereleri çalışmayı
  bozmaz, kalıcı yanlış referans ise eskisi gibi zarifçe ele alınır.
- **Snapshot tutarlılığı:** `experiments.start()` artık candidate'ın `code` alanını koşum
  başında diskteki güncel skeleton'dan tazeliyor; eski koşumdan kalan bayat snapshot ile
  event akışı arasındaki tutarsızlık bir daha oluşmaz.

---

## Tur 2 — Tüm Skeleton'lar Gerçek LLM'e Bağlandı + tiktoken Token Sayımı

### Yapılan iş

1. **10/10 worker skeleton'ı gerçek LLM'e bağlandı** (langgraph, google-adk, microsoft-af,
   openai-agents, crewai, agno, pydantic-ai, llama-agents, smolagents, mastra):
   - Dokümanlar artık `spec.input_ref` üzerinden **benchmark fixture'ından okunuyor**
     (`benchmarks/fixtures/doc-review/public/*.txt`); standalone export'ta gömülü örnek fallback'i.
   - **Çelişki tespit adımı artık LLM çağrısı** (`identify_conflicts` step, sistem promptu
     JSON-only şema ister); yanıt robust JSON parse ile çıkarılır (kod bloğu/çevre metin toleranslı).
   - Her framework kendi paradigma yapısını (state graph, crew tasks, handoff'lar, event
     akışı) korur; LLM adımları ADR-0006 gateway üzerinden gider.
2. **Token sayımı: tiktoken entegre edildi** (openai/tiktoken, MIT lisansı, `o200k_base` BPE):
   - Yeni modül: `services/model_gateway/src/arena_gateway/domain/token_counter.py`
     (thread-safe lazy yükleme; tiktoken yoksa chars/4 heuristiğine zarifçe düşer).
   - OpenCode adapter: usage raporlamadığı için artık **BPE ile sayılan `derived` tokenlar**
     (eski: `estimated` chars/4).
   - LiveProviderAdapter: provider usage raporlamazsa aynı şekilde `derived` sayım yapar.
   - `tiktoken>=0.8.0` arena-gateway bağımlılığına ve API Dockerfile'ına eklendi.
3. **MockProvider yükseltildi:** deterministik kural tabanlı çelişki analizi (tarih/bütçe
   regex gruplama) — mock yolundaki unit testler anlamlı ve deterministik kaldı.

### Test sırasında düzeltilenler

- CrewAI `claims` payload'ı mock'ta tanınmıyordu → mock her iki payload şeklini (documents/claims) destekler.
- `test_full_flow` / `test_export_is_standalone_and_runnable` beklentileri yeni gerçekliğe göre güncellendi
  (mock altında tüm framework'ler 2 çelişki bulur → hepsi eligible; offline standalone shim'de conflict_count=0).

### Canlı E2E sonucu (10 framework × 1 tekrar, gerçek LLM) — 12/12 PASS

Benchmark süresi: ~5 dk (20 gerçek LLM çağrısı, sıralı).

| Framework | Durum | Token (tiktoken) | F1 | Quality |
|---|---|---|---|---|
| langgraph | completed | 1396 | 0.80 | 80.0 |
| google-adk | completed | 1514 | 0.80 | 80.0 |
| microsoft-af | completed | 1308 | 0.80 | 80.0 |
| openai-agents | completed | 1502 | 0.80 | 80.0 |
| crewai | completed | 1248 | 0.80 | 80.0 |
| agno | completed | 2063 | 0.80 | 80.0 |
| pydantic-ai | completed | 1289 | 0.80 | 80.0 |
| llama-agents | completed | 2340 | 0.80 | 80.0 |
| **smolagents** 🏆 | completed | **919** | 0.80 | 80.0 |
| mastra | completed | 1285 | 0.80 | 80.0 |

- Kazanan: **smolagents** (90.0) — aynı kalitede en az token + en hızlı.
- **F1 = 0.8 gerçek model davranışı:** model 2 etiketli çelişkiyi (teslim tarihi, bütçe)
  buldu + "sorumlu birim" farkını (Sistem Mühendisliği vs Yazılım Ekibi) 3. çelişki olarak
  raporladı → precision 2/3, recall 2/2 → F1 0.80. Skorlar artık gerçek model kalitesini ölçüyor.
- Token kaynağı: `derived` (tiktoken BPE sayımı) — eski `estimated` chars/4 değil.
- Event akışı: 98 event, `model.completion` event'leri mevcut.
- Regresyon: **61/61 unit test passed.**

---

## Tur 1 — API Entegrasyonu ve Altyapı Düzeltmeleri

### Yapılan Entegrasyon

OpenCode sunucusu OpenAI-uyumlu `/v1/chat/completions` sunmadığı için (uv 404),
arena'ya özel bir transport eklendi:

| Dosya | Değişiklik |
|---|---|
| `services/model_gateway/src/arena_gateway/adapters/opencode_provider.py` | **YENİ** — OpenCode sunucusu adapter'ı. `POST /api/experimental/generate/text` + Basic auth. Erişilebilirlik probe'u, ArenaError eşlemeleri. |
| `services/model_gateway/src/arena_gateway/factory.py` | **YENİ** — Ortak provider factory. `ARENA_PROVIDER_*` (benchmark) ve `ARENA_DESIGN_*` (task design) prefix'leriyle `openai` / `opencode` transport seçimi. |
| `services/model_gateway/src/arena_gateway/runtime.py` | ModelGateway artık factory üzerinden provider kurar (mock fallback korunmuştur). |
| `apps/api/src/arena_api/task_design.py` | Task design artık factory'yi kullanır → OpenCode transport destekler. |
| `.env.example`, `compose.yaml` | `ARENA_PROVIDER_TRANSPORT` / `ARENA_DESIGN_TRANSPORT` + OpenCode ek değişkenleri dokümante edildi. |

### Tur 1'de bulunan ve düzeltilen hatalar

1. **Model adı uyumsuzluğu (kök neden):** Factory `ARENA_PROVIDER_MODEL` okuyor, env'de
   `ARENA_MODEL_ID` vardı → worker'lar `ModelNotFoundError: mock-agent-model/mock-agent-model`
   ile failed oldu. **Düzeltme:** legacy `ARENA_MODEL_ID` fallback'i eklendi.
2. **Threshold=0 bug:** `float(task.get("threshold") or DEFAULT_THRESHOLD)` — `0.0` falsy
   olduğu için eşik 0.9'a dönüyordu. **Düzeltme:** `None` kontrolü yapıldı (`main.py`).

### Tur 1 canlı test sonucu — 12/12 PASS

Gerçek LLM ile tam akış (ayrı uvicorn instance, port 8099, geçici state dosyası):
task-design → proje → spec → onay → deney → build → run → 3 framework tamamlandı
(langgraph F1 1.0, crewai/openai-agents F1 0.67 — o turda LLM adımı yalnızca review'daydı),
rankings (winner=crewai), event akışı tamamı PASS.

---

## 4. Sürekli Kullanım

```bash
copy .env.example .env
# .env içine:
#   ARENA_PROVIDER_API_KEY=<opencode-server-password>
#   ARENA_PROVIDER_TRANSPORT=opencode
#   ARENA_PROVIDER_BASE_URL=http://127.0.0.1:4096
#   ARENA_PROVIDER_MODEL=genel
#   ARENA_DESIGN_API_KEY=<opencode-server-password>
#   ARENA_DESIGN_TRANSPORT=opencode
#   ARENA_DESIGN_BASE_URL=http://127.0.0.1:4096
#   ARENA_DESIGN_MODEL=genel
run_system.bat
```

## 5. Kalan Bilinen Eksikler

- Postgres / tool_broker / telemetry / builder servisleri hâlâ bağlı değil (ölü kod).
- `run_system.bat` ile `.env` yükleme eklendi; canlı testte env elle enjekte edildi
  (bat yolu ayrıca elle doğrulanmadı).
- tiktoken `o200k_base`, `genel` modelinin gerçek tokenizer'ı olmayabilir → sayımlar
  OpenAI sınıfı BPE'ye göre yakın tahmin; provider usage raporlarsa otomatik `provider_reported` kazanır.

