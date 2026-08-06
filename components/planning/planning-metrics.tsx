import type { BrainMateria, PlanoTask, PlanningBrain } from "@/lib/planning/types";

type Props = {
  brain: PlanningBrain | null;
  capacidadeMinutos: number;
  concluidas: PlanoTask[];
  materiasAtivas: BrainMateria[];
  mensagemLyra: string;
  mounted: boolean;
  pendentes: PlanoTask[];
  progressoDia: number;
  tasks: PlanoTask[];
};

export function PlanningMetrics(props: Props) {
  const cards = [
    ["Carga diaria", `${props.capacidadeMinutos}min`, props.brain?.periodo || "periodo variavel"],
    ["Materias ativas", props.materiasAtivas.length, "com peso e prioridade"],
    ["Tarefas", props.tasks.length, `${props.pendentes.length} pendentes`],
    ["Dia", `${props.progressoDia}%`, `${props.concluidas.length}/${props.tasks.length} concluidas`],
  ];

  return (
    <section className="grid gap-3 md:grid-cols-4">
      {cards.map(([label, value, detail], index) => (
        <div key={String(label)} className="rounded-[22px] border border-white/10 bg-white/[0.045] px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
          <strong className="mt-1 block text-2xl text-white">{value}</strong>
          {index === 0 && props.mounted ? <p className="mt-2 text-xs text-cyan-100">{props.mensagemLyra}</p> : null}
          <p className="text-xs text-slate-400">{detail}</p>
        </div>
      ))}
    </section>
  );
}
