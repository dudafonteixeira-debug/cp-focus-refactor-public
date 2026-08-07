import { getNextMission, selectMissionsForToday } from "@/lib/engine/mission-engine";
import type {
  EngineContext,
  EngineMission,
  EngineResult,
  MissionCategory,
} from "@/lib/engine/types";
import { loadPlanoDia, todayKey } from "@/lib/planning-state";
import type { PlanoTask } from "@/lib/planning/types";

function inferCategory(task: PlanoTask): MissionCategory {
  if (task.tipo === "Revisao") return "revisao";
  if (task.tipo === "Correcao") return "recuperacao";
  return "estudo";
}

function normalizeMission(task: PlanoTask, index: number): EngineMission {
  return {
    ...task,
    categoria: inferCategory(task),
    status: task.concluida ? "concluida" : "pendente",
    origem: "planejamento",
    ordem: index + 1,
  };
}

function buildLyraMessage(missions: EngineMission[]): string {
  const pendentes = missions.filter((mission) => !mission.concluida);

  if (!missions.length) {
    return "Seu dia ainda nao foi planejado. Vou organizar suas proximas missoes.";
  }

  if (!pendentes.length) {
    return "Missoes concluidas. Seu ciclo de estudos de hoje foi finalizado.";
  }

  const minutos = pendentes.reduce(
    (total, mission) => total + Number(mission.minutos || 0),
    0
  );

  return `Hoje temos ${pendentes.length} missoes pendentes, com aproximadamente ${minutos} minutos de estudo.`;
}

export async function getTodayMissions(
  context: Partial<EngineContext> = {}
): Promise<EngineResult> {
  const tasks = await loadPlanoDia<PlanoTask>();
  const normalized = tasks.map(normalizeMission);

  const resolvedContext: EngineContext = {
    data: context.data || todayKey(),
    tempoDisponivelMinutos: context.tempoDisponivelMinutos,
    energia: context.energia,
  };

  const missions = selectMissionsForToday(normalized, resolvedContext);
  const pendentes = missions.filter((mission) => !mission.concluida);
  const concluidas = missions.filter((mission) => mission.concluida);

  const minutosPlanejados = missions.reduce(
    (total, mission) => total + Number(mission.minutos || 0),
    0
  );

  const minutosPendentes = pendentes.reduce(
    (total, mission) => total + Number(mission.minutos || 0),
    0
  );

  const progresso = missions.length
    ? Math.round((concluidas.length / missions.length) * 100)
    : 0;

  return {
    data: resolvedContext.data,
    missions,
    pendentes,
    concluidas,
    proxima: getNextMission(missions),
    minutosPlanejados,
    minutosPendentes,
    progresso,
    mensagemLyra: buildLyraMessage(missions),
  };
}
