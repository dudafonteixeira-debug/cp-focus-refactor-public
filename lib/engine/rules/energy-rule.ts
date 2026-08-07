import type { EngineContext, EngineMission } from "@/lib/engine/types";

export function getEnergyWeight(
  mission: EngineMission,
  context: EngineContext
): number {
  if (!context.energia || context.energia === "normal") {
    return 0;
  }

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
