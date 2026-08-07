import { buildEngineContext } from "@/lib/engine/context-engine";
import {
  getNextMission,
  selectMissionsForToday,
} from "@/lib/engine/mission-engine";
import type {
  EngineContext,
  EngineMission,
  EngineResult,
  MissionCategory,
} from "@/lib/engine/types";
import { loadPlanoDia } from "@/lib/planning-state";
import type { PlanoTask } from "@/lib/planning/types";

function inferCategory(task: PlanoTask): MissionCategory {
  if (task.tipo === "Revisao") return "revisao";
  if (task.tipo === "Correcao") return "recuperacao";
  return "estudo";
}

function normalizeMission(
  task: PlanoTask,
  index: number
): EngineMission {
  return {
    ...task,
    categoria: inferCategory(task),
    status: task.concluida ? "concluida" : "pendente",
    origem: "planejamento",
    ordem: index + 1,
  };
}

function buildLyraMessage(
  missions: EngineMission[],
  context: EngineContext
): string {
  const pendentes = missions.filter(
    (mission) => mission.status !== "concluida"
  );

  if (!missions.length) {
    return "Seu dia ainda nao foi planejado. Vou organizar suas proximas missoes.";
  }

  if (!pendentes.length) {
    return "Missoes concluidas. Seu ciclo de estudos de hoje foi finalizado.";
  }

  const critica = context.radar?.find(
    (item) => item.nivel === "critica"
  );

  if (critica) {
    return `Hoje vamos dar atencao especial a ${critica.materia}, que aparece como materia critica no seu desempenho recente.`;
  }

  const minutos = pendentes.reduce(
    (total, mission) => total + Number(mission.minutos || 0),
    0
  );

  return `Organizei ${pendentes.length} missoes para hoje, totalizando aproximadamente ${minutos} minutos.`;
}

export async function getTodayMissions(
  input: Partial<EngineContext> = {}
): Promise<EngineResult> {
  const context = await buildEngineContext(input);

  const tasks = await loadPlanoDia<PlanoTask>();
  const normalized = tasks.map(normalizeMission);

  const missions = selectMissionsForToday(
    normalized,
    context
  );

  const pendentes = missions.filter(
    (mission) => mission.status !== "concluida"
  );

  const concluidas = missions.filter(
    (mission) => mission.status === "concluida"
  );

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
    data: context.data,
    missions,
    pendentes,
    concluidas,
    proxima: getNextMission(missions),
    minutosPlanejados,
    minutosPendentes,
    progresso,
    mensagemLyra: buildLyraMessage(missions, context),
  };
}
