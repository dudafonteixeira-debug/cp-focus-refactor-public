import type { PlanningBrain } from "@/lib/planning/types";

type Props = {
  brain: PlanningBrain | null;
  materiasAtivas: number;
  abrirConfig: () => void;
};

export function PlanningOverview({ brain, materiasAtivas, abrirConfig }: Props) {
  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5">
        <span className="cp-os-badge-green">Cerebro do planejamento</span>
        <h2 className="mt-3 text-2xl font-black text-white">{brain?.concurso || "Concurso nao definido"}</h2>
        <p className="mt-2 text-sm leading-7 text-slate-300">
          {brain
            ? `${brain.horasDia || "2"}h por dia - ${brain.diasSemana.join(", ") || "dias livres"} - periodo: ${brain.periodo || "variavel"} - ${materiasAtivas} materia(s) ativa(s)`
            : "Configure sua base de planejamento."}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={abrirConfig} className="cp-os-btn-primary">Configurar cerebro</button>
        </div>
      </div>
      <aside className="cp-os-ai-card p-5">
        <div className="cp-os-ai-orb">*</div>
        <h2 className="mt-4 text-2xl font-black text-white">Lyra priorizou</h2>
        <p className="mt-3 text-sm leading-7 text-slate-300">O plano usa peso, ordem, prioridade, erros e carga diaria para definir a ordem das tarefas.</p>
      </aside>
    </section>
  );
}
