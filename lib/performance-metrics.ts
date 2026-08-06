import type {
  Fase2Metrics,
  Fase2ReviewItem,
  Fase2ReviewSession,
  WeakTopic,
} from "@/lib/fase2-types";
import { isDue, todayIsoDate } from "@/lib/spaced-repetition";

export function buildMetrics(
  reviews: Fase2ReviewItem[],
  sessions: Fase2ReviewSession[]
): Fase2Metrics {
  const hoje = todayIsoDate();
  const revisoesHoje = reviews.filter((r) => r.proximaRevisaoEm <= hoje).length;
  const revisoesAtrasadas = reviews.filter((r) => r.proximaRevisaoEm < hoje).length;
  const acertos = reviews.reduce((acc, item) => acc + item.acertos, 0);
  const erros = reviews.reduce((acc, item) => acc + item.erros, 0);
  const total = acertos + erros;
  const taxaAcerto = total > 0 ? Math.round((acertos / total) * 100) : 0;

  let sequenciaAcertos = 0;
  const ordered = [...sessions].sort((a, b) => a.respondedAt.localeCompare(b.respondedAt)).reverse();
  for (const item of ordered) {
    if (item.grade >= 3) sequenciaAcertos += 1;
    else break;
  }

  return {
    revisoesHoje,
    revisoesAtrasadas,
    totalReviews: reviews.length,
    acertos,
    erros,
    taxaAcerto,
    sequenciaAcertos,
  };
}

export function buildWeakTopics(reviews: Fase2ReviewItem[]): WeakTopic[] {
  const bucket = new Map<string, WeakTopic>();

  reviews.forEach((item) => {
    const chave = `${item.materiaNome ?? "Sem matéria"}|${item.topicoNome ?? ""}|${item.subtopicoNome ?? ""}`;
    const atual = bucket.get(chave) ?? {
      chave,
      materiaNome: item.materiaNome ?? "Sem matéria",
      topicoNome: item.topicoNome,
      subtopicoNome: item.subtopicoNome,
      erros: 0,
      acertos: 0,
      taxaAcerto: 0,
    };

    atual.erros += item.erros;
    atual.acertos += item.acertos;
    const total = atual.erros + atual.acertos;
    atual.taxaAcerto = total > 0 ? Math.round((atual.acertos / total) * 100) : 0;

    bucket.set(chave, atual);
  });

  return Array.from(bucket.values())
    .filter((item) => item.erros > 0)
    .sort((a, b) => {
      if (a.taxaAcerto !== b.taxaAcerto) return a.taxaAcerto - b.taxaAcerto;
      return b.erros - a.erros;
    })
    .slice(0, 10);
}
