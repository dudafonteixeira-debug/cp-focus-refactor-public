import { loadFromStorage, saveToStorage } from "@/lib/storage-core";

const THEME_KEY = "cp-focus-theme";

export type AppThemeMode = "light" | "dark";

export function loadThemeMode(): AppThemeMode {
  if (typeof window === "undefined") return "light";

  const saved = loadFromStorage<any>(THEME_KEY, null);
  if (saved === "dark" || saved === "light") return saved;

  return "light";
}

export function saveThemeMode(mode: AppThemeMode) {
  if (typeof window === "undefined") return;
  saveToStorage(THEME_KEY, mode);
}


