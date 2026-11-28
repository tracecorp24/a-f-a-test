import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import { THEME } from "./data/mockData";
import { useI18n } from "./i18n";
import { useTheme } from "./theme";
import { DashboardPage } from "./pages/DashboardPage";
import { FrameworkHubPage } from "./pages/FrameworkHubPage";
import { TaskPipelinePage } from "./pages/TaskPipelinePage";
import { ExecutionArenaPage } from "./pages/ExecutionArenaPage";
import { ComparisonLabPage } from "./pages/ComparisonLabPage";
import { DevelopmentStudioPage } from "./pages/DevelopmentStudioPage";
import { LibraryExporterPage } from "./pages/LibraryExporterPage";

// ---- Sidebar phase/level config ----
const NAV_PHASES = [
  {
    phase: 1,
    label: "Keşif",
    color: THEME.blue,
    items: [
      { path: "/", label: "Genel Bakış", icon: "⌂" },
      { path: "/framework-hub", label: "Framework Matrisi", icon: "⊞" },
    ],
  },
  {
    phase: 2,
    label: "Görev Tasarımı",
    color: THEME.cyan,
    items: [
      { path: "/task-pipeline", label: "Görev ve Pipeline Stüdyosu", icon: "✎" },
    ],
  },
  {
    phase: 3,
    label: "Analiz",
    color: THEME.green,
    items: [
      { path: "/execution-arena", label: "Çalıştırma Arenası", icon: "▶" },
      { path: "/development-studio", label: "Geliştirme Stüdyosu", icon: "⚙" },
    ],
  },
  {
    phase: 4,
    label: "Karar",
    color: THEME.purple,
    items: [
      { path: "/comparison-lab", label: "Karşılaştırma ve Öneri", icon: "◈" },
      { path: "/library-exporter", label: "Dışa Aktarım", icon: "⤓" },
    ],
  },
];

export default function App() {
  const location = useLocation();
  const { t, lang, toggleLang } = useI18n();
  const { theme, toggleTheme } = useTheme();

  // Determine active phase
  const activePhase = NAV_PHASES.findIndex((ph) =>
    ph.items.some((it) => it.path === location.pathname)
  ) + 1;

  return (
    <div className="arena-viewport">
      <div className="arena-shell">
        {/* Sidebar */}
        <aside className="arena-sidebar">
          {/* Brand */}
          <div className="arena-brand">
            <span className="arena-brand-icon">△</span>
            <div>
              <div className="arena-brand-title">AGENTIC ARENA</div>
              <div className="arena-brand-sub">Kurumsal Benchmark · v2.4</div>
            </div>
          </div>

          {/* Nav */}
          <nav className="arena-nav" style={{ padding: "10px 10px" }}>
            {NAV_PHASES.map((ph) => (
              <div key={ph.phase} className="arena-nav-group">
                {/* Phase label */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "6px 10px 6px",
                  }}
                >
                  <span
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      backgroundColor: activePhase >= ph.phase ? ph.color : THEME.line,
                      color: activePhase >= ph.phase ? "var(--bg-shell)" : THEME.muted,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 9,
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {ph.phase}
                  </span>
                  <span
                    className="arena-nav-group-label"
                    style={{
                      padding: 0,
                      color: activePhase >= ph.phase ? ph.color : THEME.muted,
                    }}
                  >
                    {t(ph.label)}
                  </span>
                </div>

                {/* Nav items — indented under phase */}
                <div style={{ paddingLeft: 10 }}>
                  {ph.items.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`arena-nav-link ${isActive ? "active" : ""}`}
                        style={
                          isActive
                            ? { borderLeftColor: ph.color, color: ph.color }
                            : {}
                        }
                      >
                        <span className="arena-nav-icon">{item.icon}</span>
                        <span>{t(item.label)}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="arena-sidebar-footer">
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: THEME.green }} />
              <span style={{ fontWeight: 600, color: THEME.text }}>{t("10 Framework Kayıtlı")}</span>
            </div>
            <div style={{ fontSize: 10.5, color: THEME.subtle }}>
              {t("Tek Model · Sıfır Önyargı · ADR Uyumlu")}
            </div>
          </div>
        </aside>

        {/* Main column */}
        <div className="arena-main-col">
          <header className="arena-topbar">
            <nav className="arena-phase-progress" aria-label={t("İş akışı aşamaları")}>
              {NAV_PHASES.map((phase) => (
                <Link
                  key={phase.phase}
                  to={phase.items[0]!.path}
                  className="arena-phase-step"
                  data-reached={activePhase >= phase.phase}
                  aria-current={activePhase === phase.phase ? "step" : undefined}
                  style={{ color: activePhase >= phase.phase ? phase.color : THEME.muted }}
                >
                  <span className="arena-phase-number">{phase.phase}</span>
                  <span>{t(phase.label)}</span>
                </Link>
              ))}
            </nav>

            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <span
                className="arena-pill"
                style={{ background: "rgba(52, 211, 153, 0.1)", color: THEME.green, borderColor: "rgba(52, 211, 153, 0.28)" }}
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: THEME.green }} />
                {t("Dual-Gate Uyumluluğu Aktif")}
              </span>

              <button
                type="button"
                className="arena-icon-btn"
                onClick={toggleLang}
                title={lang === "tr" ? "Switch to English" : "Türkçe'ye geç"}
                aria-label={lang === "tr" ? "Switch to English" : "Türkçe'ye geç"}
              >
                <span aria-hidden="true">🌐</span>
                <span className="arena-icon-btn-label">{lang === "tr" ? "EN" : "TR"}</span>
              </button>

              <button
                type="button"
                className="arena-icon-btn"
                onClick={toggleTheme}
                title={theme === "dark" ? t("Açık tema") : t("Koyu tema")}
                aria-label={theme === "dark" ? t("Açık tema") : t("Koyu tema")}
              >
                <span aria-hidden="true">{theme === "dark" ? "☀️" : "🌙"}</span>
              </button>
            </div>
          </header>

          <main className="arena-content">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/framework-hub" element={<FrameworkHubPage />} />
              <Route path="/task-pipeline" element={<TaskPipelinePage />} />
              <Route path="/execution-arena" element={<ExecutionArenaPage />} />
              <Route path="/telemetry-center" element={<Navigate to="/execution-arena" replace />} />
              <Route path="/evaluation-center" element={<Navigate to="/development-studio" replace />} />
              <Route path="/comparison-lab" element={<ComparisonLabPage />} />
              <Route path="/development-studio" element={<DevelopmentStudioPage />} />
              <Route path="/library-exporter" element={<LibraryExporterPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
}
