"use client";

import { PlanningView } from "@/components/planning/planning-view";
import { usePlanning } from "@/hooks/use-planning";

export default function PlanejamentoInteligentePage() {
  return <PlanningView {...usePlanning()} />;
}
