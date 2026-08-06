export function SimuladosHeader() {
  return (
    <header className="rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,rgba(18,26,72,.96),rgba(7,12,35,.98))] p-6 shadow-[0_28px_100px_rgba(0,0,0,.44)]">
      <span className="rounded-full border border-rose-400/20 bg-rose-400/10 px-4 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-rose-200">
        Prova guiada
      </span>

      <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-5xl">
        Simulados
      </h1>

      <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
        Gere uma prova nova com IA, escolha o modo, resolva com cronometro e veja diagnostico final por materia.
      </p>
    </header>
  );
}
