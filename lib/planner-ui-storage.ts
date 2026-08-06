import { loadFromStorage, saveToStorage } from "@/lib/storage-core";

export type PlannerBlockOverride = {
  materiaId: string;
  materiaNome: string;
  tempo: number;
  cor: string;
};

export type RegisteredSession = {
  id: string;
  blockId: string;
  materiaNome: string;
  topicTitle: string;
  date: string;
  difficulty: number;
  timeMinutes: number;
  questionsTotal: number;
  questionsCorrect: number;
};

export type PlannerUIState = {
  overrides: Record<string, PlannerBlockOverride>;
  sessions: RegisteredSession[];
  completedBlockIds: string[];
};

const KEY = "cp-focus-planner-ui";

function baseState(): PlannerUIState {
  return {
    overrides: {},
    sessions: [],
    completedBlockIds: [],
  };
}

export function loadPlannerUI(): PlannerUIState {
  const parsed = loadFromStorage<Partial<PlannerUIState>>(KEY, baseState());

  return {
    overrides:
      parsed?.overrides &&
      typeof parsed.overrides === "object" &&
      !Array.isArray(parsed.overrides)
        ? parsed.overrides
        : {},
    sessions: Array.isArray(parsed?.sessions) ? parsed.sessions : [],
    completedBlockIds: Array.isArray(parsed?.completedBlockIds)
      ? parsed.completedBlockIds
      : [],
  };
}

export function savePlannerUI(data: PlannerUIState) {
  saveToStorage(KEY, data);
}
