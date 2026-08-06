import type { DashboardViewModel } from "@/lib/dashboard/types";

type DashboardRadarProps = {
  adaptiveRadar: DashboardViewModel["adaptiveRadar"];
};

export function DashboardRadar({ adaptiveRadar }: DashboardRadarProps) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="cp-os-badge-purple">Adaptive AI</span>
          <h2 className="mt-3 text-2xl font-black text-white">Radar adaptativo</h2>
          <p className="mt-2 text-sm text-slate-300">O sistema esta identificando automaticamente materias fortes e fracas.</p>
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
                <p className="text-xs font-black uppercase tracking-[0.18em] text-white/70">{item.nivel}</p>
                <h3 className="mt-2 text-xl font-black text-white">{item.materia}</h3>
              </div>
              <div className="rounded-2xl bg-black/20 px-3 py-2 text-right">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/60">Score</p>
                <strong className="text-xl text-white">{item.score}</strong>
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
        ))}
      </div>
    </section>
  );
}
