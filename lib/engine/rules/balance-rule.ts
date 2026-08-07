import type { EngineMission } from "@/lib/engine/types";

export function balanceMissions(
  missions: EngineMission[]
): EngineMission[] {
  if (missions.length <= 2) return missions;

  const result: EngineMission[] = [];
  const remaining = [...missions];

  let lastCategory: EngineMission["categoria"] | null = null;
  let repeated = 0;

  while (remaining.length) {
    let index = 0;

    if (lastCategory && repeated >= 2) {
      const alternative = remaining.findIndex(
        (mission) => mission.categoria !== lastCategory
      );

      if (alternative >= 0) {
        index = alternative;
      }
    }

    const [mission] = remaining.splice(index, 1);

    if (mission.categoria === lastCategory) {
      repeated += 1;
    } else {
      lastCategory = mission.categoria;
      repeated = 1;
    }

    result.push(mission);
  }

  return result;
}
