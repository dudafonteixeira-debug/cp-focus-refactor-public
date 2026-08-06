import { todayKey as getTodayKey, toLocalDateKey } from "@/lib/date-utils";
import type { UiReview } from "@/lib/revisao-inteligente/types";

export function uid() {
  return Date.now().toString() + "_" + Math.random().toString(36).slice(2, 8);
}

export function todayIso() {
  return getTodayKey();
}

function addDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toLocalDateKey(d);
}

export function arr<T = any>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export function toText(value: any): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(toText).filter(Boolean).join("\n\n");
  if (typeof value === "object") {
    return value.texto || value.conteudo || value.resposta || value.explicacao || value.enunciado || "";
  }
  return String(value);
}

export function reviewToUi(item: any): UiReview {
  return {
    id: item.id,
    materia: item.materiaNome || "Sem materia",
    topico: item.topicoNome || "Sem topico",
    subtopico: item.subtopicoNome || "",
    titulo: item.titulo || "Revisao",
    textoBase: item.textoBase || "",
    proxima: item.proximaRevisaoEm || todayIso(),
    ultimaRespostaEm: item.ultimaRespostaEm,
    acertos: item.acertos || 0,
    erros: item.erros || 0,
    raw: item,
  };
}

export function gradeLabel(grade: number) {
  if (grade <= 1) return "Nao lembrei";
  if (grade === 2) return "Lembranca fraca";
  if (grade === 3) return "Lembranca media";
  if (grade === 4) return "Lembrei bem";
  return "Lembrei facil";
}

export function gradeColor(grade: number) {
  if (grade <= 1) return "border-rose-300/30 bg-rose-500/15 text-rose-100";
  if (grade === 2) return "border-orange-300/30 bg-orange-500/15 text-orange-100";
  if (grade === 3) return "border-amber-300/30 bg-amber-500/15 text-amber-100";
  if (grade === 4) return "border-violet-300/30 bg-violet-500/15 text-violet-100";
  return "border-emerald-300/30 bg-emerald-500/15 text-emerald-100";
}

export function nextDateByGrade(grade: number) {
  if (grade <= 1) return addDays(1);
  if (grade === 2) return addDays(3);
  if (grade === 3) return addDays(7);
  if (grade === 4) return addDays(15);
  return addDays(30);
}
