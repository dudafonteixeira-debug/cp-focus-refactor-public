import type { EngineContext } from "@/lib/engine/types";
import type { PlanoTask } from "@/lib/planning/types";
import {
  generatedTask,
  normalizeText,
  safeId,
} from "@/lib/engine/generator/helpers";

export function generateQuestionTasks(
  context: EngineContext
): PlanoTask[] {
  const questoes = Array.isArray(context.questoes)
    ? context.questoes
    : [];

  const grupos = new Map<string, any[]>();

  for (const questao of questoes.slice(-100)) {
    const materia = String(
      questao?.materiaNome ||
      questao?.materia ||
      "Geral"
    ).trim();

    const key = normalizeText(materia);

    grupos.set(key, [
      ...(grupos.get(key) || []),
      questao,
    ]);
  }

  return [...grupos.values()]
    .map((grupo) => {
      const total = grupo.length;

      const erros = grupo.filter(
        (item) => item?.acertou === false
      ).length;

      return {
        grupo,
        total,
        erros,
        taxaErro: total ? erros / total : 0,
      };
    })
    .filter(
      (item) =>
        item.total >= 3 &&
        item.taxaErro >= 0.4
    )
    .sort((a, b) => b.taxaErro - a.taxaErro)
    .slice(0, 2)
    .map(({ grupo, total, erros, taxaErro }) => {
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

      return generatedTask({
        id: `auto-questions-${context.data}-${safeId(materia)}`,
        materia,
        topico,
        titulo: `Treino de questoes - ${materia}`,
        tipo: "Correcao",
        prioridade: taxaErro >= 0.6 ? "Alta" : "Media",
        score: 65 + Math.round(taxaErro * 50),
        minutos: 25,
        motivo: `${erros} erros em ${total} questoes recentes indicam necessidade de treino direcionado.`,
        categoriaGerada: "questoes",
        origemGerada: "questoes",
        sourceId: String(primeiro?.id || ""),
        sourceType: "questao",
        errosDetectados: erros,
      });
    });
}
