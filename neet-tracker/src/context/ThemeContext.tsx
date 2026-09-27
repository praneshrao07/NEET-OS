import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ThemeId, ThemeConfig } from '../types/theme';
import { THEMES } from '../types/theme';

interface ThemeContextType {
  themeId: ThemeId;
  theme: ThemeConfig;
  setTheme: (id: ThemeId) => void;
  availableThemes: ThemeConfig[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'neet_mock_tracker_theme_v1';

export function applyThemeVariables(theme: ThemeConfig) {
  const root = document.documentElement;
  root.style.setProperty('--bg-primary', theme.bgPrimary);
  root.style.setProperty('--bg-panel', theme.bgPanel);
  root.style.setProperty('--bg-header', theme.bgHeader);
  root.style.setProperty('--bg-sidebar', theme.bgSidebar);
  root.style.setProperty('--accent-primary', theme.accentPrimary);
  root.style.setProperty('--accent-glow', theme.accentGlow);
  root.style.setProperty('--accent-secondary', theme.accentSecondary);
  root.style.setProperty('--accent-rgb', theme.accentRgb);
  root.style.setProperty('--glow-rgb', theme.glowRgb);
  root.style.setProperty('--border-panel', theme.borderPanel);
}

export const ThemeProvider: React.FC<{ children: React.ReactNode; initialThemeId?: ThemeId }> = ({
  children,
  initialThemeId,
}) => {
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    if (initialThemeId && THEMES[initialThemeId]) {
      return initialThemeId;
    }
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId | null;
    if (saved && THEMES[saved]) {
      return saved;
    }
    return 'electric-blue';
  });

  const activeTheme = THEMES[themeId] || THEMES['electric-blue'];

  useEffect(() => {
    applyThemeVariables(activeTheme);
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
  }, [themeId, activeTheme]);

  const handleSetTheme = (newId: ThemeId) => {
    if (THEMES[newId]) {
      setThemeId(newId);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        themeId,
        theme: activeTheme,
        setTheme: handleSetTheme,
        availableThemes: Object.values(THEMES),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
