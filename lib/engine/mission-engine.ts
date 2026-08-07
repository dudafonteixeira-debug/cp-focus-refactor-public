import type { EngineContext, EngineMission } from "@/lib/engine/types";

function priorityWeight(priority: EngineMission["prioridade"]): number {
  if (priority === "Alta") return 300;
  if (priority === "Media") return 200;
  return 100;
}

function categoryWeight(category: EngineMission["categoria"]): number {
  switch (category) {
    case "recuperacao": return 90;
    case "revisao": return 80;
    case "questoes": return 70;
    case "estudo": return 60;
    case "flashcards": return 50;
    case "simulado": return 40;
    case "leitura": return 30;
    case "anotacao": return 20;
    case "descanso": return 10;
  }
}

function missionScore(mission: EngineMission): number {
  return (
    priorityWeight(mission.prioridade) +
    categoryWeight(mission.categoria) +
    Number(mission.score || 0)
  );
}

export function sortMissions(missions: EngineMission[]): EngineMission[] {
  return [...missions].sort((a, b) => {
    const scoreDiff = missionScore(b) - missionScore(a);
    if (scoreDiff !== 0) return scoreDiff;
    return a.ordem - b.ordem;
  });
}

function ensureCategoryPresence(
  selected: EngineMission[],
  available: EngineMission[],
  category: EngineMission["categoria"]
): EngineMission[] {
  if (selected.some((mission) => mission.categoria === category)) {
    return selected;
  }

  const candidate = available.find(
    (mission) =>
      mission.categoria === category &&
      mission.status !== "concluida" &&
      mission.status !== "cancelada"
  );

  if (!candidate) return selected;

  return [...selected, candidate];
}

export function selectMissionsForToday(
  missions: EngineMission[],
  context: EngineContext
): EngineMission[] {
  const sorted = sortMissions(
    missions.filter((mission) => mission.status !== "cancelada")
  );

  const limite = Number(context.tempoDisponivelMinutos || 0);
  if (!limite) return sorted;

  let selecionadas: EngineMission[] = [];
  let total = 0;

  for (const mission of sorted) {
    if (mission.concluida) {
      selecionadas.push(mission);
      continue;
    }

    const duracao = Number(mission.minutos || 0);

    if (total + duracao <= limite || selecionadas.length === 0) {
      selecionadas.push(mission);
      total += duracao;
    }
  }

  selecionadas = ensureCategoryPresence(selecionadas, sorted, "revisao");
  selecionadas = ensureCategoryPresence(selecionadas, sorted, "estudo");

  return sortMissions(
    Array.from(new Map(selecionadas.map((mission) => [mission.id, mission])).values())
  );
}

export function getNextMission(
  missions: EngineMission[]
): EngineMission | null {
  return missions.find(
    (mission) =>
      mission.status === "pendente" || mission.status === "em_execucao"
  ) || null;
}
