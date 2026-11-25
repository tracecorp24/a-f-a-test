# Agentic Arena

> **One task. One model. Ten frameworks. Measurable results.**

Agentic Arena, kullanıcının kendi görevi için on agentic framework üzerinde bağımsız ve native pipeline'lar geliştiren, bunları aynı model ve eşit koşullarda çalıştıran, ölçen ve en uygun framework'ü kanıta dayalı olarak öneren açık kaynak bir platformdur.

> [!NOTE]
> Proje **planlama aşamasındadır.** Henüz çalışan bir ürün, yayımlanmış bir sürüm veya ölçülmüş benchmark sonucu yoktur. Aşağıdaki komutlar ve yapı, tasarlanan ürünü tanımlar.

## Neden?

Framework seçimi genellikle dokümantasyona, popülerliğe veya başkalarının benchmark'larına göre yapılır. Oysa uygunluk, yapılacak işe ve kabul kriterlerine bağlıdır. Agentic Arena bu kararı kullanıcının kendi problemi üzerinde deneysel hale getirir:

1. Görev doğal dil, görsel akış veya mevcut proje importu ile tanımlanır; belirsizlikler sorularla netleştirilir ve kullanıcı onaylar.
2. Her framework için o framework'ün doğal primitive'lerini kullanan bağımsız bir uygulama üretilir, test edilir ve dondurulur.
3. Tüm adaylar aynı model, aynı veri, aynı araçlar ve eşit bütçeyle çalıştırılır.
4. Kalite, hız, token ve güvenilirlik ölçülür; hard kriterleri geçen adaylar kullanıcının ağırlıklarıyla sıralanır.
5. Seçilen pipeline, platformdan bağımsız çalışan bir proje olarak dışa aktarılır.

## Değişmez kurallar

- **Tek repo** — upstream framework repoları ayrı ayrı kurulmaz.
- **Tek API anahtarı, tek model** — planlama, kod üretimi, tüm pipeline'lar ve değerlendirme aynı modele gider; gizli fallback yoktur.
- **Yalnızca native karşılaştırma** — her framework kendi orkestrasyon primitive'leriyle çözüm üretir.
- **Onaysız geliştirme yok** — gereksinimler kullanıcı onayıyla kilitlenir.
- **Ölçülmeyen uydurulmaz** — eksik veya tahmini metrikler açıkça etiketlenir; yeterli kanıt yoksa kazanan ilan edilmez.

## Framework kataloğu

| Framework | Runtime | Native paradigma |
|---|---|---|
| [LangGraph](https://github.com/langchain-ai/langgraph) | Python | State / graph |
| [Google ADK](https://github.com/google/adk-python) | Python | Hiyerarşik ajanlar / workflow |
| [Microsoft Agent Framework](https://github.com/microsoft/agent-framework) | Python | Agent / executor / workflow |
| [OpenAI Agents SDK](https://github.com/openai/openai-agents-python) | Python | Agent loop / handoff |
| [CrewAI](https://github.com/crewAIInc/crewAI) | Python | Crew / role / task / flow |
| [Agno](https://github.com/agno-agi/agno) | Python | Agent / Team / Workflow |
| [Pydantic AI](https://github.com/pydantic/pydantic-ai) | Python | Typed agent / dependency / graph |
| [LlamaAgents](https://github.com/run-llama/llama-agents) | Python | Event-driven async workflow |
| [Smolagents](https://github.com/huggingface/smolagents) | Python | Code / tool-calling agent |
| [Mastra](https://github.com/mastra-ai/mastra) | TypeScript | Agent / workflow |

## Planlama dokümanları

| Doküman | İçerik |
|---|---|
| [Teknik Geliştirme Planı](temp-dosyalar/gelistirme-plani.md) | Ürün gereksinimleri, sistem mimarisi, veri modeli, API, telemetri, değerlendirme ve kabul testleri — **ne ve neden** |
| [İnşa Planı](temp-dosyalar/insa-plani.md) | Faz faz uygulama sırası, iş paketleri, mühendislik standartları, CI/CD ve izlenebilirlik — **nasıl ve hangi sırayla** |

## Yol haritası

| Faz | Ad | Hedef sürüm |
|---|---|---|
| F0 | Foundation — repo, sözleşmeler, CI | `v0.1.0` |
| F1 | Single Model Core — gateway, bütçe, usage ledger | `v0.2.0` |
| F2 | Pilot runtime'lar — LangGraph + Google ADK | `v0.3.0` |
| F3 | Builder ve gereksinimler | `v0.4.0` |
| F4 | Telemetri, değerlendirme ve öneri | `v0.5.0` |
| F5 | Beş runtime alpha | `v0.6.0` |
| F6 | On runtime beta | `v0.7.0` |
| F7 | Release hardening — ilk tamamlanmış sürüm | `v1.0.0` |
| F8 | Eklentiler | `v1.1.0` |

Ayrıntılar için [İnşa Planı §3](temp-dosyalar/insa-plani.md#3-faz-haritası).

## Planlanan kurulum

```bash
git clone https://github.com/<owner>/agentic-arena.git
cd agentic-arena
docker compose up -d --build
# Web UI: http://localhost:3000
```

## Arayüzden kullanım (yerel)

`run_system.bat` API'yi (8080) ve web arayüzünü (3000) başlatır. Tüm akış arayüzden yönetilir:

1. **Görev Stüdyosu** — görevi tanımla, kapsamı netleştir, benchmark kriterlerini onayla, framework'leri seç ve **Arenayı Başlat**'a bas (proje → spec → onay → deney → build → run API çağrıları yapılır).
2. **Çalıştırma Arenası** — her framework'ün işçisi (`runtimes/*/skeleton`) `WorkerProtocol` ile çalıştırılır; ilerleme, olaylar ve ajan telemetrisi canlı akar. Duraklat / sürdür / iptal / yeniden çalıştır buradan.
3. **Karşılaştırma ve Öneri** — ağırlıklar ve kalite barajı değiştikçe sıralama API'den (`/rankings`) yeniden hesaplanır.
4. **Dışa Aktarım** — seçilen adayın bağımsız, gizli anahtarsız paketi oluşturulur ve SHA-256 doğrulamasıyla indirilir.
5. **Geliştirme Stüdyosu** — işçi kodu / manifest görüntülenir; *Doğrula* işçiyi sunucuda çalıştırır.

Notlar:

- Skorlar `benchmarks/fixtures/doc-review` etiketli verisine göre ölçülür (F1 hard gate + şema). Yerleşik işçiler model çağrısı yapmaz; bu yüzden token değerleri olay yüklerinden **tahmin** edilir ve arayüzde `~` ile gösterilir.
- Durum `data/arena_state.json` dosyasında saklanır (`ARENA_STATE_FILE` ile değiştirilebilir). Çalışırken sunucu yeniden başlarsa o deney "başarısız" işaretlenir.
- AI ile akış/soru üretimi için `ARENA_DESIGN_MODEL` ve `ARENA_DESIGN_API_KEY` tanımlayın (isteğe bağlı `ARENA_DESIGN_BASE_URL`). Tanımlı değilse yerleşik şablon kullanılır.

## Katkı

Katkı kuralları için [CONTRIBUTING.md](CONTRIBUTING.md), güvenlik bildirimleri için [SECURITY.md](SECURITY.md) dosyasına bakın.

## Lisans

[MIT](LICENSE)
