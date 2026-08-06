export type ReviewGrade = 0 | 1 | 2 | 3 | 4 | 5;

export type ReviewOriginType = "conteudo" | "subtopico" | "questao";

export type ReviewStatus = "nova" | "aprendendo" | "revisao";

export type Fase2ReviewItem = {
  id: string;
  origemId: string;
  origemTipo: ReviewOriginType;
  materiaId?: string;
  materiaNome?: string;
  topicoId?: string;
  topicoNome?: string;
  subtopicoId?: string;
  subtopicoNome?: string;
  titulo: string;
  textoBase: string;
  tags: string[];
  status: ReviewStatus;
  easiness: number;
  intervaloDias: number;
  repeticoes: number;
  acertos: number;
  erros: number;
  ultimaRespostaEm: string | null;
  proximaRevisaoEm: string;
  criadoEm: string;
  atualizadoEm: string;
};

export type Fase2ReviewSession = {
  id: string;
  reviewItemId: string;
  grade: ReviewGrade;
  respondedAt: string;
};

export type GeneratedStudyBlock = {
  titulo: string;
  texto: string;
  tipo: "explicacao" | "resumo" | "analogia" | "mapa" | "questao";
};

export type GeneratedStudyPack = {
  id: string;
  origem: string;
  assunto: string;
  criadoEm: string;
  blocos: GeneratedStudyBlock[];
};

export type CespeQuestion = {
  id: string;
  enunciado: string;
  gabarito: "C" | "E";
  explicacao: string;
  assunto: string;
};

export type WeakTopic = {
  chave: string;
  materiaNome: string;
  topicoNome?: string;
  subtopicoNome?: string;
  erros: number;
  acertos: number;
  taxaAcerto: number;
};

export type Fase2Metrics = {
  revisoesHoje: number;
  revisoesAtrasadas: number;
  totalReviews: number;
  acertos: number;
  erros: number;
  taxaAcerto: number;
  sequenciaAcertos: number;
};

export type Fase2Store = {
  reviews: Fase2ReviewItem[];
  sessions: Fase2ReviewSession[];
  studyPacks: GeneratedStudyPack[];
  weakTopics: WeakTopic[];
  metrics: Fase2Metrics;
  updatedAt: string;
};
