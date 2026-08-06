import type { PlanoTask } from "@/lib/planning/types";

type Props = {
  pendentes: PlanoTask[];
  gerarPlanoDoDia: () => Promise<void>;
  abrirTask: (task: PlanoTask) => void;
  concluirTask: (taskId: string) => Promise<void>;
};

function Insight({ task }: { task: PlanoTask }) {
  const texto = Number(task.errosDetectados || 0) > 0
    ? "A Lyra aumentou a prioridade desta tarefa porque encontrou erros recentes e sinais de dificuldade neste assunto."
    : task.adaptativoNivel === "critica"
      ? "A Lyra detectou fragilidade recente nesta materia e aumentou a urgencia de revisao."
      : "A Lyra manteve esta tarefa em prioridade normal com base no seu desempenho recente.";

  return (
    <div className="group relative mt-2">
      <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-400/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-cyan-100">
        <span>Lyra insight</span><span className="flex h-5 w-5 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-400/10 text-[10px]">?</span>
      </div>
      <div className="pointer-events-none absolute left-0 top-10 z-20 w-[320px] translate-y-2 rounded-2xl border border-cyan-300/15 bg-[rgba(10,14,32,.96)] p-4 text-xs leading-6 text-slate-200 opacity-0 shadow-[0_24px_80px_rgba(0,0,0,.45)] backdrop-blur-xl transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">{texto}</div>
    </div>
  );
}

export function PlanningExecution({ pendentes, gerarPlanoDoDia, abrirTask, concluirTask }: Props) {
  return (
    <section className="rounded-[34px] border border-cyan-300/15 bg-[linear-gradient(135deg,rgba(20,32,88,.94),rgba(9,14,42,.98))] p-6 shadow-[0_28px_100px_rgba(0,0,0,.45)]">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="cp-os-badge-blue">Linha de execucao</span>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-white">Ordem calculada do dia</h2>
          <p className="mt-2 text-sm text-slate-300">A ordem considera peso, prioridade, erros, pendencias e carga disponivel.</p>
        </div>
        <button type="button" onClick={() => void gerarPlanoDoDia()} className="cp-os-btn-soft">Recalcular com cerebro atual</button>
      </div>

      {pendentes.length ? (
        <div className="space-y-3">
          {pendentes.map((task, index) => (
            <article key={task.id} className="rounded-[26px] border border-white/10 bg-white/[0.045] p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex min-w-0 flex-1 items-start gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/[0.08] text-sm font-black text-white">{String(index + 1).padStart(2, "0")}</span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="cp-os-badge-blue">{task.prioridade}</span>
                      <span className="cp-os-badge-purple">{task.tipo}</span>
                      <span className="cp-os-badge">{task.minutos}min</span>
                      {String(task.motivo).includes("erro") ? <span className="rounded-full border border-rose-300/30 bg-rose-500/15 px-3 py-1 text-xs font-black text-rose-100">Erros detectados</span> : null}
                      {task.adaptativoNivel === "critica" ? <span className="rounded-full border border-orange-300/30 bg-orange-500/15 px-3 py-1 text-xs font-black text-orange-100">Prioridade adaptativa</span> : null}
                      {task.adaptativoNivel === "forte" ? <span className="rounded-full border border-emerald-300/30 bg-emerald-500/15 px-3 py-1 text-xs font-black text-emerald-100">Materia forte</span> : null}
                    </div>
                    <h3 className="mt-3 text-xl font-black text-white">{task.titulo}</h3>
                    <p className="mt-1 text-sm text-slate-300">{task.materia} - {task.topico}</p>
                    <Insight task={task} />
                    {String(task.motivo).includes("erro") ? <div className="mt-3 rounded-2xl border border-cyan-300/15 bg-cyan-400/10 px-4 py-3 text-xs leading-5 text-cyan-50"><strong>Lyra ajustou a ordem:</strong> foram encontrados erros recentes neste assunto.</div> : null}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => abrirTask(task)} className="cp-os-btn-primary">Abrir</button>
                  <button type="button" onClick={() => void concluirTask(task.id)} className="cp-os-btn-focus">Concluir</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : <div className="cp-os-empty"><strong>Nenhum plano pendente</strong> Clique em Gerar plano do dia para criar a linha de execucao.</div>}
    </section>
  );
}
