"use client";

import { useIASuggestion } from "@/hooks/use-ia-suggestion";

export function IAFeature() {
  const { carregando, sugestao } = useIASuggestion();

  return (
    <main className="cp-os-page">
      <section className="cp-os-container">
        <header className="cp-os-hero">
          <div className="cp-os-hero-inner">
            <span className="cp-os-eyebrow">Inteligencia de estudo</span>
            <h1 className="cp-os-title">Planejador IA</h1>
            <p className="cp-os-subtitle">
              Receba uma orientacao automatica baseada nas suas materias e no seu progresso atual.
            </p>
          </div>
        </header>

        <section className="mt-5 rounded-[30px] border border-cyan-300/15 bg-white/[0.045] p-6">
          <span className="cp-os-badge-blue">Sugestao atual</span>

          <div className="mt-4 rounded-[24px] border border-white/10 bg-white/[0.055] p-5">
            {carregando ? (
              <p className="text-sm text-slate-400">Analisando seus dados...</p>
            ) : (
              <p className="text-base leading-7 text-slate-200">
                {sugestao || "Ainda nao existem dados suficientes para gerar uma sugestao."}
              </p>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
