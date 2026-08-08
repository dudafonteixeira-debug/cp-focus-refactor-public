import type {
  EngineContext,
  EngineMission,
  MissionCategory,
} from "@/lib/engine/types";

type CategoryLimits = Partial<
  Record<MissionCategory, number>
>;

const AUTOMATIC_LIMITS: CategoryLimits = {
  revisao: 2,
  recuperacao: 2,
  questoes: 2,
  flashcards: 1,
  simulado: 1,
};

function isAutomatic(mission: EngineMission): boolean {
  return mission.origem !== "planejamento";
}

function categoryCount(
  missions: EngineMission[],
  category: MissionCategory
): number {
  return missions.filter(
    (mission) => mission.categoria === category
  ).length;
}

function shouldAcceptAutomaticMission(
  mission: EngineMission,
  accepted: EngineMission[]
): boolean {
  if (!isAutomatic(mission)) return true;

  const limit = AUTOMATIC_LIMITS[mission.categoria];

  if (!limit) return true;

  return (
    categoryCount(accepted, mission.categoria) <
    limit
  );
}

function avoidCategoryLoop(
  missions: EngineMission[]
): EngineMission[] {
  const remaining = [...missions];
  const result: EngineMission[] = [];

  while (remaining.length) {
    let index = 0;

    const last = result[result.length - 1];
    const beforeLast = result[result.length - 2];

    const repeating =
      last &&
      beforeLast &&
      last.categoria === beforeLast.categoria;

    if (repeating) {
      const alternative = remaining.findIndex(
        (mission) =>
          mission.categoria !== last.categoria
      );

      if (alternative >= 0) {
        index = alternative;
      }
    }

    const [selected] = remaining.splice(index, 1);
    result.push(selected);
  }

  return result;
}

function protectNewStudy(
  missions: EngineMission[]
): EngineMission[] {
  const studyIndex = missions.findIndex(
    (mission) =>
      mission.categoria === "estudo" &&
      mission.origem === "planejamento"
  );

  if (studyIndex < 0 || studyIndex <= 3) {
    return missions;
  }

  const result = [...missions];
  const [study] = result.splice(studyIndex, 1);

  result.splice(Math.min(3, result.length), 0, study);

  return result;
}

function protectLowEnergy(
  missions: EngineMission[],
  context: EngineContext
): EngineMission[] {
  if (context.energia !== "baixa") {
    return missions;
  }

  return [...missions].sort((a, b) => {
    const heavyA =
      a.categoria === "simulado" ||
      a.minutos >= 50;

    const heavyB =
      b.categoria === "simulado" ||
      b.minutos >= 50;

    if (heavyA === heavyB) return 0;

    return heavyA ? 1 : -1;
  });
}

export function applyRoutinePolicy(
  missions: EngineMission[],
  context: EngineContext
): EngineMission[] {
  const concluded = missions.filter(
    (mission) => mission.status === "concluida"
  );

  const pending = missions.filter(
    (mission) => mission.status !== "concluida"
  );

  const accepted: EngineMission[] = [];

  for (const mission of pending) {
    if (
      shouldAcceptAutomaticMission(
        mission,
        accepted
      )
    ) {
      accepted.push(mission);
    }
  }

  let ordered = protectLowEnergy(
    accepted,
    context
  );

  ordered = avoidCategoryLoop(ordered);
  ordered = protectNewStudy(ordered);

  return [...concluded, ...ordered];
}
