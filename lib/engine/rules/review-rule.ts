import type { EngineContext, EngineMission } from "@/lib/engine/types";

export function getReviewWeight(
  mission: EngineMission,
  context: EngineContext
): number {
  if (mission.categoria !== "revisao") return 0;

  const revisoes = Array.isArray(context.revisoes)
    ? context.revisoes
    : [];

  const relacionadas = revisoes.filter((review: any) => {
    const materia =
      String(review.materiaNome || review.materia || "")
        .toLowerCase()
        .trim();

    return materia === String(mission.materia || "")
      .toLowerCase()
      .trim();
  });

  if (!relacionadas.length) return 20;

  const hoje = context.data;

  const vencidas = relacionadas.filter((review: any) => {
    const data =
      review.proximaRevisao ||
      review.nextReviewAt ||
      review.dataRevisao ||
      review.agendadaPara;

    if (!data) return false;

    return String(data).slice(0, 10) <= hoje;
  });

  if (vencidas.length >= 3) return 110;
  if (vencidas.length >= 1) return 70;

  return 25;
}
