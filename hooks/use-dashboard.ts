"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { calcularAdaptiveScores } from "@/lib/adaptive/engine";
import { loadAppData } from "@/lib/app-storage";
import { getSessoesEstudo } from "@/lib/data-access/app-repository";
import {
  asArray,
  calculateDashboardStats,
  calculateTodayAnalytics,
} from "@/lib/dashboard/analytics";
import type { DashboardTask } from "@/lib/dashboard/types";
import { getMissionRoute, getTodayMissions } from "@/lib/engine";
import { loadFase2Store } from "@/lib/fase2-storage";
import {
  loadPlanningBrain,
  persistPlanoDia,
} from "@/lib/planning-state";

export function useDashboard() {
  const router = useRouter();
  const [appData, setAppData] = useState<any>(null);
  const [tasks, setTasks] = useState<DashboardTask[]>([]);
  const [brain, setBrain] = useState<any>(null);
  const [fase2, setFase2] = useState<any>(null);
  const [sessoes, setSessoes] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mensagemLyra, setMensagemLyra] = useState("");

  const carregar = useCallback(async () => {
    setError(null);

    try {
      const app = loadAppData();

      const [engineResult, planningBrain, sessoesSalvas] = await Promise.all([
        getTodayMissions(),
        loadPlanningBrain<any>(null),
        getSessoesEstudo<any[]>([]),
      ]);

      setAppData(app);
      setTasks(engineResult.missions);
      setMensagemLyra(engineResult.mensagemLyra);
      setBrain(planningBrain);
      setFase2(loadFase2Store());
      setSessoes(sessoesSalvas);
    } catch (cause) {
      console.error("Falha ao carregar dashboard", cause);
      setError("Nao foi possivel atualizar todos os dados do dashboard.");
    }
  }, []);

  useEffect(() => {
    void carregar();

    const atualizar = () => void carregar();

    window.addEventListener("focus", atualizar);
    window.addEventListener(
      "cp-focus-sessoes-updated",
      atualizar as EventListener
    );

    return () => {
      window.removeEventListener("focus", atualizar);
      window.removeEventListener(
        "cp-focus-sessoes-updated",
        atualizar as EventListener
      );
    };
  }, [carregar]);

  const materias = useMemo(
    () => asArray<any>(appData?.materias),
    [appData]
  );

  const pendentes = useMemo(
    () => tasks.filter((task) => !task.concluida),
    [tasks]
  );

  const concluidas = useMemo(
    () => tasks.filter((task) => task.concluida),
    [tasks]
  );

  const stats = useMemo(
    () => calculateDashboardStats(materias, tasks),
    [materias, tasks]
  );

  const analyticsHoje = useMemo(
    () => calculateTodayAnalytics(sessoes),
    [sessoes]
  );

  const revisoesPendentes = useMemo(
    () =>
      asArray<any>(fase2?.reviews)
        .filter((item: any) => !item?.ultimaRespostaEm)
        .slice(0, 3),
    [fase2]
  );

  const adaptiveRadar = useMemo(
    () =>
      calcularAdaptiveScores({
        sessoes,
        reviews: asArray(fase2?.reviews),
        erros: asArray(appData?.bancoErros),
      }).slice(0, 6),
    [appData, fase2, sessoes]
  );

  const appVazio = materias.length === 0;
  const semPlano = !appVazio && tasks.length === 0;
  const diaConcluido = tasks.length > 0 && pendentes.length === 0;
  const proxima = pendentes[0] || null;
  const proximasMissoes = pendentes.slice(1, 5);

  const abrirTask = useCallback(
    (task: DashboardTask) => router.push(getMissionRoute(task)),
    [router]
  );

  const comecarDia = useCallback(() => {
    if (appVazio) return router.push("/onboarding");
    if (semPlano) return router.push("/planejamento-inteligente");
    if (proxima) return router.push("/modo-foco");
    return router.push("/planejamento-inteligente");
  }, [appVazio, proxima, router, semPlano]);

  const concluirTask = useCallback(
    async (taskId: string) => {
      const anterior = tasks;

      const atualizadas = tasks.map((task) =>
        task.id === taskId
          ? { ...task, concluida: !task.concluida }
          : task
      );

      setTasks(atualizadas);

      try {
        await persistPlanoDia(atualizadas);
      } catch (cause) {
        console.error("Falha ao salvar tarefa do dashboard", cause);
        setTasks(anterior);
        setError("Nao foi possivel salvar a alteracao da tarefa.");
      }
    },
    [tasks]
  );

  return {
    adaptiveRadar,
    analyticsHoje,
    appVazio,
    abrirTask,
    brain,
    carregar,
    comecarDia,
    concluidas,
    concluirTask,
    diaConcluido,
    error,
    materias,
    mensagemLyra,
    pendentes,
    proxima,
    proximasMissoes,
    revisoesPendentes,
    semPlano,
    stats,
    tasks,
  };
}



