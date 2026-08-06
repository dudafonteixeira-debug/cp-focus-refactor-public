type PlanningHeaderProps = {
  gerarPlanoDoDia: () => Promise<void>;
  continuarDia: () => void;
};

export function PlanningHeader({ gerarPlanoDoDia, continuarDia }: PlanningHeaderProps) {
  return (
    <header className="rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,rgba(18,26,72,.96),rgba(7,12,35,.98))] p-6 shadow-[0_28px_100px_rgba(0,0,0,.44)]">
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div className="max-w-3xl">
          <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-cyan-200">Planejamento OS</span>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-5xl">O cerebro do seu dia de estudo.</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">Defina horas, periodo, materias, pesos e prioridades. O CP Focus transforma isso em uma sequencia real de execucao.</p>
        </div>
        <div className="flex flex-col gap-3 sm:min-w-[250px]">
          <button type="button" onClick={() => void gerarPlanoDoDia()} className="cp-os-btn-primary w-full">Gerar plano do dia</button>
          <button type="button" onClick={continuarDia} className="cp-os-btn-focus w-full">Comecar / continuar</button>
        </div>
      </div>
    </header>
  );
}
