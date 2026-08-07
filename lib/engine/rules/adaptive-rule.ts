import type { EngineContext, EngineMission } from "@/lib/engine/types";

function normalize(value: unknown): string {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function getAdaptiveWeight(
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
