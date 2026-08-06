import type { DashboardViewModel } from "@/lib/dashboard/types";

type DashboardAnalyticsProps = {
  analyticsHoje: DashboardViewModel["analyticsHoje"];
};

export function DashboardAnalytics({ analyticsHoje }: DashboardAnalyticsProps) {
  const { mediaSessaoHoje, materiaMaisEstudada, minutosEstudadosHoje, totalSessoesHoje } = analyticsHoje;

  return (
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
  );
}
