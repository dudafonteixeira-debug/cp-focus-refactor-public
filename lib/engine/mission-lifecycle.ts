import { getTodayMissions } from "@/lib/engine/engine";
import type { EngineResult } from "@/lib/engine/types";
import {
  loadPlanoDia,
  persistPlanoDia,
} from "@/lib/planning-state";
import type { PlanoTask } from "@/lib/planning/types";

export type FinishMissionInput = {
  missionId: string;
  nota?: string;
};

export type FinishMissionResult = EngineResult & {
  completionApplied: boolean;
};

const completionsInFlight = new Map<
  string,
  Promise<FinishMissionResult>
>();

async function executeFinishMission(
  input: FinishMissionInput
): Promise<FinishMissionResult> {
  const tasks = await loadPlanoDia<PlanoTask>();

  const current = tasks.find(
    (task) => String(task.id) === String(input.missionId)
  );

  if (!current) {
    const result = await getTodayMissions();

    return {
      ...result,
      completionApplied: false,
    };
  }

  if (current.concluida) {
    const result = await getTodayMissions();

    return {
      ...result,
      completionApplied: false,
    };
  }

  const updated = tasks.map((task) =>
    String(task.id) === String(input.missionId)
      ? {
          ...task,
          concluida: true,
          concluidaEm: new Date().toISOString(),
          ...(input.nota
            ? { notaSessao: input.nota }
            : {}),
        }
      : task
  );

  await persistPlanoDia(updated);

  const result = await getTodayMissions();

  return {
    ...result,
    completionApplied: true,
  };
}

export async function finishMission(
  input: FinishMissionInput
): Promise<FinishMissionResult> {
  const key = String(input.missionId);

  const existing = completionsInFlight.get(key);

  if (existing) {
    const result = await existing;

    return {
      ...result,
      completionApplied: false,
    };
  }

  const operation = executeFinishMission(input);

  completionsInFlight.set(key, operation);

  try {
    return await operation;
  } finally {
    completionsInFlight.delete(key);
  }
}

export async function reopenMission(
  missionId: string
): Promise<EngineResult> {
  const tasks = await loadPlanoDia<PlanoTask>();

  const current = tasks.find(
    (task) => String(task.id) === String(missionId)
  );

  if (!current || !current.concluida) {
    return getTodayMissions();
  }

  const updated = tasks.map((task) =>
    String(task.id) === String(missionId)
      ? {
          ...task,
          concluida: false,
          concluidaEm: undefined,
          notaSessao: undefined,
          statusEngine: "pendente" as const,
          reagendadaEm: undefined,
          motivoReagendamento: undefined,
        }
      : task
  );

  await persistPlanoDia(updated);

  return getTodayMissions();
}

export async function replanMission(
  missionId: string,
  motivo: string
): Promise<EngineResult> {
  const tasks = await loadPlanoDia<PlanoTask>();

  const current = tasks.find(
    (task) => String(task.id) === String(missionId)
  );

  if (!current || current.concluida) {
    return getTodayMissions();
  }

  if (current.statusEngine === "reagendada") {
    return getTodayMissions();
  }

  const updated = tasks.map((task) =>
    String(task.id) === String(missionId)
      ? {
          ...task,
          statusEngine: "reagendada" as const,
          reagendadaEm: new Date().toISOString(),
          motivoReagendamento: motivo,
        }
      : task
  );

  await persistPlanoDia(updated);

  return getTodayMissions();
}

