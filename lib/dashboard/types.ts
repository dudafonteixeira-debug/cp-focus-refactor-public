import type { EngineMission } from "@/lib/engine";
import type { AdaptiveMateriaScore } from "@/lib/adaptive/engine";
import type { Fase2ReviewItem } from "@/lib/fase2-types";

export type DashboardTask = EngineMission;

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
  mensagemLyra: string;
  pendentes: DashboardTask[];
  proxima: DashboardTask | null;
  proximasMissoes: DashboardTask[];
  revisoesPendentes: Fase2ReviewItem[];
  semPlano: boolean;
  stats: DashboardStats;
  tasks: DashboardTask[];
};
