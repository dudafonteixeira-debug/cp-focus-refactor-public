import type { DashboardTask } from "@/lib/dashboard/types";

type DashboardMissionCardProps = {
  mission: DashboardTask;
  abrirTask: (task: DashboardTask) => void;
  concluirTask: (taskId: string) => Promise<void>;
};

function categoriaLabel(categoria: DashboardTask["categoria"]) {
  switch (categoria) {
    case "estudo": return "Estudo";
    case "revisao": return "Revisao";
    case "questoes": return "Questoes";
    case "flashcards": return "Flashcards";
    case "simulado": return "Simulado";
    case "recuperacao": return "Recuperacao";
    case "descanso": return "Descanso";
    case "leitura": return "Leitura";
    case "anotacao": return "Anotacao";
  }
}

export function DashboardMissionCard({
  mission,
  abrirTask,
  concluirTask,
}: DashboardMissionCardProps) {
  return (
    <article className="rounded-[34px] border border-cyan-300/30 bg-[linear-gradient(135deg,rgba(34,211,238,.12),rgba(59,130,246,.08),rgba(9,14,42,.98))] p-6 shadow-[0_24px_90px_rgba(34,211,238,.12)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="cp-os-badge-green">Sua missao agora</span>

          <h2 className="mt-4 text-3xl font-black tracking-tight text-white md:text-4xl">
            {mission.titulo}
          </h2>

          <p className="mt-2 text-sm text-slate-300">
            {mission.materia}
            {mission.topico ? ` - ${mission.topico}` : ""}
          </p>
        </div>

        <div className="rounded-[22px] border border-white/10 bg-black/20 px-5 py-4 text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Duracao
          </p>

          <strong className="mt-1 block text-2xl text-white">
            {mission.minutos} min
          </strong>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <span className="cp-os-badge-blue">
          {categoriaLabel(mission.categoria)}
        </span>

        <span className="cp-os-badge-purple">
          Prioridade {mission.prioridade}
        </span>

        {mission.origem ? (
          <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-black text-slate-300">
            {mission.origem.replace("_", " ")}
          </span>
        ) : null}
      </div>

      <div className="mt-5 rounded-[24px] border border-white/10 bg-black/20 p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200">
          Por que esta missao?
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-200">
          {mission.explicacaoDecisao || mission.motivo || "Esta e a proxima acao recomendada para sua rotina de hoje."}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => abrirTask(mission)}
          className="cp-os-btn-primary"
        >
          Iniciar missao
        </button>

        <button
          type="button"
          onClick={() => concluirTask(mission.id)}
          className="cp-os-btn-focus"
        >
          Marcar concluida
        </button>
      </div>
    </article>
  );
}

