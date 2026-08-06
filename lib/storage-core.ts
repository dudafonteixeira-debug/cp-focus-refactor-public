import { getErrorMessage } from "@/lib/error-messages";

export const APP_STORAGE_KEY = "cp_focus_app_data_v4";

export type StorageMode = "local";

export function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    return safeJsonParse<T>(window.localStorage.getItem(key), fallback);
  } catch {
    console.error(getErrorMessage("LOAD_DATA"));
    return fallback;
  }
}

export function saveToStorage<T>(key: string, value: T): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    console.error(getErrorMessage("SAVE_DATA"));
    return false;
  }
}

export function removeFromStorage(key: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch {
    console.error(getErrorMessage("SAVE_DATA"));
    return false;
  }
}
