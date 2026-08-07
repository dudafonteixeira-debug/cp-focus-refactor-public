import type { AdaptiveMateriaScore } from "@/lib/adaptive/engine";
import type { PlanoTask } from "@/lib/planning/types";

export type MissionCategory =
  | "estudo"
  | "revisao"
  | "questoes"
  | "flashcards"
  | "simulado"
  | "recuperacao"
  | "descanso"
  | "leitura"
  | "anotacao";

export type MissionStatus =
  | "pendente"
  | "em_execucao"
  | "pausada"
  | "concluida"
  | "reagendada"
  | "cancelada";

export type MissionOrigin =
  | "planejamento"
  | "revisao"
  | "banco_erros"
  | "questoes"
  | "flashcards"
  | "simulado"
  | "lyra"
  | "usuario"
  | "automatica";

export type EnergyLevel = "baixa" | "normal" | "alta";

export type EngineMission = PlanoTask & {
  categoria: MissionCategory;
  status: MissionStatus;
  origem: MissionOrigin;
  ordem: number;
  energiaRecomendada?: EnergyLevel;
  criadoEm?: string;
  iniciadoEm?: string;
  concluidoEm?: string;
  sourceId?: string;
  sourceType?: string;
};

export type EngineContext = {
  data: string;
  tempoDisponivelMinutos?: number;
  energia?: EnergyLevel;
  sessoes?: any[];
  revisoes?: any[];
  erros?: any[];
  flashcards?: any[];
  questoes?: any[];
  simulados?: any[];
  radar?: AdaptiveMateriaScore[];
};

export type EngineResult = {
  data: string;
  missions: EngineMission[];
  pendentes: EngineMission[];
  concluidas: EngineMission[];
  proxima: EngineMission | null;
  minutosPlanejados: number;
  minutosPendentes: number;
  progresso: number;
  mensagemLyra: string;
};
