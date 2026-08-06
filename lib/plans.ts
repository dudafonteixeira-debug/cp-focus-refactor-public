export type AppFeature =
  | "materias"
  | "missoes"
  | "revisao_inteligente"
  | "modo_prova"
  | "dashboard"
  | "evolucao"
  | "gamificacao"
  | "modo_cp"
  | "gerador_questoes"
  | "simulado_ia"
  | "desempenho_ia"
  | "uploads"
  | "backup_nuvem"
  | "sincronizacao"
  | "exportacao";

export type AppPlan = "free" | "premium_sem_ia" | "premium_com_ia";

export type PlanDefinition = {
  id: AppPlan;
  nome: string;
  preco: number;
  descricao: string;
  recursos: string[];
  usaIA: boolean;
  features: AppFeature[];
};

export const APP_PLANS: Record<AppPlan, PlanDefinition> = {
  free: {
    id: "free",
    nome: "Gratuito",
    preco: 0,
    descricao:
      "Ideal para organizar os estudos manualmente e conhecer a plataforma.",
    recursos: [
      "Dashboard basico",
      "Centro de estudos",
      "Materias e subtopicos",
      "Planejamento manual",
      "Flashcards basicos",
    ],
    usaIA: false,
    features: ["materias", "dashboard"],
  },

  premium_sem_ia: {
    id: "premium_sem_ia",
    nome: "Premium",
    preco: 39.9,
    descricao:
      "Sistema operacional completo de estudos sem uso de inteligencia artificial.",
    recursos: [
      "Planejamento inteligente",
      "Revisao inteligente",
      "Modo foco",
      "Gamificacao completa",
      "Dashboard avancado",
      "Modo prova",
      "Estatisticas de evolucao",
      "Exportacoes",
      "Missoes e rotina adaptativa",
      "Pomodoro premium",
    ],
    usaIA: false,
    features: [
      "materias",
      "missoes",
      "revisao_inteligente",
      "modo_prova",
      "dashboard",
      "evolucao",
      "gamificacao",
      "exportacao",
    ],
  },

  premium_com_ia: {
    id: "premium_com_ia",
    nome: "Ultra IA",
    preco: 59.9,
    descricao:
      "Experiencia completa do CP Focus com Lyra e recursos inteligentes adaptativos.",
    recursos: [
      "Tudo do Premium",
      "Lyra integrada",
      "Gerador de questoes IA",
      "Simulados inteligentes",
      "Diagnostico adaptativo",
      "Modo CP inteligente",
      "Planejamento adaptativo IA",
      "Analise de desempenho",
      "Sugestoes automaticas de estudo",
      "Recursos IA premium",
    ],
    usaIA: true,
    features: [
      "materias",
      "missoes",
      "revisao_inteligente",
      "modo_prova",
      "dashboard",
      "evolucao",
      "gamificacao",
      "modo_cp",
      "gerador_questoes",
      "simulado_ia",
      "desempenho_ia",
      "exportacao",
    ],
  },
};

export const PLANOS = APP_PLANS;