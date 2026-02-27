"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getThemeFromDOM(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

/** 寫入主題到 <html> class + localStorage */
function applyTheme(theme: Theme) {
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(theme);
  try {
    localStorage.setItem("theme", theme);
  } catch {}
}

/* ---------- useSyncExternalStore 訂閱 ---------- */
// 透過自訂事件讓 React 知道主題變了
const THEME_CHANGE = "theme-change";
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  // 也監聽系統偏好變化
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const handleSystemChange = () => {
    // 只在用戶沒有手動選擇時跟隨系統
    const stored = localStorage.getItem("theme");
    if (!stored || stored === "system") {
      applyTheme(mq.matches ? "dark" : "light");
      listeners.forEach((fn) => fn());
    }
  };
  mq.addEventListener("change", handleSystemChange);
  window.addEventListener(THEME_CHANGE, cb);
  return () => {
    listeners.delete(cb);
    mq.removeEventListener("change", handleSystemChange);
    window.removeEventListener(THEME_CHANGE, cb);
  };
}

function getSnapshot(): Theme {
  return getThemeFromDOM();
}

function getServerSnapshot(): Theme {
  return "light"; // SSR 不重要，阻斷腳本會在 paint 前覆蓋
}

/* ---------- Provider ---------- */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setTheme = useCallback((t: Theme) => {
    applyTheme(t);
    window.dispatchEvent(new Event(THEME_CHANGE));
  }, []);

  const toggleTheme = useCallback(() => {
    const next = getThemeFromDOM() === "dark" ? "light" : "dark";
    applyTheme(next);
    window.dispatchEvent(new Event(THEME_CHANGE));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
