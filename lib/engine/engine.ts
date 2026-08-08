import { buildEngineContext } from "@/lib/engine/context-engine";
import { explainDayDecision, explainMissionDecision } from "@/lib/engine/decision-explainer";
import { generateAutomaticTasks } from "@/lib/engine/generator/mission-generator";
import {
  getNextMission,
  selectMissionsForToday,
} from "@/lib/engine/mission-engine";
import type {
  EngineContext,
  EngineMission,
  EngineResult,
  MissionCategory,
  MissionOrigin,
} from "@/lib/engine/types";
import {
  loadPlanoDia,
  persistPlanoDia,
} from "@/lib/planning-state";
import type { PlanoTask } from "@/lib/planning/types";

function inferCategory(task: PlanoTask): MissionCategory {
  const generated = task.categoriaGerada as MissionCategory | undefined;

  if (generated) return generated;

  if (task.tipo === "Revisao") return "revisao";
  if (task.tipo === "Correcao") return "recuperacao";

  return "estudo";
}

function inferOrigin(task: PlanoTask): MissionOrigin {
  const generated = task.origemGerada as MissionOrigin | undefined;

  return generated || "planejamento";
}

function normalizeMission(
  task: PlanoTask,
  index: number
): EngineMission {
  return {
    ...task,
    categoria: inferCategory(task),
    status: task.concluida
      ? "concluida"
      : task.statusEngine || "pendente",
    origem: inferOrigin(task),
    ordem: index + 1,
    sourceId: task.sourceId,
    sourceType: task.sourceType,
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
    return "Seu dia ainda nao possui missoes. Vou organizar seu ciclo de estudos.";
  }

  if (!pendentes.length) {
    return "Missoes concluidas. Seu ciclo de estudos de hoje foi finalizado.";
  }

  const automaticas = pendentes.filter(
    (mission) => mission.origem !== "planejamento"
  );

  const critica = context.radar?.find(
    (item) => item.nivel === "critica"
  );

  if (critica && automaticas.length) {
    return `Reorganizei seu dia com base no desempenho recente. ${critica.materia} precisa de atencao especial e ${automaticas.length} missao(oes) foram inseridas automaticamente.`;
  }

  if (automaticas.length) {
    return `Identifiquei necessidades no seu historico e inseri ${automaticas.length} missao(oes) automaticamente na rotina de hoje.`;
  }

  const minutos = pendentes.reduce(
    (total, mission) =>
      total + Number(mission.minutos || 0),
    0
  );

  return `Organizei ${pendentes.length} missoes para hoje, totalizando aproximadamente ${minutos} minutos.`;
}

export async function getTodayMissions(
  input: Partial<EngineContext> = {}
): Promise<EngineResult> {
  const context = await buildEngineContext(input);

  let tasks = await loadPlanoDia<PlanoTask>();

  const automaticTasks = generateAutomaticTasks(
    context,
    tasks
  );

  if (automaticTasks.length) {
    tasks = [...tasks, ...automaticTasks];
    await persistPlanoDia(tasks);
  }

  const normalized = tasks.map(normalizeMission);

  const missionsBase = selectMissionsForToday(
    normalized,
    context
  );

  const missions = missionsBase.map((mission) => ({
    ...mission,
    explicacaoDecisao: explainMissionDecision(mission, context),
  }));

  const resumoDecisao = explainDayDecision(missions, context);

  const pendentes = missions.filter(
    (mission) => mission.status !== "concluida"
  );

  const concluidas = missions.filter(
    (mission) => mission.status === "concluida"
  );

  const minutosPlanejados = missions.reduce(
    (total, mission) =>
      total + Number(mission.minutos || 0),
    0
  );

  const minutosPendentes = pendentes.reduce(
    (total, mission) =>
      total + Number(mission.minutos || 0),
    0
  );

  const progresso = missions.length
    ? Math.round(
        (concluidas.length / missions.length) * 100
      )
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
    mensagemLyra: buildLyraMessage(
      missions,
      context
    ),
    resumoDecisao,
  };
}




