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

export async function finishMission(
  input: FinishMissionInput
): Promise<EngineResult> {
  const tasks = await loadPlanoDia<PlanoTask>();

  const updated = tasks.map((task) =>
    task.id === input.missionId
      ? {
          ...task,
          concluida: true,
          concluidaEm: new Date().toISOString(),
          ...(input.nota ? { notaSessao: input.nota } : {}),
        }
      : task
  );

  await persistPlanoDia(updated);

  return getTodayMissions();
}

export async function reopenMission(
  missionId: string
): Promise<EngineResult> {
  const tasks = await loadPlanoDia<PlanoTask>();

  const updated = tasks.map((task) =>
    task.id === missionId
      ? {
          ...task,
          concluida: false,
          concluidaEm: undefined,
        }
      : task
  );

  await persistPlanoDia(updated);

  return getTodayMissions();
}
