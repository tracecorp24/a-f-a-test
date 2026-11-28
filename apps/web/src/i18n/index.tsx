import React, { createContext, useContext, useMemo, useState } from "react";
import { DICT_SHARED } from "./dict-shared";
import { DICT_DASHBOARD } from "./dict-dashboard";
import { DICT_FRAMEWORK_HUB } from "./dict-framework-hub";
import { DICT_TASK_PIPELINE } from "./dict-task-pipeline";
import { DICT_EXECUTION_ARENA } from "./dict-execution-arena";
import { DICT_COMPARISON_LAB } from "./dict-comparison-lab";
import { DICT_DEVELOPMENT_STUDIO } from "./dict-development-studio";
import { DICT_LIBRARY_EXPORTER } from "./dict-library-exporter";
import { DICT_COMPONENTS } from "./dict-components";

export type Lang = "tr" | "en";

// Türkçe metinler anahtar olarak kullanılır; TR dilinde metin olduğu gibi döner.
const DICTIONARY: Record<string, string> = {
  ...DICT_SHARED,
  ...DICT_DASHBOARD,
  ...DICT_FRAMEWORK_HUB,
  ...DICT_TASK_PIPELINE,
  ...DICT_EXECUTION_ARENA,
  ...DICT_COMPARISON_LAB,
  ...DICT_DEVELOPMENT_STUDIO,
  ...DICT_LIBRARY_EXPORTER,
  ...DICT_COMPONENTS,
};

const STORAGE_KEY = "arena-lang";

function readInitialLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "tr" || stored === "en") return stored;
  } catch {
    /* yoksay */
  }
  return "tr";
}

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  t: (key: string) => string;
  locale: string;
}

const I18nContext = createContext<I18nContextValue>({
  lang: "tr",
  setLang: () => {},
  toggleLang: () => {},
  t: (key) => key,
  locale: "tr-TR",
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => readInitialLang());

  const value = useMemo<I18nContextValue>(() => {
    const t = (key: string): string => {
      if (lang === "tr") return key;
      return DICTIONARY[key] ?? key;
    };
    return {
      lang,
      setLang: (l: Lang) => {
        setLangState(l);
        try {
          localStorage.setItem(STORAGE_KEY, l);
        } catch {
          /* yoksay */
        }
      },
      toggleLang: () => {
        const next: Lang = lang === "tr" ? "en" : "tr";
        setLangState(next);
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch {
          /* yoksay */
        }
      },
      t,
      locale: lang === "tr" ? "tr-TR" : "en-US",
    };
  }, [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  return useContext(I18nContext);
}
