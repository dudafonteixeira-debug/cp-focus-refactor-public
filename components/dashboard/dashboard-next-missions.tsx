import type { DashboardTask } from "@/lib/dashboard/types";

type DashboardNextMissionsProps = {
  missions: DashboardTask[];
  abrirTask: (task: DashboardTask) => void;
};

export function DashboardNextMissions({
  missions,
  abrirTask,
}: DashboardNextMissionsProps) {
  if (!missions.length) return null;

  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5">
      <span className="cp-os-badge-purple">Depois desta</span>

      <h2 className="mt-3 text-2xl font-black text-white">
        Proximas missoes
      </h2>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {missions.map((mission, index) => (
          <button
            key={mission.id}
            type="button"
            onClick={() => abrirTask(mission)}
            className="rounded-[22px] border border-white/10 bg-black/15 p-4 text-left transition hover:bg-white/[0.06]"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/[0.08] text-xs font-black text-white">
                {index + 2}
              </span>

              <span className="text-xs font-black uppercase tracking-[0.15em] text-cyan-200">
                {mission.categoria}
              </span>
            </div>

            <h3 className="mt-3 font-black text-white">
              {mission.titulo}
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              {mission.materia} · {mission.minutos}min
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}
