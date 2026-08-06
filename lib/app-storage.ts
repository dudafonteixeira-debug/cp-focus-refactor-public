import {
  getAppData,
  saveAppDataRepo,
} from "@/lib/data-access/app-repository";
import {
  loadFromStorage,
  saveToStorage,
} from "@/lib/storage-core";

export type AppData = {
  materias?: any[];
  revisoes?: any[];
  [key: string]: any;
};

const PRIMARY_KEY = "cp-focus-app";

const LEGACY_KEYS = [
  PRIMARY_KEY,
  "cp_focus_app_data_v4",
  "cp-focus-app-backup-latest",
  "cp-focus-app-backups",
];

let memoryCache: AppData | null = null;
let hydrationPromise: Promise<AppData> | null = null;

function isBrowser() {
  return typeof window !== "undefined";
}

function isValidObject(value: any): value is Record<string, any> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeAppData(data: any): AppData {
  if (!isValidObject(data)) {
    return {
      materias: [],
      revisoes: [],
    };
  }

  return {
    ...data,
    materias: Array.isArray(data.materias) ? data.materias : [],
    revisoes: Array.isArray(data.revisoes) ? data.revisoes : [],
  };
}

function extractBackupData(parsed: any) {
  if (!parsed) return null;

  if (isValidObject(parsed.data)) return parsed.data;
  if (isValidObject(parsed.appData)) return parsed.appData;
  if (isValidObject(parsed.app)) return parsed.app;
  if (isValidObject(parsed.payload)) return parsed.payload;

  if (Array.isArray(parsed) && parsed.length > 0) {
    const ultimo = parsed[parsed.length - 1];

    if (isValidObject(ultimo?.data)) return ultimo.data;
    if (isValidObject(ultimo?.appData)) return ultimo.appData;
    if (isValidObject(ultimo?.app)) return ultimo.app;
    if (isValidObject(ultimo?.payload)) return ultimo.payload;
    if (isValidObject(ultimo)) return ultimo;
  }

  return null;
}

function readLegacyCache(): AppData {
  if (!isBrowser()) return normalizeAppData({});

  for (const key of LEGACY_KEYS) {
    const parsed = loadFromStorage<any>(key, null);
    if (!parsed) continue;

    if (
      key === "cp-focus-app-backup-latest" ||
      key === "cp-focus-app-backups"
    ) {
      const backupData = extractBackupData(parsed);

      if (backupData) {
        const normalized = normalizeAppData(backupData);

        if (normalized.materias?.length || normalized.revisoes?.length) {
          return normalized;
        }
      }

      continue;
    }

    if (isValidObject(parsed)) {
      const normalized = normalizeAppData(parsed);

      if (
        normalized.materias?.length ||
        normalized.revisoes?.length ||
        Object.keys(normalized).length > 2
      ) {
        return normalized;
      }
    }
  }

  return normalizeAppData({});
}

function publishUpdate() {
  if (!isBrowser()) return;

  window.dispatchEvent(
    new CustomEvent(getAppStorageEventName()),
  );
}

function persistCache(data: AppData) {
  memoryCache = normalizeAppData(data);

  if (isBrowser()) {
    saveToStorage(PRIMARY_KEY, memoryCache);
  }

  return memoryCache;
}

export function hydrateAppData(): Promise<AppData> {
  if (hydrationPromise) return hydrationPromise;

  const fallback = memoryCache ?? readLegacyCache();

  hydrationPromise = getAppData<AppData>(fallback)
    .then((remote) => {
      const normalized = persistCache(remote);
      publishUpdate();
      return normalized;
    })
    .catch((error) => {
      console.error("Falha ao hidratar dados remotos; usando cache local.", error);
      return fallback;
    })
    .finally(() => {
      hydrationPromise = null;
    });

  return hydrationPromise;
}

export function loadAppData(): AppData {
  if (!memoryCache) {
    memoryCache = readLegacyCache();
  }

  void hydrateAppData();

  return normalizeAppData(memoryCache);
}

export function saveAppData(data: AppData) {
  const normalized = persistCache(data);

  publishUpdate();
  void saveAppDataRepo(normalized).catch((error) => {
    console.error("Falha ao sincronizar dados; copia local preservada.", error);
  });
}

export function updateAppData(
  updater: (data: AppData) => AppData,
) {
  const current = loadAppData();
  const updated = updater(normalizeAppData(current));

  saveAppData(normalizeAppData(updated));
}

export function resetAllAppData() {
  const empty = normalizeAppData({});

  persistCache(empty);
  publishUpdate();
  void saveAppDataRepo(empty).catch((error) => {
    console.error("Falha ao sincronizar a limpeza de dados.", error);
  });
}

export function getAppStorageEventName() {
  return "cp-focus-storage-updated";
}
