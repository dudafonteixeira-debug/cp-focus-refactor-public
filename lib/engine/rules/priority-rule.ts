import type { EngineMission } from "@/lib/engine/types";

export function getPriorityWeight(
  priority: EngineMission["prioridade"]
): number {
  if (priority === "Alta") return 300;
  if (priority === "Media") return 200;
  return 100;
}

export function getCategoryWeight(
  category: EngineMission["categoria"]
): number {
  switch (category) {
    case "recuperacao":
      return 100;
    case "revisao":
      return 90;
    case "questoes":
      return 75;
    case "estudo":
      return 60;
    case "flashcards":
      return 50;
    case "simulado":
      return 40;
    case "leitura":
      return 30;
    case "anotacao":
      return 20;
    case "descanso":
      return 10;
  }
}
