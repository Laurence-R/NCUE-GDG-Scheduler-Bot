"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  // 初始化：從 localStorage 或系統偏好讀取
  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored === "light" || stored === "dark") {
      setThemeState(stored);
    } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      setThemeState("light");
    }
    setMounted(true);
  }, []);

  // 同步 class 到 <html>
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme, mounted]);

  const setTheme = useCallback((t: Theme) => setThemeState(t), []);
  const toggleTheme = useCallback(
    () => setThemeState((prev) => (prev === "dark" ? "light" : "dark")),
    []
  );

  // 防止 SSR hydration mismatch — 在 mount 前先用 dark class（與 HTML 一致）
  return (
    <ThemeContext.Provider value={{ theme: mounted ? theme : "dark", toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
