"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "theme";

const ThemeContext = createContext<{
  preference: ThemePreference;
  theme: ResolvedTheme;
  setPreference: (next: ThemePreference) => void;
} | null>(null);

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function readStoredPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    // localStorage unavailable
  }
  return "system";
}

function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference === "system") return getSystemTheme();
  return preference;
}

function applyTheme(preference: ThemePreference) {
  const resolved = resolveTheme(preference);
  document.documentElement.dataset.theme = resolved;
  document.documentElement.dataset.themePreference = preference;
  try {
    localStorage.setItem(STORAGE_KEY, preference);
  } catch {
    // localStorage unavailable
  }
}

function readClientState(): {
  preference: ThemePreference;
  theme: ResolvedTheme;
} {
  const stored = document.documentElement.dataset.themePreference;
  const preference: ThemePreference =
    stored === "light" || stored === "dark" || stored === "system"
      ? stored
      : readStoredPreference();
  const applied = document.documentElement.dataset.theme;
  const theme: ResolvedTheme =
    applied === "light" || applied === "dark"
      ? applied
      : resolveTheme(preference);
  return { preference, theme };
}

function getInitialThemeState(): {
  preference: ThemePreference;
  theme: ResolvedTheme;
} {
  if (typeof document === "undefined") {
    return { preference: "system", theme: "dark" };
  }
  return readClientState();
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(getInitialThemeState);

  const setPreference = useCallback((next: ThemePreference) => {
    applyTheme(next);
    setState({
      preference: next,
      theme: resolveTheme(next),
    });
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const preference = readStoredPreference();
      if (preference !== "system") return;
      const resolved = getSystemTheme();
      document.documentElement.dataset.theme = resolved;
      setState({ preference: "system", theme: resolved });
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const value = useMemo(
    () => ({
      preference: state.preference,
      theme: state.theme,
      setPreference,
    }),
    [setPreference, state.preference, state.theme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
