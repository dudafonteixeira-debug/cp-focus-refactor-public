import { loadFromStorage, saveToStorage } from "@/lib/storage-core";

import type { Fase2Store } from "@/lib/fase2-types";

export const FASE2_STORAGE_KEY = "cp_focus_fase2_v1";

export const EMPTY_FASE2_STORE: Fase2Store = {
  reviews: [],
  sessions: [],
  studyPacks: [],
  weakTopics: [],
  metrics: {
    revisoesHoje: 0,
    revisoesAtrasadas: 0,
    totalReviews: 0,
    acertos: 0,
    erros: 0,
    taxaAcerto: 0,
    sequenciaAcertos: 0,
  },
  updatedAt: new Date().toISOString(),
};

export function loadFase2Store(): Fase2Store {
  if (typeof window === "undefined") return EMPTY_FASE2_STORE;

  try {
    const raw = loadFromStorage<any>(FASE2_STORAGE_KEY, null);
    if (!raw) return EMPTY_FASE2_STORE;

    const parsed = raw as Partial<Fase2Store>;

    return {
      ...EMPTY_FASE2_STORE,
      ...parsed,
      reviews: Array.isArray(parsed.reviews) ? parsed.reviews : [],
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      studyPacks: Array.isArray(parsed.studyPacks) ? parsed.studyPacks : [],
      weakTopics: Array.isArray(parsed.weakTopics) ? parsed.weakTopics : [],
      metrics: {
        ...EMPTY_FASE2_STORE.metrics,
        ...(parsed.metrics ?? {}),
      },
    };
  } catch {
    return EMPTY_FASE2_STORE;
  }
}

export function saveFase2Store(store: Fase2Store) {
  if (typeof window === "undefined") return false;

  try {
    saveToStorage(FASE2_STORAGE_KEY, {
        ...store,
        updatedAt: new Date().toISOString(),
      });
    return true;
  } catch {
    return false;
  }
}

