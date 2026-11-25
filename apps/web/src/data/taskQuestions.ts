import type { TaskQuestion } from "../components/TaskQuestionnaire";

export const CLARIFICATION_QUESTIONS: readonly TaskQuestion[] = [
  ["Görev öncelikle hangi ihtiyacı karşılamalı?", "Sorunları tespit et", "Seçenekleri karşılaştır", "Kullanılabilir çıktı üret"],
  ["Sonucu kim kullanacak?", "Operasyon ekibi", "Teknik ekip", "Karar vericiler"],
  ["Hangi girdiler kapsama girsin?", "Yalnızca sağlanan girdiler", "İlgili iç kaynaklar da dahil", "Onaylı dış kaynaklar da dahil"],
  ["Hangi örnekler ayrıca ele alınmalı?", "Eksik girdiler", "Çelişkili girdiler", "Nadir ve istisnai girdiler", "Hepsi"],
  ["Girdi eksikse ne yapılmalı?", "Açıklama iste", "Varsayımı bildirerek devam et", "Etkilenen bölümü atla"],
  ["Kaynaklar çelişirse ne yapılmalı?", "Her iki kaynağı raporla", "En güncel kaynağı önceliklendir", "Kullanıcı onayı iste"],
  ["Hangi çıktı biçimi kullanılmalı?", "JSON", "Markdown raporu", "CSV tablosu"],
  ["Bulgular nasıl gerekçelendirilmeli?", "Her bulguya kaynak ekle", "Yalnızca kritik bulgulara kaynak ekle", "Gerekçeyi özetle"],
  ["Hangi işlemler kullanıcı onayı gerektirmeli?", "Harici işlem ve veri değişikliği", "Belirsiz kararlar", "Her kritik adım"],
  ["Bir kısıtla karşılaşılırsa öncelik ne olmalı?", "Daha kapsamlı sonuç", "Daha kısa süre", "Daha düşük kaynak kullanımı"],
];

export const BENCHMARK_QUESTIONS: readonly TaskQuestion[] = [
  ["Benchmark girdileri nereden alınmalı?", "Etiketli örnekler", "Anonim geçmiş örnekler", "Sentetik örnekler"],
  ["Hangi senaryolar kapsansın?", "Normal akış", "Normal ve sınır durumları", "Normal, sınır ve hata durumları"],
  ["Kaç test örneği kullanılsın?", "10", "30", "100"],
  ["Beklenen sonuç nasıl belirlensin?", "Referans cevap", "Uzman kontrol listesi", "Otomatik doğrulama kuralları"],
  ["Ana başarı ölçütü ne olsun?", "Görev başarı oranı", "F1 skoru", "Referansla tam eşleşme"],
  ["Ana ölçütün kabul eşiği kaç olsun?", "%80", "%90", "%95"],
  ["Hangi hata doğrudan başarısız sayılmalı?", "Geçersiz çıktı biçimi", "Kritik bulgunun atlanması", "Dayanaksız sonuç", "Hepsi"],
  ["Her senaryo kaç kez tekrarlansın?", "1", "3", "5"],
  ["Hangi ek ölçümler kaydedilsin?", "Süre", "Token kullanımı", "Süre ve token kullanımı", "Ek ölçüm yok"],
  ["Başarısız sonuçlar nasıl raporlansın?", "Örnek bazında", "Hata türüne göre", "Her iki şekilde"],
];

export const METRIC_DEFINITIONS: Record<string, string> = {
  "Görev başarı oranı": "Başarılı örnek sayısı / değerlendirilen örnek sayısı × 100",
  "F1 skoru": "2 × doğru pozitif / (2 × doğru pozitif + yanlış pozitif + yanlış negatif) × 100",
  "Referansla tam eşleşme": "Referans çıktıyla birebir eşleşen örnek sayısı / değerlendirilen örnek sayısı × 100",
};
