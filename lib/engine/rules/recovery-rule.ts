import type { EngineContext, EngineMission } from "@/lib/engine/types";

export function getRecoveryWeight(
  mission: EngineMission,
  context: EngineContext
): number {
  if (mission.categoria !== "recuperacao") return 0;

  const erros = Array.isArray(context.erros)
    ? context.erros
    : [];

  const relacionados = erros.filter((erro: any) => {
    const materia =
      String(erro.materiaNome || erro.materia || "")
        .toLowerCase()
        .trim();

    return materia === String(mission.materia || "")
      .toLowerCase()
      .trim();
  });

  if (!relacionados.length) return 30;

  const reincidentes = relacionados.filter((erro: any) => {
    return (
      Number(erro.reincidencias || 0) >= 2 ||
      Number(erro.quantidadeErros || 0) >= 2 ||
      erro.reincidente === true
    );
  });

  if (reincidentes.length >= 3) return 150;
  if (reincidentes.length >= 1) return 110;
  if (relacionados.length >= 3) return 80;

  return 50;
}
