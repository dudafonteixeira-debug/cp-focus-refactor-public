import type { EngineContext, EngineMission } from "@/lib/engine/types";

function normalize(value: unknown): string {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function sameMateria(
  mission: EngineMission,
  value: unknown
): boolean {
  return normalize(mission.materia) === normalize(value);
}

function reviewUrgency(
  mission: EngineMission,
  context: EngineContext
): number {
  const revisoes = Array.isArray(context.revisoes)
    ? context.revisoes
    : [];

  const relacionadas = revisoes.filter((review: any) =>
    sameMateria(
      mission,
      review?.materiaNome || review?.materia
    )
  );

  if (!relacionadas.length) return 0;

  const vencidas = relacionadas.filter((review: any) => {
    if (review?.ultimaRespostaEm) return false;

    const data =
      review?.proximaRevisaoEm ||
      review?.proximaRevisao ||
      review?.dataRevisao;

    return (
      data &&
      String(data).slice(0, 10) <= context.data
    );
  });

  if (vencidas.length >= 4) return 100;
  if (vencidas.length >= 2) return 70;
  if (vencidas.length === 1) return 40;

  return 0;
}

function errorUrgency(
  mission: EngineMission,
  context: EngineContext
): number {
  const erros = Array.isArray(context.erros)
    ? context.erros
    : [];

  const relacionados = erros.filter((erro: any) =>
    sameMateria(
      mission,
      erro?.materiaNome || erro?.materia
    )
  );

  if (!relacionados.length) return 0;

  const reincidentes = relacionados.filter(
    (erro: any) =>
      erro?.reincidente === true ||
      Number(erro?.reincidencias || 0) >= 2 ||
      Number(erro?.quantidadeErros || 0) >= 2
  );

  if (reincidentes.length >= 3) return 130;
  if (reincidentes.length >= 1) return 90;
  if (relacionados.length >= 5) return 80;
  if (relacionados.length >= 2) return 45;

  return 15;
}

function questionPerformance(
  mission: EngineMission,
  context: EngineContext
): number {
  const questoes = Array.isArray(context.questoes)
    ? context.questoes
    : [];

  const relacionadas = questoes
    .filter((questao: any) =>
      sameMateria(
        mission,
        questao?.materiaNome || questao?.materia
      )
    )
    .slice(-30);

  if (relacionadas.length < 3) return 0;

  const erradas = relacionadas.filter(
    (questao: any) => questao?.acertou === false
  ).length;

  const taxaErro = erradas / relacionadas.length;

  if (taxaErro >= 0.7) return 100;
  if (taxaErro >= 0.5) return 70;
  if (taxaErro >= 0.35) return 35;

  if (taxaErro <= 0.15) return -20;

  return 0;
}

function flashcardRetention(
  mission: EngineMission,
  context: EngineContext
): number {
  const flashcards = Array.isArray(context.flashcards)
    ? context.flashcards
    : [];

  const relacionados = flashcards.filter((card: any) =>
    sameMateria(
      mission,
      card?.materiaNome || card?.materia
    )
  );

  if (!relacionados.length) return 0;

  const fracos = relacionados.filter(
    (card: any) =>
      card?.ultimaNota === "dificil" ||
      card?.ultimaNota === "regular"
  ).length;

  const vencidos = relacionados.filter((card: any) => {
    const data = card?.proximaRevisao;

    return (
      data &&
      String(data).slice(0, 10) <= context.data
    );
  }).length;

  const impacto = fracos * 8 + vencidos * 4;

  return Math.min(impacto, 80);
}

function simulationPerformance(
  mission: EngineMission,
  context: EngineContext
): number {
  const simulados = Array.isArray(context.simulados)
    ? context.simulados
    : [];

  const taxas: number[] = [];

  for (const simulado of simulados.slice(-10)) {
    const questoes = Array.isArray(simulado?.questoes)
      ? simulado.questoes
      : [];

    const respostas = simulado?.respostas || {};

    const relacionadas = questoes.filter((questao: any) =>
      sameMateria(
        mission,
        questao?.materiaNome || questao?.materia
      )
    );

    if (!relacionadas.length) continue;

    const acertos = relacionadas.filter(
      (questao: any) =>
        respostas[questao.id] === questao.correta
    ).length;

    taxas.push(acertos / relacionadas.length);
  }

  if (!taxas.length) return 0;

  const media =
    taxas.reduce((acc, value) => acc + value, 0) /
    taxas.length;

  if (media < 0.4) return 100;
  if (media < 0.6) return 65;
  if (media < 0.75) return 30;
  if (media >= 0.9) return -20;

  return 0;
}

function radarWeight(
  mission: EngineMission,
  context: EngineContext
): number {
  const item = context.radar?.find((radar) =>
    sameMateria(mission, radar.materia)
  );

  if (!item) return 0;

  if (item.nivel === "critica") return 120;
  if (item.nivel === "media") return 35;

  return -15;
}

function energyFit(
  mission: EngineMission,
  context: EngineContext
): number {
  if (!context.energia || context.energia === "normal") {
    return 0;
  }

  if (context.energia === "baixa") {
    if (mission.minutos >= 50) return -70;
    if (mission.minutos >= 35) return -35;

    if (
      mission.categoria === "revisao" ||
      mission.categoria === "flashcards"
    ) {
      return 30;
    }
  }

  if (context.energia === "alta") {
    if (
      mission.categoria === "estudo" ||
      mission.categoria === "questoes" ||
      mission.categoria === "simulado"
    ) {
      return 30;
    }
  }

  return 0;
}

function durationFit(
  mission: EngineMission,
  context: EngineContext
): number {
  const disponivel = Number(
    context.tempoDisponivelMinutos || 0
  );

  if (!disponivel) return 0;

  if (mission.minutos > disponivel) {
    return -120;
  }

  if (mission.minutos <= disponivel * 0.35) {
    return 15;
  }

  return 0;
}

export function getAdaptivePriorityWeight(
  mission: EngineMission,
  context: EngineContext
): number {
  return (
    reviewUrgency(mission, context) +
    errorUrgency(mission, context) +
    questionPerformance(mission, context) +
    flashcardRetention(mission, context) +
    simulationPerformance(mission, context) +
    radarWeight(mission, context) +
    energyFit(mission, context) +
    durationFit(mission, context)
  );
}
