import {
  loadPlanningBrain,
  persistPlanningBrain,
} from "@/lib/planning-state";
import type {
  PlanningBrain,
  Prioridade,
} from "@/lib/planning/types";

export const PLANNING_DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"];

export function asArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? value : [];
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function prioridadeScore(value: Prioridade) {
  if (value === "Alta") return 90;
  if (value === "Media") return 50;
  return 20;
}

export function buildPlanningBrain(appData: any): PlanningBrain {
  const materias = asArray<any>(appData?.materias).map((materia, index) => ({
    materiaId: String(materia.id),
    nome: materia.nome || `Materia ${index + 1}`,
    ativa: true,
    peso: 3,
    ordem: index + 1,
    prioridade: "Media" as Prioridade,
  }));

  return {
    concurso: "",
    horasDia: "2",
    diasSemana: ["Seg", "Ter", "Qua", "Qui", "Sex"],
    periodo: "Noite",
    materias,
  };
}

export async function loadPlanningConfig(appData: any): Promise<PlanningBrain> {
  const base = buildPlanningBrain(appData);
  const saved = await loadPlanningBrain<Partial<PlanningBrain> | null>(null);

  if (!saved) return base;

  return {
    concurso: saved.concurso || base.concurso,
    horasDia: saved.horasDia || base.horasDia,
    diasSemana: asArray<string>(saved.diasSemana).length
      ? asArray<string>(saved.diasSemana)
      : base.diasSemana,
    periodo: saved.periodo || base.periodo,
    materias: base.materias.map((materia) => {
      const antiga = asArray<any>(saved.materias).find(
        (item) => String(item.materiaId) === String(materia.materiaId),
      );
      return antiga ? { ...materia, ...antiga } : materia;
    }),
  };
}

export async function savePlanningConfig(brain: PlanningBrain) {
  await persistPlanningBrain(brain);
}
