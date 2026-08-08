export type Prioridade = "Alta" | "Media" | "Baixa";
export type TipoTask = "Estudo" | "Revisao" | "Correcao";

export type BrainMateria = {
  materiaId: string;
  nome: string;
  ativa: boolean;
  peso: number;
  ordem: number;
  prioridade: Prioridade;
};

export type PlanningBrain = {
  concurso: string;
  horasDia: string;
  diasSemana: string[];
  periodo: string;
  materias: BrainMateria[];
};

export type PlanoTask = {
  id: string;
  materiaId?: string | number;
  topicoId?: string | number;
  subtopicoId?: string | number;
  materia: string;
  topico: string;
  titulo: string;
  tipo: TipoTask;
  prioridade: Prioridade;
  score: number;
  minutos: number;
  concluida: boolean;
  motivo: string;
  errosDetectados?: number;
  adaptativoNivel?: string;
  categoriaGerada?: string;
  origemGerada?: string;
  sourceId?: string;
  sourceType?: string;
};

export type PlanningViewModel = {
  brain: PlanningBrain | null;
  capacidadeMinutos: number;
  concluidas: PlanoTask[];
  configAberta: boolean;
  dias: string[];
  gerarPlanoDoDia: () => Promise<void>;
  continuarDia: () => void;
  abrirTask: (task: PlanoTask) => void;
  concluirTask: (taskId: string) => Promise<void>;
  materiasAtivas: BrainMateria[];
  mensagemLyra: string;
  mounted: boolean;
  novaMateria: string;
  pendentes: PlanoTask[];
  progressoDia: number;
  setConfigAberta: (value: boolean) => void;
  setNovaMateria: (value: string) => void;
  tasks: PlanoTask[];
  toggleDia: (dia: string) => void;
  updateBrain: (next: PlanningBrain) => Promise<void>;
  updateMateria: (materiaId: string, patch: Partial<BrainMateria>) => void;
  adicionarMateriaManual: () => Promise<void>;
};

