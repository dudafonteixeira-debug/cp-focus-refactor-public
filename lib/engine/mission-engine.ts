import type { EngineContext, EngineMission } from "@/lib/engine/types";
import { calculateMissionScore } from "@/lib/engine/rules/mission-score";
import { balanceMissions } from "@/lib/engine/rules/balance-rule";

export function sortMissions(
  missions: EngineMission[],
  context: EngineContext
): EngineMission[] {
  return [...missions].sort((a, b) => {
    const difference =
      calculateMissionScore(b, context) -
      calculateMissionScore(a, context);

    if (difference !== 0) return difference;

    return a.ordem - b.ordem;
  });
}

export function selectMissionsForToday(
  missions: EngineMission[],
  context: EngineContext
): EngineMission[] {
  const sorted = sortMissions(
    missions.filter((mission) => mission.status !== "cancelada"),
    context
  );

  const limite = Number(context.tempoDisponivelMinutos || 0);

  if (!limite) {
    return balanceMissions(sorted);
  }

  const concluidas = sorted.filter(
    (mission) => mission.status === "concluida"
  );

  const pendentes = sorted.filter(
    (mission) => mission.status !== "concluida"
  );

  const selecionadas: EngineMission[] = [];
  let minutos = 0;

  for (const mission of pendentes) {
    const duracao = Math.max(1, Number(mission.minutos || 0));

    if (
      minutos + duracao <= limite ||
      selecionadas.length === 0
    ) {
      selecionadas.push(mission);
      minutos += duracao;
    }
  }

  return [
    ...concluidas,
    ...balanceMissions(selecionadas),
  ];
}

export function getNextMission(
  missions: EngineMission[]
): EngineMission | null {
  return (
    missions.find(
      (mission) =>
        mission.status === "em_execucao" ||
        mission.status === "pendente"
    ) || null
  );
}
