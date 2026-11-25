import "./SuccessTestFlow.css";

export type SuccessCriteria = {
  metric: string;
  threshold: string;
  verification: string;
};

export type BenchmarkPlan = {
  source?: string;
  scenarios?: string;
  testCount?: string;
  reference?: string;
  hardGate?: string;
  repetitions?: string;
  measurements?: string;
  reporting?: string;
  instruction: string;
};

export function SuccessTestFlow({ criteria, benchmark }: { criteria: SuccessCriteria; benchmark?: BenchmarkPlan }) {
  return (
    <figure className="success-test-flow">
      <figcaption className="arena-card-title">Başarı Testi Akış Şeması</figcaption>
      <ol className="success-test-flow-steps">
        {benchmark && (
          <li className="success-test-flow-node">
            <strong>Test veri setini hazırla</strong>
            <span>{[benchmark.source, benchmark.scenarios, benchmark.testCount && `${benchmark.testCount} örnek`].filter(Boolean).join(" · ") || "Veri kaynağı, senaryolar ve örnek sayısı"}</span>
            {benchmark.instruction && <span>Ek benchmark talimatı: {benchmark.instruction}</span>}
          </li>
        )}
        <li className="success-test-flow-node">
          <strong>{benchmark ? "Pipeline’ı test örneklerinde çalıştır" : "Görev çıktısını al"}</strong>
          {benchmark && <span>{[benchmark.repetitions && `Örnek başına ${benchmark.repetitions} tekrar`, benchmark.measurements].filter(Boolean).join(" · ") || "Tekrar sayısı ve ek ölçümler"}</span>}
        </li>
        <li className="success-test-flow-node">
          <strong>Çıktıyı doğrula</strong>
          <span>{criteria.verification || "Doğrulama yöntemi"}</span>
        </li>
        {benchmark && (
          <li className="success-test-flow-node">
            <strong>Zorunlu geçiş koşulunu denetle</strong>
            <span>{benchmark.hardGate || "Doğrudan başarısızlık nedeni"}</span>
          </li>
        )}
        <li className="success-test-flow-node">
          <strong>Başarı ölçütünü değerlendir</strong>
          <span>{criteria.metric || "Başarı ölçütü"}</span>
        </li>
        <li className="success-test-flow-node success-test-flow-decision">
          <strong>{benchmark ? "Zorunlu koşul ve başarı eşiği sağlandı mı?" : "Kabul koşulu sağlandı mı?"}</strong>
          <span>{criteria.threshold || "Kabul eşiği veya koşulu"}</span>
          <ul className="success-test-flow-branches">
            <li><span>Evet <span aria-hidden="true">↓</span></span><strong>Başarılı</strong></li>
            <li><span>Hayır <span aria-hidden="true">↓</span></span><strong>Başarısız</strong></li>
          </ul>
        </li>
        {benchmark && (
          <li className="success-test-flow-node">
            <strong>Sonuçları raporla</strong>
            <span>{benchmark.reporting || "Başarısız sonuçların raporlama biçimi"}</span>
          </li>
        )}
      </ol>
    </figure>
  );
}
