import type { PlanoTask } from "@/lib/planning/types";

export function PlanningCompleted({ concluidas, concluirTask }: { concluidas: PlanoTask[]; concluirTask: (id: string) => Promise<void> }) {
  if (!concluidas.length) return null;
  return (
    <section className="rounded-[30px] border border-emerald-300/15 bg-emerald-400/10 p-5">
      <h2 className="text-xl font-black text-emerald-100">Tarefas concluidas hoje</h2>
      <div className="mt-3 grid gap-2">
        {concluidas.map((task) => (
          <div key={task.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/[0.055] px-4 py-3">
            <div><p className="font-bold text-white">{task.titulo}</p><p className="text-xs text-emerald-100/80">{task.materia} - {task.tipo}</p></div>
            <button type="button" onClick={() => void concluirTask(task.id)} className="cp-os-btn-soft">Desfazer</button>
          </div>
        ))}
      </div>
    </section>
  );
}
