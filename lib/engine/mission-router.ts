import type { EngineMission } from "@/lib/engine/types";

function studyRoute(mission: EngineMission): string {
  if (
    mission.materiaId &&
    mission.topicoId &&
    mission.subtopicoId
  ) {
    return `/materias/${mission.materiaId}/${mission.topicoId}/${mission.subtopicoId}`;
  }

  return "/materias";
}

function queryContext(mission: EngineMission): string {
  const params = new URLSearchParams();

  if (mission.materia) {
    params.set("materia", mission.materia);
  }

  if (mission.topico) {
    params.set("topico", mission.topico);
  }

  params.set("origem", "engine");
  params.set("missionId", mission.id);

  return params.toString();
}

export function getMissionRoute(
  mission: EngineMission
): string {
  const query = queryContext(mission);

  switch (mission.categoria) {
    case "revisao":
      return `/revisao-inteligente?${query}&auto=true`;

    case "questoes":
    case "recuperacao":
      return `/questoes?${query}`;

    case "flashcards":
      return `/flashcards?${query}`;

    case "simulado":
      return `/simulados?${query}`;

    case "estudo":
    case "leitura":
    case "anotacao":
      return studyRoute(mission);

    case "descanso":
      return `/modo-foco?missionId=${encodeURIComponent(mission.id)}&modo=descanso`;
  }
}

