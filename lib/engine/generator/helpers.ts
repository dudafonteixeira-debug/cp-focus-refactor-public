import type { PlanoTask, Prioridade } from "@/lib/planning/types";

export function normalizeText(value: unknown): string {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function safeId(value: unknown): string {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function generatedTask(input: {
  id: string;
  materia: string;
  topico?: string;
  titulo: string;
  tipo: PlanoTask["tipo"];
  prioridade: Prioridade;
  score: number;
  minutos: number;
  motivo: string;
  categoriaGerada: string;
  origemGerada: string;
  sourceId?: string;
  sourceType?: string;
  errosDetectados?: number;
}): PlanoTask {
  return {
    id: input.id,
    materia: input.materia || "Geral",
    topico: input.topico || "",
    titulo: input.titulo,
    tipo: input.tipo,
    prioridade: input.prioridade,
    score: input.score,
    minutos: input.minutos,
    concluida: false,
    motivo: input.motivo,
    categoriaGerada: input.categoriaGerada,
    origemGerada: input.origemGerada,
    sourceId: input.sourceId,
    sourceType: input.sourceType,
    errosDetectados: input.errosDetectados,
  };
}
