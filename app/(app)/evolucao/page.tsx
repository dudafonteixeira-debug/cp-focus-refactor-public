"use client";

import { todayKey as getTodayKey, toLocalDateKey } from "@/lib/date-utils";
import { getSessoesEstudo } from "@/lib/data-access/app-repository";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { loadGamificacao } from "@/lib/gamificacao";

function arr(value: any): any[] {
  return Array.isArray(value) ? value : [];
}



function dateKey(date: Date) {
  return toLocalDateKey(date);
}

function getLastDays(total: number) {
  return Array.from({ length: total }).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (total - index - 1));
    return date;
  });
}

function nivelIntensidade(minutos: number) {
  if (minutos >= 180) return 4;
  if (minutos >= 120) return 3;
  if (minutos >= 60) return 2;
  if (minutos > 0) return 1;
  return 0;
}

function classeHeatmap(intensidade: number) {
  if (intensidade === 4) {
    return "h-8 rounded-xl border border-cyan-200/30 bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,.35)]";
  }

  if (intensidade === 3) {
    return "h-8 rounded-xl border border-cyan-200/20 bg-cyan-400/80";
  }

  if (intensidade === 2) {
    return "h-8 rounded-xl border border-cyan-200/10 bg-cyan-500/55";
  }

  if (intensidade === 1) {
    return "h-8 rounded-xl border border-white/10 bg-white/20";
  }

  return "h-8 rounded-xl border border-white/5 bg-white/[0.04]";
}

export default function EvolucaoPage() {
  const [sessoes, setSessoes] = useState<any[]>([]);
  const [game, setGame] = useState<any>({ xp: 0, nivel: 1, streak: 0 });

  useEffect(() => {
    void (async () => {
      setSessoes(await getSessoesEstudo<any[]>([]));
      setGame(loadGamificacao());
    })();
  }, []);

  const dias = useMemo(() => getLastDays(35), []);

  const heatmap = useMemo(() => {
    return dias.map((date) => {
      const key = dateKey(date);

      const sessoesDia = sessoes.filter(
        (sessao) => String(sessao.createdAt || "").slice(0, 10) === key
      );

      const minutos = sessoesDia.reduce(
        (acc, sessao) =>
          acc + Math.round(Number(sessao.segundosEstudados || 0) / 60),
        0
      );

      return {
        key,
        minutos,
        sessoes: sessoesDia.length,
        intensidade: nivelIntensidade(minutos),
      };
    });
  }, [dias, sessoes]);

  const ultimos7 = heatmap.slice(-7);

  const totalMin = heatmap.reduce((acc, item) => acc + item.minutos, 0);
  const totalSemana = ultimos7.reduce((acc, item) => acc + item.minutos, 0);
  const diasAtivos = heatmap.filter((item) => item.minutos > 0).length;
  const diasAtivosSemana = ultimos7.filter((item) => item.minutos > 0).length;
  const mediaDiaria = diasAtivos ? Math.round(totalMin / diasAtivos) : 0;
  const mediaSemana = diasAtivosSemana ? Math.round(totalSemana / diasAtivosSemana) : 0;

  const melhorDia = [...heatmap].sort((a, b) => b.minutos - a.minutos)[0];

  const materias = useMemo(() => {
    const map = new Map<string, number>();

    sessoes.forEach((sessao) => {
      const nome = sessao.materia || sessao.materiaNome || "Sem materia";
      const minutos = Math.round(Number(sessao.segundosEstudados || 0) / 60);
      map.set(nome, (map.get(nome) || 0) + minutos);
    });

    return [...map.entries()]
      .map(([materia, minutos]) => ({ materia, minutos }))
      .filter((item) => item.materia !== "Sem materia")
      .sort((a, b) => b.minutos - a.minutos)
      .slice(0, 6);
  }, [sessoes]);

  const maiorMateria = materias[0];

  const insight =
    totalSemana === 0
      ? "A Lyra ainda nao encontrou estudo registrado nesta semana. Inicie uma sessao no Modo Foco para alimentar sua evolucao."
      : diasAtivosSemana >= 5
      ? "Sua consistencia semanal esta forte. Mantenha o ritmo e use revisoes para proteger a memoria."
      : diasAtivosSemana >= 3
      ? "Voce estudou em alguns dias da semana, mas ainda pode aumentar a regularidade para consolidar o habito."
      : "A semana esta com baixa consistencia. A Lyra recomenda sessoes curtas de foco para recuperar ritmo sem sobrecarga.";

  return (
    <main className="cp-os-page">
      <section className="mx-auto flex w-full max-w-[1280px] flex-col gap-5 px-4 py-5 md:px-6">
        <header className="rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,rgba(18,26,72,.96),rgba(7,12,35,.98))] p-6 shadow-[0_28px_100px_rgba(0,0,0,.44)]">
          <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-violet-200">
            Evolucao
          </span>

          <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-5xl">
            Consistencia e desempenho
          </h1>

          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
            Veja sua frequencia real de estudo, intensidade dos dias, materias mais trabalhadas e sinais de evolucao.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/modo-foco" className="cp-os-btn-primary">
              Iniciar foco
            </Link>

            <Link href="/inteligencia" className="cp-os-btn-soft">
              Ver Adaptive AI
            </Link>
          </div>
        </header>

        <section className="grid gap-3 md:grid-cols-4">
          <div className="rounded-[22px] border border-cyan-300/20 bg-cyan-400/10 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200">Tempo total</p>
            <strong className="mt-1 block text-2xl text-white">{totalMin}min</strong>
          </div>

          <div className="rounded-[22px] border border-violet-300/20 bg-violet-400/10 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-200">Semana</p>
            <strong className="mt-1 block text-2xl text-white">{totalSemana}min</strong>
          </div>

          <div className="rounded-[22px] border border-emerald-300/20 bg-emerald-400/10 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-200">Dias ativos</p>
            <strong className="mt-1 block text-2xl text-white">{diasAtivos}</strong>
          </div>

          <div className="rounded-[22px] border border-amber-300/20 bg-amber-400/10 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-200">Sequencia</p>
            <strong className="mt-1 block text-2xl text-white">{game?.streak || 0}</strong>
          </div>
        </section>

        <section className="rounded-[30px] border border-cyan-300/15 bg-cyan-400/10 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className="cp-os-badge-blue">Insight da Lyra</span>
              <h2 className="mt-3 text-2xl font-black text-white">Leitura da semana</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">{insight}</p>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-black/15 px-5 py-4 text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Media ativa</p>
              <strong className="mt-1 block text-2xl text-white">{mediaSemana}min</strong>
            </div>
          </div>
        </section>

        <section className="rounded-[26px] border border-white/10 bg-white/[0.045] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="cp-os-badge-blue">Heatmap</span>
              <h2 className="mt-3 text-2xl font-black text-white">Mapa de consistencia</h2>
              <p className="mt-2 text-sm text-slate-300">
                Cada quadrado representa um dia. Quanto mais forte a cor, maior a intensidade de estudo.
              </p>
            </div>

            <div className="group relative">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-400/10 text-xs font-black text-cyan-100">
                ?
              </div>

              <div className="pointer-events-none absolute right-0 top-10 z-20 w-[320px] translate-y-2 rounded-2xl border border-cyan-300/15 bg-[rgba(10,14,32,.96)] p-4 text-xs leading-6 text-slate-200 opacity-0 shadow-[0_24px_80px_rgba(0,0,0,.45)] backdrop-blur-xl transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                A Lyra usa esse mapa para detectar consistencia, quedas de ritmo e risco de abandono. Dias vazios indicam ausencia de sessoes registradas no Modo Foco.
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-7 gap-1.5 md:grid-cols-35">
            {heatmap.map((item) => (
              <div
                key={item.key}
                className={classeHeatmap(item.intensidade)}
                title={`${item.key} - ${item.minutos}min - ${item.sessoes} sessao(oes)`}
              />
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-lg bg-white/[0.04]" />
              Sem estudo
            </div>

            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-lg bg-white/20" />
              Leve
            </div>

            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-lg bg-cyan-500/55" />
              Medio
            </div>

            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-lg bg-cyan-400/80" />
              Forte
            </div>

            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-lg bg-cyan-300" />
              Intenso
            </div>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
          <div className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5">
            <span className="cp-os-badge-purple">Materias</span>
            <h2 className="mt-3 text-2xl font-black text-white">Tempo por materia</h2>

            <div className="mt-5 space-y-3">
              {materias.length ? (
                materias.map((item) => {
                  const percent = totalMin ? Math.round((item.minutos / totalMin) * 100) : 0;

                  return (
                    <article key={item.materia} className="rounded-[24px] border border-white/10 bg-black/15 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-black text-white">{item.materia}</h3>
                          <p className="mt-1 text-sm text-slate-400">{item.minutos}min estudados</p>
                        </div>

                        <strong className="text-xl text-white">{percent}%</strong>
                      </div>

                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="cp-os-empty">
                  <strong>Nenhuma materia registrada ainda</strong>
                  Use o Modo Foco para gerar dados reais por materia.
                </div>
              )}
            </div>
          </div>

          <aside className="rounded-[30px] border border-violet-300/20 bg-violet-400/10 p-5">
            <span className="cp-os-badge-purple">Resumo premium</span>
            <h2 className="mt-3 text-2xl font-black text-white">Destaques</h2>

            <div className="mt-5 space-y-3">
              <div className="rounded-[24px] border border-white/10 bg-black/15 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Melhor dia</p>
                <strong className="mt-1 block text-xl text-white">
                  {melhorDia?.minutos ? `${melhorDia.key} - ${melhorDia.minutos}min` : "Sem dados"}
                </strong>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-black/15 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Materia foco</p>
                <strong className="mt-1 block text-xl text-white">
                  {maiorMateria ? maiorMateria.materia : "Sem dados"}
                </strong>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-black/15 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Media diaria ativa</p>
                <strong className="mt-1 block text-xl text-white">{mediaDiaria}min</strong>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-black/15 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Nivel atual</p>
                <strong className="mt-1 block text-xl text-white">Nivel {game?.nivel || 1}</strong>
              </div>
            </div>
          </aside>
        </section>
      </section>
    </main>
  );
}
