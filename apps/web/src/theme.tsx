import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ThemeName = "dark" | "light";

export interface Palette {
  bg: string;
  panel: string;
  panelAlt: string;
  line: string;
  lineSubtle: string;
  muted: string;
  subtle: string;
  text: string;
  cyan: string;
  blue: string;
  green: string;
  purple: string;
  amber: string;
  red: string;
}

export const PALETTES: Record<ThemeName, Palette> = {
  // Lumen · koyu (Material 3 dark tonal paleti)
  dark: {
    bg: "#17181B",
    panel: "#2D2E31",
    panelAlt: "#35363A",
    line: "#3C4043",
    lineSubtle: "#303134",
    muted: "#9AA0A6",
    subtle: "#80868B",
    text: "#E8EAED",
    cyan: "#8AB4F8",
    blue: "#8AB4F8",
    green: "#81C995",
    purple: "#C58AF9",
    amber: "#FDD663",
    red: "#F28B82",
  },
  // Lumen · açık (Google Workspace / Material 3 light)
  light: {
    bg: "#F8F9FA",
    panel: "#ffffff",
    panelAlt: "#F1F3F4",
    line: "#DADCE0",
    lineSubtle: "#E8EAED",
    muted: "#5F6368",
    subtle: "#80868B",
    text: "#202124",
    cyan: "#1A73E8",
    blue: "#4285F4",
    green: "#188038",
    purple: "#A142F4",
    amber: "#F9AB00",
    red: "#D93025",
  },
};

const STORAGE_KEY = "arena-theme";

function readInitialTheme(): ThemeName {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    /* localStorage erişilemezse varsayılan */
  }
  // Lumen açık temayla başla
  return "light";
}

// Modül seviyesinde güncel tema; THEME getter'ları (mockData) buradan okur.
let currentTheme: ThemeName = readInitialTheme();

export function getThemeName(): ThemeName {
  return currentTheme;
}

export function getPalette(): Palette {
  return PALETTES[currentTheme];
}

interface ThemeContextValue {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(() => currentTheme);

  useEffect(() => {
    currentTheme = theme;
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* yoksay */
    }
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme: setThemeState,
      toggleTheme: () => setThemeState((t) => (t === "dark" ? "light" : "dark")),
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
