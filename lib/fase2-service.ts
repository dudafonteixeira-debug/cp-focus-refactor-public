import { buildMetrics, buildWeakTopics } from "@/lib/performance-metrics";
import { buildReviewSeedFromApp, mergeReviewSeeds } from "@/lib/review-sync";
import { loadFase2Store, saveFase2Store } from "@/lib/fase2-storage";
import { scheduleNextReview, todayIsoDate } from "@/lib/spaced-repetition";
import { generateStudyPack } from "@/lib/ai-study-engine";
import { generateCespeQuestions } from "@/lib/cespe-generator";
import type {
  Fase2ReviewItem,
  Fase2ReviewSession,
  GeneratedStudyPack,
  ReviewGrade,
} from "@/lib/fase2-types";

function refreshComputedState(store: ReturnType<typeof loadFase2Store>) {
  return {
    ...store,
    weakTopics: buildWeakTopics(store.reviews),
    metrics: buildMetrics(store.reviews, store.sessions),
    updatedAt: new Date().toISOString(),
  };
}

export function getFase2State() {
  return refreshComputedState(loadFase2Store());
}

export function syncFase2ReviewsFromApp() {
  const store = loadFase2Store();
  const incoming = buildReviewSeedFromApp();

  const next = refreshComputedState({
    ...store,
    reviews: mergeReviewSeeds(store.reviews, incoming),
  });

  saveFase2Store(next);
  return next;
}

export function getTodayReviewQueue() {
  const store = refreshComputedState(loadFase2Store());
  const hoje = todayIsoDate();

  return store.reviews
    .filter((item) => item.proximaRevisaoEm <= hoje)
    .sort((a, b) => a.proximaRevisaoEm.localeCompare(b.proximaRevisaoEm));
}

export function answerReview(reviewItemId: string, grade: ReviewGrade) {
  const store = loadFase2Store();

  const reviews = store.reviews.map((item) =>
    item.id === reviewItemId ? scheduleNextReview(item, grade) : item
  );

  const session: Fase2ReviewSession = {
    id: `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    reviewItemId,
    grade,
    respondedAt: new Date().toISOString(),
  };

  const next = refreshComputedState({
    ...store,
    reviews,
    sessions: [...store.sessions, session],
  });

  saveFase2Store(next);
  return next;
}

export function createStudyPack(assunto: string, origem = "manual") {
  const store = loadFase2Store();
  const pack = generateStudyPack(assunto, origem);

  const next = refreshComputedState({
    ...store,
    studyPacks: [pack, ...store.studyPacks].slice(0, 20),
  });

  saveFase2Store(next);
  return pack;
}

export function createCespePack(assunto: string, quantidade = 5) {
  return generateCespeQuestions(assunto, quantidade);
}


export function createManualReview(payload: {
  titulo: string;
  textoBase: string;
  materiaId?: string;
  materiaNome?: string;
  topicoId?: string;
  topicoNome?: string;
  subtopicoId?: string;
  subtopicoNome?: string;
  tags?: string[];
  origemId?: string;
  origemTipo?: "conteudo" | "subtopico" | "questao";
}) {
  const store = loadFase2Store();
  const now = new Date().toISOString();

  const item: Fase2ReviewItem = {
    id: `review_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    origemId: payload.origemId || `manual_${Date.now()}`,
    origemTipo: payload.origemTipo || "conteudo",
    materiaId: payload.materiaId,
    materiaNome: payload.materiaNome,
    topicoId: payload.topicoId,
    topicoNome: payload.topicoNome,
    subtopicoId: payload.subtopicoId,
    subtopicoNome: payload.subtopicoNome,
    titulo: payload.titulo || "Revisao manual",
    textoBase: payload.textoBase || "",
    tags: payload.tags || ["manual"],
    status: "nova",
    easiness: 2.5,
    intervaloDias: 0,
    repeticoes: 0,
    acertos: 0,
    erros: 0,
    ultimaRespostaEm: null,
    proximaRevisaoEm: todayIsoDate(),
    criadoEm: now,
    atualizadoEm: now,
  };

  const next = refreshComputedState({
    ...store,
    reviews: [item, ...store.reviews],
  });

  saveFase2Store(next);
  return next;
}

export function undoReview(reviewItemId: string) {
  const store = loadFase2Store();
  const now = new Date().toISOString();

  const reviews = store.reviews.map((item) =>
    item.id === reviewItemId
      ? {
          ...item,
          status: "revisao" as const,
          ultimaRespostaEm: null,
          proximaRevisaoEm: todayIsoDate(),
          atualizadoEm: now,
        }
      : item
  );

  const next = refreshComputedState({
    ...store,
    reviews,
    sessions: store.sessions.filter((session) => session.reviewItemId !== reviewItemId),
  });

  saveFase2Store(next);
  return next;
}


export function deleteReview(reviewItemId: string) {
  const store = loadFase2Store();

  const next = refreshComputedState({
    ...store,
    reviews: store.reviews.filter((item) => item.id !== reviewItemId),
    sessions: store.sessions.filter((session) => session.reviewItemId !== reviewItemId),
  });

  saveFase2Store(next);
  return next;
}

export function resetFase2() {
  const next = refreshComputedState({
    reviews: [],
    sessions: [],
    studyPacks: [],
    weakTopics: [],
    metrics: {
      revisoesHoje: 0,
      revisoesAtrasadas: 0,
      totalReviews: 0,
      acertos: 0,
      erros: 0,
      taxaAcerto: 0,
      sequenciaAcertos: 0,
    },
    updatedAt: new Date().toISOString(),
  });

  saveFase2Store(next);
  return next;
}
