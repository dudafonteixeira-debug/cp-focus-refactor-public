import { todayKey as getTodayKey, toLocalDateKey } from "@/lib/date-utils";
import {
  getPlanoDia,
  getPlanningBrain,
  savePlanoDia,
  savePlanningBrain,
} from "@/lib/data-access/app-repository";

export type PlanoDiaData<T = any> = {
  date: string;
  tasks: T[];
  updatedAt?: string;
};

export function todayKey(): string {
  return getTodayKey();
}

function arr<T = any>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export async function loadPlanoDia<T = any>(): Promise<T[]> {
  const saved = await getPlanoDia<PlanoDiaData<T> | null>(null);

  if (!saved || saved.date !== todayKey()) {
    return [];
  }

  return arr<T>(saved.tasks);
}

export async function persistPlanoDia<T = any>(
  tasks: T[]
): Promise<void> {
  await savePlanoDia<PlanoDiaData<T>>({
    date: todayKey(),
    tasks: arr<T>(tasks),
    updatedAt: new Date().toISOString(),
  });

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("cp-focus-plano-dia-updated", {
        detail: tasks,
      })
    );
  }
}

export async function loadPlanningBrain<T>(
  fallback: T
): Promise<T> {
  return getPlanningBrain<T>(fallback);
}

export async function persistPlanningBrain<T>(
  brain: T
): Promise<void> {
  await savePlanningBrain<T>(brain);

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("cp-focus-planning-brain-updated", {
        detail: brain,
      })
    );
  }
}
