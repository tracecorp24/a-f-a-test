import "./SuccessTestFlow.css";
import { useI18n } from "../i18n";

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
  const { t } = useI18n();
  return (
    <figure className="success-test-flow">
      <figcaption className="arena-card-title">{t("Başarı Testi Akış Şeması")}</figcaption>
      <ol className="success-test-flow-steps">
        {benchmark && (
          <li className="success-test-flow-node">
            <strong>{t("Test veri setini hazırla")}</strong>
            <span>{[t(benchmark.source ?? ""), benchmark.scenarios && t(benchmark.scenarios), benchmark.testCount && `${benchmark.testCount} ${t("örnek")}`].filter(Boolean).join(" · ") || t("Veri kaynağı, senaryolar ve örnek sayısı")}</span>
            {benchmark.instruction && <span>{t("Ek benchmark talimatı:")} {benchmark.instruction}</span>}
          </li>
        )}
        <li className="success-test-flow-node">
          <strong>{benchmark ? t("Pipeline’ı test örneklerinde çalıştır") : t("Görev çıktısını al")}</strong>
          {benchmark && <span>{[benchmark.repetitions && `${t("Örnek başına")} ${benchmark.repetitions} ${t("tekrar")}`, benchmark.measurements && t(benchmark.measurements)].filter(Boolean).join(" · ") || t("Tekrar sayısı ve ek ölçümler")}</span>}
        </li>
        <li className="success-test-flow-node">
          <strong>{t("Çıktıyı doğrula")}</strong>
          <span>{criteria.verification ? t(criteria.verification) : t("Doğrulama yöntemi")}</span>
        </li>
        {benchmark && (
          <li className="success-test-flow-node">
            <strong>{t("Zorunlu geçiş koşulunu denetle")}</strong>
            <span>{benchmark.hardGate ? t(benchmark.hardGate) : t("Doğrudan başarısızlık nedeni")}</span>
          </li>
        )}
        <li className="success-test-flow-node">
          <strong>{t("Başarı ölçütünü değerlendir")}</strong>
          <span>{criteria.metric ? t(criteria.metric) : t("Başarı ölçütü")}</span>
        </li>
        <li className="success-test-flow-node success-test-flow-decision">
          <strong>{benchmark ? t("Zorunlu koşul ve başarı eşiği sağlandı mı?") : t("Kabul koşulu sağlandı mı?")}</strong>
          <span>{criteria.threshold || t("Kabul eşiği veya koşulu")}</span>
          <ul className="success-test-flow-branches">
            <li><span>{t("Evet")} <span aria-hidden="true">↓</span></span><strong>{t("Başarılı")}</strong></li>
            <li><span>{t("Hayır")} <span aria-hidden="true">↓</span></span><strong>{t("Başarısız")}</strong></li>
          </ul>
        </li>
        {benchmark && (
          <li className="success-test-flow-node">
            <strong>{t("Sonuçları raporla")}</strong>
            <span>{benchmark.reporting ? t(benchmark.reporting) : t("Başarısız sonuçların raporlama biçimi")}</span>
          </li>
        )}
      </ol>
    </figure>
  );
}
