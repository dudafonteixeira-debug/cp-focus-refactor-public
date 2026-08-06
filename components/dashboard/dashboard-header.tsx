import Link from "next/link";

import type { DashboardViewModel } from "@/lib/dashboard/types";

type DashboardHeaderProps = Pick<
  DashboardViewModel,
  "comecarDia" | "diaConcluido" | "semPlano"
>;

export function DashboardHeader({
  comecarDia,
  diaConcluido,
  semPlano,
}: DashboardHeaderProps) {
  const titulo = diaConcluido
    ? "Dia concluido."
    : semPlano
      ? "Gere seu plano do dia."
      : "Siga a proxima tarefa.";

  const descricao = diaConcluido
    ? "Todas as tarefas planejadas foram finalizadas. Voce pode revisar o progresso ou recalcular um novo plano."
    : semPlano
      ? "O sistema ja tem materias, mas ainda nao existe uma linha de execucao para hoje."
      : "O Dashboard agora segue o plano calculado pelo Planejamento OS.";

  const textoAcao = semPlano
    ? "GERAR PLANO"
    : diaConcluido
      ? "VER PLANO"
      : "COMECAR O DIA";

  return (
    <header className="rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,rgba(18,26,72,.96),rgba(7,12,35,.98))] p-6 shadow-[0_28px_100px_rgba(0,0,0,.44)]">
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div className="max-w-3xl">
          <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-cyan-200">
            Comeco do dia
          </span>

          <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-5xl">
            {titulo}
          </h1>

          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
            {descricao}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:min-w-[260px]">
          <button
            type="button"
            onClick={comecarDia}
            className="inline-flex h-14 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-8 text-base font-black text-white shadow-[0_24px_70px_rgba(56,189,248,.35)] transition hover:-translate-y-0.5"
          >
            {textoAcao}
          </button>

          <Link
            href="/planejamento-inteligente"
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055] px-6 text-sm font-bold text-white transition hover:bg-white/[0.1]"
          >
            Ajustar planejamento
          </Link>
        </div>
      </div>
    </header>
  );
}
