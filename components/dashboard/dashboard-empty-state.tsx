import Link from "next/link";

export function DashboardEmptyState() {
  return (
    <section className="rounded-[36px] border border-cyan-300/20 bg-[linear-gradient(135deg,rgba(20,32,88,.96),rgba(7,12,35,.98))] p-7 shadow-[0_30px_120px_rgba(0,0,0,.48)]">
      <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-cyan-200">
        Primeiro acesso
      </span>

      <h1 className="mt-5 max-w-4xl text-5xl font-black tracking-tight text-white">
        Vamos montar seu sistema de estudo.
      </h1>

      <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
        O CP Focus precisa criar sua base: concurso, materias, pesos, horarios e
        planejamento. Depois disso, o Dashboard passa a guiar seu dia
        automaticamente.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/onboarding"
          className="inline-flex h-14 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-8 text-base font-black text-white shadow-[0_24px_70px_rgba(56,189,248,.35)]"
        >
          Montar meu sistema
        </Link>

        <Link href="/planejamento-inteligente" className="cp-os-btn-soft">
          Abrir planejamento
        </Link>
      </div>
    </section>
  );
}
