import type {
  EngineContext,
  EngineMission,
} from "@/lib/engine/types";

function normalize(value: unknown): string {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function mesmaMateria(
  mission: EngineMission,
  value: unknown
): boolean {
  return normalize(mission.materia) === normalize(value);
}

function contarRevisoesVencidas(
  mission: EngineMission,
  context: EngineContext
): number {
  const reviews = Array.isArray(context.revisoes)
    ? context.revisoes
    : [];

  return reviews.filter((review: any) => {
    const materia =
      review?.materiaNome ||
      review?.materia;

    if (!mesmaMateria(mission, materia)) {
      return false;
    }

    if (review?.ultimaRespostaEm) {
      return false;
    }

    const data =
      review?.proximaRevisaoEm ||
      review?.proximaRevisao ||
      review?.dataRevisao;

    return (
      Boolean(data) &&
      String(data).slice(0, 10) <= context.data
    );
  }).length;
}

function contarErros(
  mission: EngineMission,
  context: EngineContext
): number {
  const erros = Array.isArray(context.erros)
    ? context.erros
    : [];

  return erros.filter((erro: any) =>
    mesmaMateria(
      mission,
      erro?.materiaNome || erro?.materia
    )
  ).length;
}

function contarFlashcardsFracos(
  mission: EngineMission,
  context: EngineContext
): number {
  const flashcards = Array.isArray(context.flashcards)
    ? context.flashcards
    : [];

  return flashcards.filter((card: any) => {
    if (
      !mesmaMateria(
        mission,
        card?.materiaNome || card?.materia
      )
    ) {
      return false;
    }

    return (
      card?.ultimaNota === "dificil" ||
      card?.ultimaNota === "regular"
    );
  }).length;
}

export function explainMissionDecision(
  mission: EngineMission,
  context: EngineContext
): string {
  const revisoes = contarRevisoesVencidas(
    mission,
    context
  );

  const erros = contarErros(
    mission,
    context
  );

  const flashcards = contarFlashcardsFracos(
    mission,
    context
  );

  const radar = context.radar?.find(
    (item) =>
      normalize(item.materia) ===
      normalize(mission.materia)
  );

  if (
    mission.categoria === "recuperacao" &&
    erros > 0
  ) {
    return `${mission.materia} entrou agora porque existem ${erros} erro(s) registrados. O objetivo desta missao e corrigir a causa dos erros antes de continuar avancando no conteudo.`;
  }

  if (
    mission.categoria === "revisao" &&
    revisoes > 0
  ) {
    return `Esta revisao foi priorizada porque existem ${revisoes} revisao(oes) vencida(s) em ${mission.materia}. Recuperar esse conteudo agora reduz o risco de esquecimento.`;
  }

  if (
    mission.categoria === "flashcards" &&
    flashcards > 0
  ) {
    return `${flashcards} flashcard(s) de ${mission.materia} apresentaram dificuldade recente. Esta sessao foi antecipada para reforcar a memoria antes que a retencao caia mais.`;
  }

  if (radar?.nivel === "critica") {
    return `${mission.materia} aparece como area critica no seu desempenho recente. Por isso o CP Focus aumentou sua prioridade na rotina de hoje.`;
  }

  if (
    context.energia === "baixa" &&
    mission.minutos <= 30
  ) {
    return `Sua energia esta baixa. Esta missao foi posicionada agora por ser mais curta e adequada ao seu nivel de energia atual.`;
  }

  if (
    context.tempoDisponivelMinutos &&
    mission.minutos <=
      context.tempoDisponivelMinutos
  ) {
    return `Esta missao cabe no tempo que voce tem disponivel e possui boa prioridade para o momento atual.`;
  }

  if (
    mission.origem !== "planejamento"
  ) {
    return mission.motivo ||
      "Esta missao foi criada automaticamente a partir do seu desempenho recente.";
  }

  return mission.motivo ||
    `Esta missao faz parte da estrategia planejada para ${mission.materia} e foi mantida na melhor posicao para o seu ciclo de hoje.`;
}

export function explainDayDecision(
  missions: EngineMission[],
  context: EngineContext
): string {
  const pending = missions.filter(
    (mission) =>
      mission.status !== "concluida"
  );

  if (!pending.length) {
    return "O ciclo planejado para hoje foi concluido.";
  }

  const automaticas = pending.filter(
    (mission) =>
      mission.origem !== "planejamento"
  );

  const recuperacoes = automaticas.filter(
    (mission) =>
      mission.categoria === "recuperacao"
  ).length;

  const revisoes = automaticas.filter(
    (mission) =>
      mission.categoria === "revisao"
  ).length;

  if (recuperacoes || revisoes) {
    return `Reorganizei o restante do dia com base no seu aprendizado real. Foram mantidas ${pending.length} missao(oes) pendentes, incluindo ${recuperacoes} recuperacao(oes) e ${revisoes} revisao(oes) priorizada(s).`;
  }

  if (context.energia === "baixa") {
    return "A rotina foi ajustada para reduzir carga cognitiva enquanto sua energia estiver baixa.";
  }

  return `Seu ciclo atual tem ${pending.length} missao(oes). A ordem considera desempenho, retencao, erros, tempo disponivel e equilibrio da rotina.`;
}
