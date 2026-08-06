"use client";

import {
  getFlashcardsLegacy,
  getQuestoesHistorico,
  getSimuladosProva,
  getSessoesEstudo,
} from "@/lib/data-access/app-repository";
import { loadFase2Store } from "@/lib/fase2-storage";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { loadAppData } from "@/lib/app-storage";
import { calcularAdaptiveScores } from "@/lib/adaptive/engine";

function arr(value: any): any[] {
  return Array.isArray(value) ? value : [];
}



export default function InteligenciaPage() {
  const [appData, setAppData] = useState<any>(null);
  const [sessoes, setSessoes] = useState<any[]>([]);
  const [fase2, setFase2] = useState<any>(null);
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [questoes, setQuestoes] = useState<any[]>([]);
  const [simulados, setSimulados] = useState<any[]>([]);

  useEffect(() => {
  void (async () => {
    setAppData(loadAppData());

    const [
      sessoes,
      flashcards,
      questoes,
      simulados,
    ] = await Promise.all([
      getSessoesEstudo<any[]>([]),
      getFlashcardsLegacy<any[]>([]),
      getQuestoesHistorico<any[]>([]),
      getSimuladosProva<any[]>([]),
    ]);

    setSessoes(sessoes);
    setFase2(loadFase2Store());
    setFlashcards(flashcards);
    setQuestoes(questoes);
    setSimulados(simulados);
  })();
}, []);

  const radar = useMemo(() => {
    return calcularAdaptiveScores({
      sessoes,
      reviews: arr(fase2?.reviews),
      erros: arr(appData?.bancoErros),
      flashcards,
      questoes,
      simulados,
    });
  }, [sessoes, fase2, appData, flashcards, questoes, simulados]);

  const criticas = radar.filter((item) => item.nivel === "critica");
  const medias = radar.filter((item) => item.nivel === "media");
  const fortes = radar.filter((item) => item.nivel === "forte");

  const tempoTotalMin = sessoes.reduce(
    (acc, sessao) => acc + Math.round(Number(sessao.segundosEstudados || 0) / 60),
    0
  );

  const recomendacao =
    criticas.length > 0
      ? `Priorize ${criticas[0].materia}. O sistema detectou desempenho baixo ou poucos sinais de dominio.`
      : medias.length > 0
      ? `Continue fortalecendo ${medias[0].materia}. Ela ainda esta em zona intermediaria.`
      : fortes.length > 0
      ? "Seu desempenho esta estavel. Avance conteudo novo, mas mantenha revisoes."
      : "Ainda faltam dados. Use o Modo Foco, salve revisoes e registre erros para a Lyra analisar melhor.";

  return (
    <main className="cp-os-page">
      <section className="mx-auto flex w-full max-w-[1280px] flex-col gap-5 px-4 py-5 md:px-6">
        <header className="rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,rgba(18,26,72,.96),rgba(7,12,35,.98))] p-6 shadow-[0_28px_100px_rgba(0,0,0,.44)]">
          <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-cyan-200">
            Adaptive AI
          </span>

          <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-5xl">
            Inteligencia Adaptativa
          </h1>

          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
            O CP Focus analisa sessoes, revisoes e erros para descobrir onde voce deve concentrar energia.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/dashboard" className="cp-os-btn-soft">
              Dashboard
            </Link>

            <Link href="/planejamento-inteligente" className="cp-os-btn-primary">
              Recalcular planejamento
            </Link>
          </div>
        </header>

        <section className="grid gap-3 md:grid-cols-4">
          <div className="rounded-[22px] border border-white/10 bg-white/[0.045] px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Materias analisadas</p>
            <strong className="mt-1 block text-2xl text-white">{radar.length}</strong>
          </div>

          <div className="rounded-[22px] border border-rose-300/20 bg-rose-400/10 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-200">Criticas</p>
            <strong className="mt-1 block text-2xl text-white">{criticas.length}</strong>
          </div>

          <div className="rounded-[22px] border border-emerald-300/20 bg-emerald-400/10 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-200">Fortes</p>
            <strong className="mt-1 block text-2xl text-white">{fortes.length}</strong>
          </div>

          <div className="rounded-[22px] border border-cyan-300/20 bg-cyan-400/10 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200">Simulados</p>
            <strong className="mt-1 block text-2xl text-white">{simulados.length}</strong>
          </div>
        </section>

        <section className="rounded-[30px] border border-cyan-300/15 bg-cyan-400/10 p-5">
          <span className="cp-os-badge-blue">Recomendacao da Lyra</span>
          <h2 className="mt-3 text-2xl font-black text-white">Proximo ajuste inteligente</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">{recomendacao}</p>
        </section>

        <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="cp-os-badge-purple">Radar</span>
              <h2 className="mt-3 text-2xl font-black text-white">Mapa de materias</h2>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {radar.length ? (
              radar.map((item) => (
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
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/60">Score</p>
                      <strong className="text-xl text-white">{item.score}</strong>
                    </div>
                  </div>

                  <div className="group relative mt-4">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-cyan-200">
                      <span>Lyra Insight</span>

                      <div className="flex h-6 w-6 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-400/10 text-[11px] text-cyan-100">
                        ?
                      </div>
                    </div>

                    <div className="pointer-events-none absolute left-0 top-10 z-20 w-[320px] rounded-2xl border border-cyan-300/15 bg-[rgba(10,14,32,.96)] p-4 text-xs leading-6 text-slate-200 opacity-0 shadow-[0_24px_80px_rgba(0,0,0,.45)] backdrop-blur-xl transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 translate-y-2">
                      {item.nivel === "critica"
                        ? "A Lyra detectou sinais de fragilidade nesta materia: erros recentes, revisoes fracas, dificuldade de memoria ou desempenho abaixo do ideal."
                        : item.nivel === "forte"
                        ? "A Lyra identificou estabilidade recente nesta materia com bons sinais de memoria, revisao e desempenho."
                        : "A Lyra considera esta materia em evolucao intermediaria. Ainda existe oscilacao de desempenho."}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-2xl bg-black/15 p-2">
                      <p className="text-[10px] uppercase tracking-[0.15em] text-white/60">Tempo</p>
                      <strong className="text-sm text-white">{item.tempoEstudadoMin}m</strong>
                    </div>

                    <div className="rounded-2xl bg-black/15 p-2">
                      <p className="text-[10px] uppercase tracking-[0.15em] text-white/60">Revisoes</p>
                      <strong className="text-sm text-white">{item.revisoes}</strong>
                    </div>

                    <div className="rounded-2xl bg-black/15 p-2">
                      <p className="text-[10px] uppercase tracking-[0.15em] text-white/60">Erros</p>
                      <strong className="text-sm text-white">{item.erros}</strong>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="cp-os-empty">
                <strong>Nenhum dado suficiente ainda</strong>
                Use o Modo Foco, salve revisoes e registre erros para alimentar a inteligencia adaptativa.
              </div>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
