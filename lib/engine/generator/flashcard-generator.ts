import type { EngineContext } from "@/lib/engine/types";
import type { PlanoTask } from "@/lib/planning/types";
import {
  generatedTask,
  normalizeText,
  safeId,
} from "@/lib/engine/generator/helpers";

export function generateFlashcardTasks(
  context: EngineContext
): PlanoTask[] {
  const flashcards = Array.isArray(context.flashcards)
    ? context.flashcards
    : [];

  const candidatos = flashcards.filter((card: any) => {
    const vencido =
      !card?.proximaRevisao ||
      String(card.proximaRevisao).slice(0, 10) <= context.data;

    const dificil =
      card?.ultimaNota === "dificil" ||
      card?.ultimaNota === "regular";

    return vencido || dificil;
  });

  const grupos = new Map<string, any[]>();

  for (const card of candidatos) {
    const materia = String(
      card?.materiaNome ||
      card?.materia ||
      "Geral"
    ).trim();

    const key = normalizeText(materia);

    grupos.set(key, [
      ...(grupos.get(key) || []),
      card,
    ]);
  }

  return [...grupos.values()]
    .filter((grupo) => grupo.length >= 3)
    .sort((a, b) => b.length - a.length)
    .slice(0, 2)
    .map((grupo) => {
      const primeiro = grupo[0];

      const materia = String(
        primeiro?.materiaNome ||
        primeiro?.materia ||
        "Geral"
      );

      const quantidade = grupo.length;

      return generatedTask({
        id: `auto-flashcards-${context.data}-${safeId(materia)}`,
        materia,
        topico: String(primeiro?.deck || ""),
        titulo: `Revisar flashcards de ${materia}`,
        tipo: "Revisao",
        prioridade: quantidade >= 10 ? "Alta" : "Media",
        score: 55 + Math.min(quantidade * 3, 35),
        minutos: Math.min(10 + quantidade, 25),
        motivo: `${quantidade} flashcards estao vencidos ou apresentaram dificuldade recente.`,
        categoriaGerada: "flashcards",
        origemGerada: "flashcards",
        sourceId: String(primeiro?.id || ""),
        sourceType: "flashcard",
      });
    });
}
