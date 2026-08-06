import type { DashboardViewModel } from "@/lib/dashboard/types";

type DashboardMetricsProps = Pick<
  DashboardViewModel,
  "brain" | "concluidas" | "materias" | "pendentes" | "stats" | "tasks"
> & {
  minutosEstudadosHoje: number;
};

type MetricCardProps = {
  label: string;
  value: string | number;
  description: string;
};

function MetricCard({
  label,
  value,
  description,
}: MetricCardProps) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.045] px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>

      <strong className="mt-1 block text-2xl text-white">
        {value}
      </strong>

      <p className="text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}

export function DashboardMetrics({
  brain,
  concluidas,
  materias,
  minutosEstudadosHoje,
  pendentes,
  stats,
  tasks,
}: DashboardMetricsProps) {
  return (
    <section className="grid gap-3 md:grid-cols-4">
      <MetricCard
        label="Progresso do dia"
        value={`${stats.progressoDia}%`}
        description={`${concluidas.length}/${tasks.length} tarefas`}
      />

      <MetricCard
        label="Tempo estudado"
        value={`${minutosEstudadosHoje}min`}
        description={`${stats.minutosTotais}min planejados`}
      />

      <MetricCard
        label="Pendentes"
        value={pendentes.length}
        description="na linha do dia"
      />

      <MetricCard
        label="Materias"
        value={materias.length}
        description={brain?.concurso || "sistema ativo"}
      />
    </section>
  );
}
