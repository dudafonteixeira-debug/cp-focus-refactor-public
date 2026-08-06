"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { aplicarPerfilNoPlanejamento } from "@/lib/profile/planner-profile-adapter";
import { loadAppData, updateAppData } from "@/lib/app-storage";
import { getPerfilUsuario } from "@/lib/data-access/app-repository";
import { loadPlanoDia, persistPlanoDia } from "@/lib/planning-state";
import {
  asArray,
  clamp,
  loadPlanningConfig,
  PLANNING_DAYS,
  prioridadeScore,
  savePlanningConfig,
} from "@/lib/planning/core";
import type {
  BrainMateria,
  PlanoTask,
  PlanningBrain,
  PlanningViewModel,
  Prioridade,
  TipoTask,
} from "@/lib/planning/types";

export function usePlanning(): PlanningViewModel {
  const router = useRouter();
  const [appData, setAppData] = useState<any>(null);
  const [dadosUsuario, setDadosUsuario] = useState<any>({});
  const [brain, setBrain] = useState<PlanningBrain | null>(null);
  const [tasks, setTasks] = useState<PlanoTask[]>([]);
  const [configAberta, setConfigAberta] = useState(false);
  const [novaMateria, setNovaMateria] = useState("");
  const [mounted, setMounted] = useState(false);

  const reload = useCallback(async () => {
    const app = loadAppData();
    const [loadedBrain, loadedTasks, loadedPerfil] = await Promise.all([
      loadPlanningConfig(app),
      loadPlanoDia<PlanoTask>(),
      getPerfilUsuario<any>({}),
    ]);

    setAppData(app);
    setBrain(loadedBrain);
    setTasks(loadedTasks);
    setDadosUsuario(loadedPerfil);
  }, []);

  useEffect(() => {
    setMounted(true);
    void reload();
  }, [reload]);

  const materias = asArray<any>(appData?.materias);
  const perfilPlanejamento = useMemo(
    () =>
      aplicarPerfilNoPlanejamento({
        dadosUsuario,
        perfil: {},
        comportamento: {},
        capacidadePadraoMin: 180,
      }),
    [dadosUsuario],
  );

  const capacidadeMinutos = useMemo(() => {
    const horas = Number(String(brain?.horasDia || "2").replace(",", "."));
    return clamp(Math.round((Number.isFinite(horas) ? horas : 2) * 60), 30, 720);
  }, [brain]);

  const materiasAtivas = asArray<BrainMateria>(brain?.materias).filter(
    (materia) => materia.ativa !== false,
  );
  const pendentes = tasks.filter((task) => !task.concluida);
  const concluidas = tasks.filter((task) => task.concluida);
  const progressoDia = tasks.length
    ? Math.round((concluidas.length / tasks.length) * 100)
    : 0;

  async function updateBrain(next: PlanningBrain) {
    setBrain(next);
    await savePlanningConfig(next);
  }

  function updateMateria(materiaId: string, patch: Partial<BrainMateria>) {
    if (!brain) return;
    void updateBrain({
      ...brain,
      materias: brain.materias.map((item) =>
        String(item.materiaId) === String(materiaId)
          ? { ...item, ...patch }
          : item,
      ),
    });
  }

  function toggleDia(dia: string) {
    if (!brain) return;
    void updateBrain({
      ...brain,
      diasSemana: brain.diasSemana.includes(dia)
        ? brain.diasSemana.filter((item) => item !== dia)
        : [...brain.diasSemana, dia],
    });
  }

  async function gerarPlanoDoDia() {
    if (!brain) return;

    const configMap = new Map(
      brain.materias.map((materia) => [String(materia.materiaId), materia]),
    );
    const candidatas: PlanoTask[] = [];

    materias.forEach((materia) => {
      const config = configMap.get(String(materia.id));
      if (!config || config.ativa === false) return;

      asArray<any>(materia.topicos).forEach((topico) => {
        asArray<any>(topico.subtopicos).forEach((sub) => {
          const erros = asArray(sub.erros).length + asArray(sub.questoesErradas).length;
          const estudado = Boolean(sub.estudado || sub.concluido);
          const peso = clamp(Number(config.peso || 3), 1, 5);
          const ordem = clamp(Number(config.ordem || 99), 1, 99);

          let score = peso * 40;
          score += prioridadeScore(config.prioridade);
          score += Math.max(0, 90 - ordem * 10);
          if (!estudado) score += 50;
          if (erros > 0) score += 120 + erros * 15;

          const possuiQuestoes =
            asArray(sub.questoesErradas).length > 0 || asArray(sub.erros).length > 0;
          const tipo: TipoTask = possuiQuestoes
            ? "Correcao"
            : estudado
              ? "Revisao"
              : "Estudo";
          const prioridade: Prioridade =
            score >= 220 ? "Alta" : score >= 140 ? "Media" : "Baixa";

          candidatas.push({
            id: `${materia.id}-${topico.id}-${sub.id}`,
            materiaId: materia.id,
            topicoId: topico.id,
            subtopicoId: sub.id,
            materia: materia.nome || "Materia",
            topico: topico.nome || "Topico",
            titulo: sub.nome || "Subtopico",
            tipo,
            prioridade,
            score,
            minutos: tipo === "Correcao" ? 25 : peso >= 4 ? 45 : 35,
            concluida: false,
            motivo: `peso ${peso}, ordem ${ordem}, prioridade ${config.prioridade}${erros ? `, ${erros} erro(s)` : ""}`,
          });
        });
      });
    });

    const plano: PlanoTask[] = [];
    let minutos = 0;

    for (const task of candidatas.sort((a, b) => b.score - a.score)) {
      if (plano.length >= perfilPlanejamento.limiteTarefas) break;
      if (minutos + task.minutos > capacidadeMinutos && plano.length >= 2) continue;
      plano.push(task);
      minutos += task.minutos;
      if (minutos >= capacidadeMinutos) break;
    }

    await persistPlanoDia(plano);
    setTasks(plano);
  }

  function abrirTask(task: PlanoTask) {
    if (task.tipo === "Correcao") {
      router.push(`/questoes?materia=${encodeURIComponent(task.materia)}&topico=${encodeURIComponent(task.topico)}&origem=planner`);
      return;
    }
    if (task.tipo === "Revisao") {
      router.push(`/revisao-inteligente?materia=${encodeURIComponent(task.materia)}&topico=${encodeURIComponent(task.topico)}&origem=planner`);
      return;
    }
    if (task.materiaId && task.topicoId && task.subtopicoId) {
      router.push(`/materias/${task.materiaId}/${task.topicoId}/${task.subtopicoId}`);
      return;
    }
    router.push("/materias");
  }

  function continuarDia() {
    const proxima = tasks.find((task) => !task.concluida);
    if (proxima) abrirTask(proxima);
    else void gerarPlanoDoDia();
  }

  async function concluirTask(taskId: string) {
    const updated = tasks.map((task) =>
      task.id === taskId ? { ...task, concluida: !task.concluida } : task,
    );
    await persistPlanoDia(updated);
    setTasks(updated);
  }

  async function adicionarMateriaManual() {
    const nome = novaMateria.trim();
    if (!nome) return;
    const now = Date.now();
    const id = `mat-${now}`;

    updateAppData((data: any) => ({
      ...data,
      materias: [
        ...asArray(data.materias),
        {
          id,
          nome,
          origem: "planejamento",
          topicos: [
            {
              id: `top-${now}`,
              nome: "Conteudo principal",
              subtopicos: [
                {
                  id: `sub-${now}`,
                  nome: "Primeiro subtopico",
                  estudado: false,
                  conteudos: [],
                  anotacoes: [],
                  erros: [],
                },
              ],
            },
          ],
        },
      ],
    }));

    setNovaMateria("");
    await reload();
  }

  return {
    brain,
    capacidadeMinutos,
    concluidas,
    configAberta,
    dias: PLANNING_DAYS,
    gerarPlanoDoDia,
    continuarDia,
    abrirTask,
    concluirTask,
    materiasAtivas,
    mensagemLyra: perfilPlanejamento.mensagemLyra,
    mounted,
    novaMateria,
    pendentes,
    progressoDia,
    setConfigAberta,
    setNovaMateria,
    tasks,
    toggleDia,
    updateBrain,
    updateMateria,
    adicionarMateriaManual,
  };
}
