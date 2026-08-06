"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { loadAppData } from "@/lib/app-storage";
import { loadPlanoDia } from "@/lib/planning-state";

function arr(value: any): any[] {
  return Array.isArray(value) ? value : [];
}



function calcularRisco(totalMinutos: number) {
  if (totalMinutos >= 2500) {
    return {
      nivel: "Critico",
      cor: "rose",
      texto:
        "Existe risco alto de sobrecarga e abandono. O ideal agora e reduzir entrada de conteudo novo.",
    };
  }

  if (totalMinutos >= 1400) {
    return {
      nivel: "Alto",
      cor: "orange",
      texto:
        "A recuperacao precisa virar prioridade nos proximos dias.",
    };
  }

  if (totalMinutos >= 700) {
    return {
      nivel: "Moderado",
      cor: "amber",
      texto:
        "Existe atraso acumulado, mas ainda controlavel com consistencia.",
    };
  }

  return {
    nivel: "Leve",
    cor: "emerald",
    texto:
      "O sistema detectou atraso baixo e recuperavel sem grande impacto.",
  };
}

export default function RecuperacaoPage() {
  const [appData, setAppData] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [concluidas, setConcluidas] = useState<string[]>([]);

  useEffect(() => {
    void (async () => {
      setAppData(loadAppData());

      const plano = await loadPlanoDia<any>();

      setTasks(plano);
      setConcluidas(
        plano
          .filter((task: any) => Boolean(task.concluida))
          .map((task: any) => String(task.id))
      );
    })();
  }, []);

  const diagnostico = useMemo(() => {
    const pendentes = tasks.filter(
      (task) => !concluidas.includes(task.id)
    );

    const minutosPendentes = pendentes.reduce(
      (acc, task) => acc + Number(task.minutos || 0),
      0
    );

    const diasRecuperacao =
      minutosPendentes > 0
        ? Math.max(1, Math.ceil(minutosPendentes / 180))
        : 0;

    const risco = calcularRisco(minutosPendentes);

    return {
      pendentes,
      minutosPendentes,
      diasRecuperacao,
      risco,
    };
  }, [tasks, concluidas]);

  const recomendacao =
    diagnostico.risco.nivel === "Critico"
      ? "Suspenda temporariamente novas materias e foque apenas recuperacao, revisao e erros."
      : diagnostico.risco.nivel === "Alto"
      ? "Priorize tarefas criticas e reduza carga secundaria nos proximos dias."
      : diagnostico.risco.nivel === "Moderado"
      ? "Aumente consistencia diaria antes que o backlog cresca."
      : "Seu ritmo atual esta saudavel. Continue consistente.";

  return (
    <main className="cp-os-page">
      <section className="mx-auto flex w-full max-w-[1280px] flex-col gap-5 px-4 py-5 md:px-6">
        <header className="rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,rgba(38,12,20,.96),rgba(10,12,28,.98))] p-6 shadow-[0_28px_100px_rgba(0,0,0,.44)]">
          <span className="rounded-full border border-rose-400/20 bg-rose-400/10 px-4 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-rose-200">
            Recuperacao inteligente
          </span>

          <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-5xl">
            Sistema anti-atraso
          </h1>

          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
            O CP Focus detecta acumulacao de tarefas e reorganiza prioridades antes que voce perca consistencia.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/planejamento-inteligente" className="cp-os-btn-primary">
              Recalcular planejamento
            </Link>

            <Link href="/modo-foco" className="cp-os-btn-soft">
              Entrar em modo foco
            </Link>
          </div>
        </header>

        <section className="grid gap-3 md:grid-cols-4">
          <div className="rounded-[22px] border border-white/10 bg-white/[0.045] px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Tarefas pendentes
            </p>

            <strong className="mt-1 block text-2xl text-white">
              {diagnostico.pendentes.length}
            </strong>
          </div>

          <div className="rounded-[22px] border border-orange-300/20 bg-orange-400/10 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-200">
              Backlog
            </p>

            <strong className="mt-1 block text-2xl text-white">
              {diagnostico.minutosPendentes}min
            </strong>
          </div>

          <div className="rounded-[22px] border border-cyan-300/20 bg-cyan-400/10 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200">
              Dias estimados
            </p>

            <strong className="mt-1 block text-2xl text-white">
              {diagnostico.diasRecuperacao}
            </strong>
          </div>

          <div className={
            diagnostico.risco.cor === "rose"
              ? "rounded-[22px] border border-rose-300/20 bg-rose-400/10 px-4 py-3"
              : diagnostico.risco.cor === "orange"
              ? "rounded-[22px] border border-orange-300/20 bg-orange-400/10 px-4 py-3"
              : diagnostico.risco.cor === "amber"
              ? "rounded-[22px] border border-amber-300/20 bg-amber-400/10 px-4 py-3"
              : "rounded-[22px] border border-emerald-300/20 bg-emerald-400/10 px-4 py-3"
          }>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">
              Risco
            </p>

            <strong className="mt-1 block text-2xl text-white">
              {diagnostico.risco.nivel}
            </strong>
          </div>
        </section>

        <section className="rounded-[30px] border border-rose-300/15 bg-rose-400/10 p-5">
          <span className="cp-os-badge-red">Diagnostico da Lyra</span>

          <h2 className="mt-3 text-2xl font-black text-white">
            Estado atual da recuperacao
          </h2>

          <div className="mt-3 flex items-start gap-2">
            <p className="text-sm leading-7 text-slate-300">
              {diagnostico.risco.texto}
            </p>

            <div className="group relative mt-1">
              <div className="flex h-6 w-6 items-center justify-center rounded-full border border-rose-300/20 bg-rose-400/10 text-[10px] font-black text-rose-100">
                ?
              </div>

              <div className="pointer-events-none absolute left-0 top-8 z-20 w-[320px] translate-y-2 rounded-2xl border border-rose-300/15 bg-[rgba(10,14,32,.96)] p-4 text-xs leading-6 text-slate-200 opacity-0 shadow-[0_24px_80px_rgba(0,0,0,.45)] backdrop-blur-xl transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                A Lyra calcula esse risco olhando backlog, minutos pendentes e tempo estimado para recuperar sem causar sobrecarga.
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-[24px] border border-white/10 bg-black/15 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-200">
              Recomendacao inteligente
            </p>

            <p className="mt-2 text-sm leading-7 text-slate-300">
              {recomendacao}
            </p>
          </div>
        </section>

        <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="cp-os-badge-purple">Recuperacao</span>

              <h2 className="mt-3 text-2xl font-black text-white">
                Tarefas mais urgentes
              </h2>
            </div>

            <button
              type="button"
              className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-3 text-sm font-black text-cyan-100 transition hover:bg-cyan-400/20"
            >
              Criar plano emergencial
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {diagnostico.pendentes.length ? (
              diagnostico.pendentes.slice(0, 8).map((task) => (
                <article
                  key={task.id}
                  className="rounded-[24px] border border-white/10 bg-black/15 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <span className="cp-os-badge-blue">
                          {task.tipo}
                        </span>

                        <span className="cp-os-badge">
                          {task.minutos}min
                        </span>
                      </div>

                      <h3 className="mt-3 text-xl font-black text-white">
                        {task.titulo}
                      </h3>

                      <p className="mt-1 text-sm text-slate-400">
                        {task.materiaNome || task.materia}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-right">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-rose-200">
                        Prioridade
                      </p>

                      <strong className="text-lg text-white">
                        Recuperacao
                      </strong>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="cp-os-empty">
                <strong>Nenhum atraso detectado</strong>
                O sistema nao encontrou backlog relevante no seu plano atual.
              </div>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
