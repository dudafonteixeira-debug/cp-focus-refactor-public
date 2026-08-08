import type { EngineContext } from "@/lib/engine/types";
import type { PlanoTask } from "@/lib/planning/types";
import {
  generatedTask,
  normalizeText,
  safeId,
} from "@/lib/engine/generator/helpers";

export function generateReviewTasks(
  context: EngineContext
): PlanoTask[] {
  const reviews = Array.isArray(context.revisoes)
    ? context.revisoes
    : [];

  const vencidas = reviews.filter((review: any) => {
    if (review?.ultimaRespostaEm) return false;

    const data =
      review?.proximaRevisaoEm ||
      review?.proximaRevisao ||
      review?.dataRevisao;

    if (!data) return false;

    return String(data).slice(0, 10) <= context.data;
  });

  const grupos = new Map<string, any[]>();

  for (const review of vencidas) {
    const materia = String(
      review?.materiaNome ||
      review?.materia ||
      "Geral"
    ).trim();

    const key = normalizeText(materia);

    grupos.set(key, [
      ...(grupos.get(key) || []),
      review,
    ]);
  }

  return [...grupos.values()].slice(0, 3).map((grupo) => {
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
      id: `auto-review-${context.data}-${safeId(materia)}`,
      materia,
      topico,
      titulo:
        quantidade > 1
          ? `Revisar ${materia} (${quantidade} itens)`
          : `Revisar ${materia}`,
      tipo: "Revisao",
      prioridade: quantidade >= 3 ? "Alta" : "Media",
      score: 70 + Math.min(quantidade * 8, 30),
      minutos: Math.min(15 + quantidade * 5, 35),
      motivo:
        quantidade > 1
          ? `Existem ${quantidade} revisoes vencidas desta materia.`
          : "Existe uma revisao vencida que precisa entrar no ciclo de memoria.",
      categoriaGerada: "revisao",
      origemGerada: "revisao",
      sourceId: String(primeiro?.id || ""),
      sourceType: "review",
    });
  });
}
