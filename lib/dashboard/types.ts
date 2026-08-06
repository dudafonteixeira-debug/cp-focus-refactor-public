export type DashboardTask = {
  id: string;
  materiaId?: string | number;
  topicoId?: string | number;
  subtopicoId?: string | number;
  materia: string;
  topico: string;
  titulo: string;
  tipo: "Estudo" | "Revisao" | "Correcao";
  prioridade: "Alta" | "Media" | "Baixa";
  score: number;
  minutos: number;
  concluida: boolean;
  motivo: string;
};

export type DashboardAnalytics = {
  minutosEstudadosHoje: number;
  totalSessoesHoje: number;
  mediaSessaoHoje: number;
  materiaMaisEstudada: string;
};

export type DashboardStats = {
  totalSubtopicos: number;
  estudados: number;
  erros: number;
  progressoDia: number;
  minutosTotais: number;
  minutosFeitos: number;
};

import type { AdaptiveMateriaScore } from "@/lib/adaptive/engine";
import type { Fase2ReviewItem } from "@/lib/fase2-types";

export type DashboardPlanningBrain = {
  concurso?: string;
};

export type DashboardViewModel = {
  adaptiveRadar: AdaptiveMateriaScore[];
  analyticsHoje: DashboardAnalytics;
  appVazio: boolean;
  abrirTask: (task: DashboardTask) => void;
  brain: DashboardPlanningBrain | null;
  carregar: () => Promise<void>;
  comecarDia: () => void;
  concluidas: DashboardTask[];
  concluirTask: (taskId: string) => Promise<void>;
  diaConcluido: boolean;
  error: string | null;
  materias: unknown[];
  pendentes: DashboardTask[];
  proxima: DashboardTask | null;
  revisoesPendentes: Fase2ReviewItem[];
  semPlano: boolean;
  stats: DashboardStats;
  tasks: DashboardTask[];
};
