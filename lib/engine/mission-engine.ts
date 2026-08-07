import type { EngineContext, EngineMission } from "@/lib/engine/types";

function priorityWeight(priority: EngineMission["prioridade"]): number {
  if (priority === "Alta") return 300;
  if (priority === "Media") return 200;
  return 100;
}

function categoryWeight(category: EngineMission["categoria"]): number {
  switch (category) {
    case "recuperacao": return 100;
    case "revisao": return 90;
    case "questoes": return 75;
    case "estudo": return 60;
    case "flashcards": return 50;
    case "simulado": return 40;
    case "leitura": return 30;
    case "anotacao": return 20;
    case "descanso": return 10;
  }
}

function normalize(value: unknown): string {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function adaptiveWeight(
  mission: EngineMission,
  context: EngineContext
): number {
  const materia = normalize(mission.materia);

  const radar = context.radar?.find(
    (item) => normalize(item.materia) === materia
  );

  if (!radar) return 0;

  if (radar.nivel === "critica") return 120;
  if (radar.nivel === "media") return 30;

  return -10;
}

function energyWeight(
  mission: EngineMission,
  context: EngineContext
): number {
  if (!context.energia || context.energia === "normal") return 0;

  if (context.energia === "baixa") {
    if (mission.categoria === "revisao") return 30;
    if (mission.categoria === "flashcards") return 25;
    if (mission.categoria === "recuperacao") return 15;
    if (mission.minutos >= 45) return -40;
  }

  if (context.energia === "alta") {
    if (mission.categoria === "estudo") return 30;
    if (mission.categoria === "questoes") return 20;
    if (mission.categoria === "simulado") return 20;
  }

  return 0;
}

function missionScore(
  mission: EngineMission,
  context: EngineContext
): number {
  return (
    priorityWeight(mission.prioridade) +
    categoryWeight(mission.categoria) +
    adaptiveWeight(mission, context) +
    energyWeight(mission, context) +
    Number(mission.score || 0)
  );
}

export function sortMissions(
  missions: EngineMission[],
  context: EngineContext
): EngineMission[] {
  return [...missions].sort((a, b) => {
    const difference =
      missionScore(b, context) - missionScore(a, context);

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

  if (!limite) return sorted;

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

  return [...concluidas, ...selecionadas];
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
