"use client";

import Link from "next/link";
import type { DashboardViewModel } from "@/lib/dashboard/types";
import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardMetrics } from "@/components/dashboard/dashboard-metrics";

export function DashboardView({
  adaptiveRadar,
  analyticsHoje,
  appVazio,
  abrirTask,
  brain,
  comecarDia,
  concluidas,
  concluirTask,
  diaConcluido,
  error,
  materias,
  pendentes,
  proxima,
  revisoesPendentes: revisoesPendentesDashboard,
  semPlano,
  stats,
  tasks,
}: DashboardViewModel) {

  const {
    mediaSessaoHoje,
    materiaMaisEstudada,
    minutosEstudadosHoje,
    totalSessoesHoje,
  } = analyticsHoje;

  const executarTask = abrirTask;

  return (
    <main className="cp-os-page">
      <section className="mx-auto flex w-full max-w-[1280px] flex-col gap-5 px-4 py-5 md:px-6">
        {error ? (
          <div className="rounded-2xl border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm font-semibold text-rose-100">
            {error}
          </div>
        ) : null}
        {appVazio ? (
          <DashboardEmptyState />
        ) : (
          <>
            <DashboardHeader
              comecarDia={comecarDia}
              diaConcluido={diaConcluido}
              semPlano={semPlano}
            />

            <DashboardMetrics brain={brain} concluidas={concluidas} materias={materias} minutosEstudadosHoje={minutosEstudadosHoje} pendentes={pendentes} stats={stats} tasks={tasks} />

            <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="cp-os-badge-blue">Analytics</span>
                  <h2 className="mt-3 text-2xl font-black text-white">Desempenho do dia</h2>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-4">
                <div className="rounded-[22px] border border-cyan-300/20 bg-cyan-400/10 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200">Tempo</p>
                  <strong className="mt-2 block text-2xl text-white">{minutosEstudadosHoje}min</strong>
                  <p className="mt-1 text-xs text-slate-300">tempo real estudado</p>
                </div>

                <div className="rounded-[22px] border border-white/10 bg-white/[0.055] p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Sessoes</p>
                  <strong className="mt-2 block text-2xl text-white">{totalSessoesHoje}</strong>
                  <p className="mt-1 text-xs text-slate-300">concluidas hoje</p>
                </div>

                <div className="rounded-[22px] border border-violet-300/20 bg-violet-400/10 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-200">Media</p>
                  <strong className="mt-2 block text-2xl text-white">{mediaSessaoHoje}min</strong>
                  <p className="mt-1 text-xs text-slate-300">por sessao</p>
                </div>

                <div className="rounded-[22px] border border-emerald-300/20 bg-emerald-400/10 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-200">Materia foco</p>
                  <strong className="mt-2 block line-clamp-1 text-xl text-white">{materiaMaisEstudada}</strong>
                  <p className="mt-1 text-xs text-slate-300">mais estudada hoje</p>
                </div>
              </div>
            </section>

            <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="cp-os-badge-purple">Adaptive AI</span>
                  <h2 className="mt-3 text-2xl font-black text-white">
                    Radar adaptativo
                  </h2>

                  <p className="mt-2 text-sm text-slate-300">
                    O sistema esta identificando automaticamente materias fortes e fracas.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {adaptiveRadar.map((item: any) => (
                  <article
                    key={item.materia}
                    className={
                      item.nivel === "critica"
                        ? "rounded-[24px] border border-rose-300/20 bg-rose-400/10 p-4"
                        : item.nivel === "forte"
                        ? "rounded-[24px] border border-emerald-300/20 bg-emerald-400/10 p-4"
                        : "rounded-[24px] border border-amber-300/20 bg-amber-400/10 p-4"
                    }
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-white/70">
                          {item.nivel}
                        </p>

                        <h3 className="mt-2 text-xl font-black text-white">
                          {item.materia}
                        </h3>
                      </div>

                      <div className="rounded-2xl bg-black/20 px-3 py-2 text-right">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/60">
                          Score
                        </p>

                        <strong className="text-xl text-white">
                          {item.score}
                        </strong>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-2xl bg-black/15 p-2">
                        <p className="text-[10px] uppercase tracking-[0.15em] text-white/60">
                          Tempo
                        </p>

                        <strong className="text-sm text-white">
                          {item.tempoEstudadoMin}m
                        </strong>
                      </div>

                      <div className="rounded-2xl bg-black/15 p-2">
                        <p className="text-[10px] uppercase tracking-[0.15em] text-white/60">
                          Revisoes
                        </p>

                        <strong className="text-sm text-white">
                          {item.revisoes}
                        </strong>
                      </div>

                      <div className="rounded-2xl bg-black/15 p-2">
                        <p className="text-[10px] uppercase tracking-[0.15em] text-white/60">
                          Erros
                        </p>

                        <strong className="text-sm text-white">
                          {item.erros}
                        </strong>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {semPlano ? (
              <section className="rounded-[34px] border border-yellow-300/20 bg-yellow-400/10 p-6">
                <h2 className="text-2xl font-black text-yellow-100">Plano do dia ainda nao foi gerado</h2>
                <p className="mt-2 text-sm leading-7 text-yellow-50/80">
                  Abra o Planejamento OS, confira pesos e prioridades, e gere a linha de execucao do dia.
                </p>

                <Link href="/planejamento-inteligente" className="cp-os-btn-primary mt-5">
                  Ir para Planejamento
                </Link>
              </section>
            ) : (
              <section className="rounded-[34px] border border-cyan-300/15 bg-[linear-gradient(135deg,rgba(20,32,88,.94),rgba(9,14,42,.98))] p-6 shadow-[0_28px_100px_rgba(0,0,0,.45)]">
                <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <span className="cp-os-badge-blue">Linha do dia</span>
                    <h2 className="mt-3 text-3xl font-black tracking-tight text-white">
                      Execucao em ordem
                    </h2>
                    <p className="mt-2 text-sm text-slate-300">
                      Siga a primeira tarefa pendente. Ao concluir, volte para continuar.
                    </p>
                  </div>

                  <Link href="/planejamento-inteligente" className="cp-os-btn-soft">
                    Recalcular
                  </Link>
                </div>

                {proxima ? (
                  <article className="mb-5 rounded-[30px] border border-cyan-300/30 bg-cyan-400/10 p-5 shadow-[0_18px_70px_rgba(56,189,248,.14)]">
                    <span className="cp-os-badge-green">Proxima tarefa</span>

                    <h3 className="mt-3 text-3xl font-black text-white">
                      {proxima.titulo}
                    </h3>

                    <p className="mt-2 text-sm text-slate-300">
                      {proxima.materia} - {proxima.topico}
                    </p>

                    <p className="mt-2 text-xs text-cyan-100">
                      {proxima.tipo} - {proxima.prioridade} - {proxima.minutos}min
                    </p>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <button type="button" onClick={() => executarTask(proxima)} className="cp-os-btn-primary">
                        Executar tarefa
                      </button>

                      <button type="button" onClick={() => abrirTask(proxima)} className="cp-os-btn-soft">
                        Abrir material
                      </button>

                      <button type="button" onClick={() => concluirTask(proxima.id)} className="cp-os-btn-focus">
                        Marcar concluida
                      </button>
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
                          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-white/[0.08] text-sm font-black text-white">
                            {String(index + 1).padStart(2, "0")}
                          </span>

                          <span className={task.concluida ? "text-xs font-black text-emerald-200" : "text-xs font-black text-cyan-200"}>
                            {task.concluida ? "OK" : task.tipo}
                          </span>
                        </div>

                        <h3 className="mt-4 line-clamp-2 text-sm font-black text-white">
                          {task.titulo}
                        </h3>

                        <p className="mt-2 text-xs leading-5 text-slate-300">
                          {task.materia}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            )}
            {revisoesPendentesDashboard.length > 0 ? (
              <section className="rounded-[30px] border border-cyan-300/20 bg-cyan-400/10 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="cp-os-badge-blue">Memoria ativa</span>
                    <h2 className="mt-3 text-2xl font-black text-white">Revisoes pendentes</h2>
                    <div className="mt-2 flex items-center gap-2">
                      <p className="text-sm text-slate-300">
                        Existem itens salvos para revisao. Revise antes de avancar muito conteudo novo.
                      </p>

                      <div className="group relative">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-400/10 text-[10px] font-black text-cyan-100">
                          ?
                        </div>

                        <div className="pointer-events-none absolute left-0 top-8 z-20 w-[300px] translate-y-2 rounded-2xl border border-cyan-300/15 bg-[rgba(10,14,32,.96)] p-4 text-xs leading-6 text-slate-200 opacity-0 shadow-[0_24px_80px_rgba(0,0,0,.45)] backdrop-blur-xl transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                          A Lyra detectou itens importantes aguardando revisao. Revisar agora reduz o risco de esquecimento e fortalece memoria de longo prazo.
                        </div>
                      </div>
                    </div>
                  </div>

                  <Link href="/revisao-inteligente" className="cp-os-btn-primary">
                    Revisar agora
                  </Link>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {revisoesPendentesDashboard.map((item: any) => (
                    <Link
                      key={item.id}
                      href="/revisao-inteligente?auto=true"
                      className="rounded-[24px] border border-white/10 bg-white/[0.055] p-4 transition hover:bg-white/[0.08]"
                    >
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">
                        Revisao
                      </p>
                      <h3 className="mt-2 line-clamp-2 font-black text-white">
                        {item.titulo || "Revisao"}
                      </h3>
                      <p className="mt-1 text-xs text-slate-300">
                        {item.materiaNome || "Sem materia"}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5">
                <span className="cp-os-badge-purple">Concluidas hoje</span>

                {concluidas.length ? (
                  <div className="mt-4 grid gap-2">
                    {concluidas.slice(0, 4).map((task) => (
                      <div key={task.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white/[0.055] px-4 py-3">
                        <div>
                          <p className="font-bold text-white">{task.titulo}</p>
                          <p className="text-xs text-slate-400">{task.materia}</p>
                        </div>

                        <button type="button" onClick={() => concluirTask(task.id)} className="cp-os-btn-soft">
                          Desfazer
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-slate-400">Nenhuma tarefa concluida ainda.</p>
                )}
              </div>

              <aside className="rounded-[30px] border border-fuchsia-300/15 bg-white/[0.045] p-5">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-[20px] bg-gradient-to-br from-fuchsia-500 to-blue-600">
                    *
                  </div>

                  <div>
                    <p className="font-black text-white">Lyra</p>
                    <p className="text-xs text-slate-400">orientacao rapida</p>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-300">
                  {semPlano
                    ? "Gere um plano no Planejamento OS para ativar a execucao guiada."
                    : diaConcluido
                    ? "Dia finalizado. Voce pode revisar resultados ou recalcular um novo ciclo."
                    : "Execute a primeira tarefa pendente. O sistema cuida da ordem."}
                </p>
              </aside>
            </section>
          </>
        )}
      </section>
    </main>
  );
}









