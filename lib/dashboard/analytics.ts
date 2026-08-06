import { todayKey } from "@/lib/date-utils";
import type {
  DashboardAnalytics,
  DashboardStats,
  DashboardTask,
} from "@/lib/dashboard/types";

export function asArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function dateKey(value: unknown): string {
  return String(value ?? "").slice(0, 10);
}

export function calculateDashboardStats(
  materias: unknown[],
  tasks: DashboardTask[]
): DashboardStats {
  let totalSubtopicos = 0;
  let estudados = 0;
  let erros = 0;

  materias.forEach((materia: any) => {
    asArray<any>(materia?.topicos).forEach((topico) => {
      asArray<any>(topico?.subtopicos).forEach((subtopico) => {
        totalSubtopicos += 1;
        if (subtopico?.estudado || subtopico?.concluido) estudados += 1;
        erros +=
          asArray(subtopico?.erros).length +
          asArray(subtopico?.questoesErradas).length;
      });
    });
  });

  const concluidas = tasks.filter((task) => task.concluida);
  const minutosTotais = tasks.reduce(
    (total, task) => total + Number(task.minutos || 0),
    0
  );
  const minutosFeitos = concluidas.reduce(
    (total, task) => total + Number(task.minutos || 0),
    0
  );

  return {
    totalSubtopicos,
    estudados,
    erros,
    progressoDia: tasks.length
      ? Math.round((concluidas.length / tasks.length) * 100)
      : 0,
    minutosTotais,
    minutosFeitos,
  };
}

export function calculateTodayAnalytics(
  sessoes: unknown[]
): DashboardAnalytics {
  const hoje = todayKey();
  const sessoesHoje = asArray<any>(sessoes).filter(
    (sessao) => dateKey(sessao?.createdAt) === hoje
  );

  const segundosEstudados = sessoesHoje.reduce(
    (total, sessao) => total + Number(sessao?.segundosEstudados || 0),
    0
  );
  const minutosEstudadosHoje = Math.round(segundosEstudados / 60);
  const totalSessoesHoje = sessoesHoje.length;
  const mediaSessaoHoje = totalSessoesHoje
    ? Math.round(minutosEstudadosHoje / totalSessoesHoje)
    : 0;

  const segundosPorMateria = new Map<string, number>();
  sessoesHoje.forEach((sessao) => {
    const materia = String(sessao?.materia || "Sem materia");
    segundosPorMateria.set(
      materia,
      (segundosPorMateria.get(materia) || 0) +
        Number(sessao?.segundosEstudados || 0)
    );
  });

  const materiaMaisEstudada =
    [...segundosPorMateria.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ||
    "Nenhuma";

  return {
    minutosEstudadosHoje,
    totalSessoesHoje,
    mediaSessaoHoje,
    materiaMaisEstudada,
  };
}

