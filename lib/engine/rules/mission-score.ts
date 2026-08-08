import type { EngineContext, EngineMission } from "@/lib/engine/types";
import { getAdaptivePriorityWeight } from "@/lib/engine/rules/adaptive-priority";
import { getAdaptiveWeight } from "@/lib/engine/rules/adaptive-rule";
import { getEnergyWeight } from "@/lib/engine/rules/energy-rule";
import {
  getCategoryWeight,
  getPriorityWeight,
} from "@/lib/engine/rules/priority-rule";
import { getRecoveryWeight } from "@/lib/engine/rules/recovery-rule";
import { getReviewWeight } from "@/lib/engine/rules/review-rule";

export function calculateMissionScore(
  mission: EngineMission,
  context: EngineContext
): number {
  return (
    getPriorityWeight(mission.prioridade) +
    getCategoryWeight(mission.categoria) +
    getAdaptiveWeight(mission, context) +
    getEnergyWeight(mission, context) +
    getRecoveryWeight(mission, context) +
    getReviewWeight(mission, context) +
    getAdaptivePriorityWeight(mission, context) +
    Number(mission.score || 0)
  );
}
