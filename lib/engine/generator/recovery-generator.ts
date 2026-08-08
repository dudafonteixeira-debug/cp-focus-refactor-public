import type { EngineContext } from "@/lib/engine/types";
import type { PlanoTask } from "@/lib/planning/types";
import {
  generatedTask,
  normalizeText,
  safeId,
} from "@/lib/engine/generator/helpers";

export function generateRecoveryTasks(
  context: EngineContext
): PlanoTask[] {
  const erros = Array.isArray(context.erros)
    ? context.erros
    : [];

  const grupos = new Map<string, any[]>();

  for (const erro of erros) {
    const materia = String(
      erro?.materiaNome ||
      erro?.materia ||
      "Geral"
    ).trim();

    const key = normalizeText(materia);

    grupos.set(key, [
      ...(grupos.get(key) || []),
      erro,
    ]);
  }

  return [...grupos.values()]
    .filter((grupo) => grupo.length >= 2)
    .sort((a, b) => b.length - a.length)
    .slice(0, 2)
    .map((grupo) => {
      const primeiro = grupo[0];

      const materia = String(
        primeiro?.materiaNome ||
        primeiro?.materia ||
        "Geral"
      );

      const topico = String(
        primeiro?.topicoNome ||
        primeiro?.topico ||
        ""
      );

      const quantidade = grupo.length;

      return generatedTask({
        id: `auto-recovery-${context.data}-${safeId(materia)}`,
        materia,
        topico,
        titulo: `Corrigir pontos fracos de ${materia}`,
        tipo: "Correcao",
        prioridade: quantidade >= 5 ? "Alta" : "Media",
        score: 90 + Math.min(quantidade * 6, 40),
        minutos: Math.min(20 + quantidade * 3, 40),
        motivo: `${quantidade} erros registrados indicam necessidade de recuperacao nesta materia.`,
        categoriaGerada: "recuperacao",
        origemGerada: "banco_erros",
        sourceId: String(primeiro?.id || ""),
        sourceType: "erro",
        errosDetectados: quantidade,
      });
    });
}
