import Link from "next/link";
import type { DashboardViewModel } from "@/lib/dashboard/types";

type DashboardDayPlanProps = Pick<DashboardViewModel, "abrirTask" | "concluirTask" | "proxima" | "semPlano" | "tasks">;

export function DashboardDayPlan({ abrirTask, concluirTask, proxima, semPlano, tasks }: DashboardDayPlanProps) {
  const executarTask = abrirTask;

  if (semPlano) {
    return (
      <section className="rounded-[34px] border border-yellow-300/20 bg-yellow-400/10 p-6">
        <h2 className="text-2xl font-black text-yellow-100">Plano do dia ainda nao foi gerado</h2>
        <p className="mt-2 text-sm leading-7 text-yellow-50/80">Abra o Planejamento OS, confira pesos e prioridades, e gere a linha de execucao do dia.</p>
        <Link href="/planejamento-inteligente" className="cp-os-btn-primary mt-5">Ir para Planejamento</Link>
      </section>
    );
  }

  return (
    <section className="rounded-[34px] border border-cyan-300/15 bg-[linear-gradient(135deg,rgba(20,32,88,.94),rgba(9,14,42,.98))] p-6 shadow-[0_28px_100px_rgba(0,0,0,.45)]">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="cp-os-badge-blue">Linha do dia</span>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-white">Execucao em ordem</h2>
          <p className="mt-2 text-sm text-slate-300">Siga a primeira tarefa pendente. Ao concluir, volte para continuar.</p>
        </div>
        <Link href="/planejamento-inteligente" className="cp-os-btn-soft">Recalcular</Link>
      </div>

      {proxima ? (
        <article className="mb-5 rounded-[30px] border border-cyan-300/30 bg-cyan-400/10 p-5 shadow-[0_18px_70px_rgba(56,189,248,.14)]">
          <span className="cp-os-badge-green">Proxima tarefa</span>
          <h3 className="mt-3 text-3xl font-black text-white">{proxima.titulo}</h3>
          <p className="mt-2 text-sm text-slate-300">{proxima.materia} - {proxima.topico}</p>
          <p className="mt-2 text-xs text-cyan-100">{proxima.tipo} - {proxima.prioridade} - {proxima.minutos}min</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={() => executarTask(proxima)} className="cp-os-btn-primary">Executar tarefa</button>
            <button type="button" onClick={() => abrirTask(proxima)} className="cp-os-btn-soft">Abrir material</button>
            <button type="button" onClick={() => concluirTask(proxima.id)} className="cp-os-btn-focus">Marcar concluida</button>
          </div>
        </article>
      ) : null}

      <div className="overflow-x-auto pb-2">
        <div className="grid min-w-[900px] grid-cols-6 gap-3">
          {tasks.slice(0, 6).map((task, index) => (
            <button
              key={task.id}
              type="button"
              onClick={() => abrirTask(task)}
              className={
                task.concluida
                  ? "rounded-[24px] border border-emerald-300/20 bg-emerald-400/10 p-4 text-left"
                  : index === 0 && !task.concluida
                    ? "rounded-[24px] border border-cyan-300/30 bg-cyan-400/10 p-4 text-left"
                    : "rounded-[24px] border border-white/10 bg-white/[0.045] p-4 text-left"
              }
            >
              <div className="flex items-center justify-between">
                <span className="grid h-9 w-9 place-items-center rounded-2xl bg-white/[0.08] text-sm font-black text-white">{String(index + 1).padStart(2, "0")}</span>
                <span className={task.concluida ? "text-xs font-black text-emerald-200" : "text-xs font-black text-cyan-200"}>{task.concluida ? "OK" : task.tipo}</span>
              </div>
              <h3 className="mt-4 line-clamp-2 text-sm font-black text-white">{task.titulo}</h3>
              <p className="mt-2 text-xs leading-5 text-slate-300">{task.materia}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
