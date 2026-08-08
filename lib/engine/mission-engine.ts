import type {
  EngineContext,
  EngineMission,
} from "@/lib/engine/types";
import { calculateMissionScore } from "@/lib/engine/rules/mission-score";
import { applyRoutinePolicy } from "@/lib/engine/rules/routine-policy";

export function sortMissions(
  missions: EngineMission[],
  context: EngineContext
): EngineMission[] {
  return [...missions].sort((a, b) => {
    const difference =
      calculateMissionScore(b, context) -
      calculateMissionScore(a, context);

    if (difference !== 0) {
      return difference;
    }

    return a.ordem - b.ordem;
  });
}

function fitMissionsIntoAvailableTime(
  missions: EngineMission[],
  context: EngineContext
): EngineMission[] {
  const limite = Number(
    context.tempoDisponivelMinutos || 0
  );

  if (!limite) return missions;

  const concluidas = missions.filter(
    (mission) => mission.status === "concluida"
  );

  const pendentes = missions.filter(
    (mission) => mission.status !== "concluida"
  );

  const selecionadas: EngineMission[] = [];
  let minutos = 0;

  for (const mission of pendentes) {
    const duracao = Math.max(
      1,
      Number(mission.minutos || 0)
    );

    if (minutos + duracao <= limite) {
      selecionadas.push(mission);
      minutos += duracao;
      continue;
    }

    /*
     * Se nenhuma missao couber integralmente,
     * preservamos ao menos a mais importante.
     */
    if (!selecionadas.length) {
      selecionadas.push(mission);
      minutos += duracao;
    }
  }

  return [
    ...concluidas,
    ...selecionadas,
  ];
}

export function selectMissionsForToday(
  missions: EngineMission[],
  context: EngineContext
): EngineMission[] {
  const validas = missions.filter(
    (mission) =>
      mission.status !== "cancelada" &&
      mission.status !== "reagendada"
  );

  const sorted = sortMissions(
    validas,
    context
  );

  const balanced = applyRoutinePolicy(
    sorted,
    context
  );

  return fitMissionsIntoAvailableTime(
    balanced,
    context
  );
}

export function getNextMission(
  missions: EngineMission[]
): EngineMission | null {
  return (
    missions.find(
      (mission) =>
        mission.status === "em_execucao"
    ) ||
    missions.find(
      (mission) =>
        mission.status === "pendente"
    ) ||
    null
  );
}
