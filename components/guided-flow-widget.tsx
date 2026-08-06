"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  completeCurrentAndGetNext,
  loadGuidedFlow,
  stopGuidedFlow,
  type GuidedFlowState,
} from "@/lib/guided-flow";
import { awardXpOnce, loadXpState } from "@/lib/xp-system";
import { loadPlannerUI, savePlannerUI } from "@/lib/planner-ui-storage";



function getStepXpKey(step: any) {
  return String(step?.sourceId || step?.href || step?.titulo || "");
}

function markPlannerTaskDone(step: any) {
  if (!step?.sourceId || step?.sourceType !== "planner-block") return;

  try {
    const ui = loadPlannerUI();
    const completed = Array.isArray(ui?.completedBlockIds) ? ui.completedBlockIds : [];

    if (!completed.includes(step.sourceId)) {
      savePlannerUI({
        ...ui,
        completedBlockIds: [...completed, String(step.sourceId)],
      });

      window.dispatchEvent(new Event("cp-focus-planner-updated"));
    }
  } catch (error) {
    console.error("Erro ao marcar tarefa do planejamento como concluida", error);
  }
}

export default function GuidedFlowWidget() {
  const router = useRouter();
  const [flow, setFlow] = useState<GuidedFlowState | null>(null);
  const [reward, setReward] = useState<null | {
    xp: number;
    levelUp: boolean;
    level: number;
  }>(null);

  function refresh() {
    setFlow(loadGuidedFlow());
  }

  useEffect(() => {
    refresh();

    window.addEventListener("cp-focus-guided-flow-updated", refresh);
    window.addEventListener("focus", refresh);

    return () => {
      window.removeEventListener("cp-focus-guided-flow-updated", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  function showReward(xp: number, levelUp: boolean, level: number) {
    setReward({ xp, levelUp, level });

    window.setTimeout(() => {
      setReward(null);
    }, 2600);
  }

  if (!flow?.active || !flow.steps?.length) return null;

  const current = flow.steps[flow.index];
  const total = flow.steps.length;
  const atual = flow.index + 1;

  async function next() {
    markPlannerTaskDone(current);

    const before = await loadXpState();
    const result = await awardXpOnce(getStepXpKey(current), 35);
    const after = result.state;

    if (result.awarded) {
      showReward(35, after.level > before.level, after.level);
    }

    const nextStep = completeCurrentAndGetNext();
    refresh();

    if (nextStep?.href) {
      window.setTimeout(() => {
        router.push(nextStep.href);
      }, 650);
    }
  }

  function close() {
    stopGuidedFlow();
    refresh();
  }

  return (
    <>
      {reward && (
        <div className="fixed right-5 top-5 z-[99999] w-[min(360px,calc(100vw-2rem))] animate-[rewardPop_.45s_ease-out] rounded-[1.5rem] border border-cyan-300/40 bg-gradient-to-br from-[#082f49]/95 via-[#11163a]/95 to-violet-950/95 p-5 text-white shadow-2xl shadow-cyan-950/50 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-cyan-400/15 text-3xl shadow-[0_0_30px_rgba(34,211,238,0.35)]">
              ✨
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">
                Recompensa
              </p>
              <h3 className="mt-1 text-xl font-black">
                +{reward.xp} XP
              </h3>
              <p className="mt-1 text-xs text-slate-300">
                {reward.levelUp
                  ? `Parabens! Voce subiu para o nivel ${reward.level}.`
                  : "Etapa concluida. Continue o fluxo!"}
              </p>
            </div>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-full animate-[rewardBar_2.4s_ease-out] rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500" />
          </div>
        </div>
      )}

      <div className="fixed bottom-5 right-5 z-[9998] w-[min(380px,calc(100vw-2rem))] rounded-[1.7rem] border border-cyan-300/30 bg-gradient-to-br from-[#082f49]/95 via-[#11163a]/95 to-violet-950/95 p-4 text-white shadow-2xl shadow-cyan-950/40 backdrop-blur-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-cyan-200">
              Fluxo guiado
            </p>
            <h3 className="mt-1 text-lg font-black">
              {current?.tipo || "Etapa"} {atual}/{total}
            </h3>
          </div>

          <button
            type="button"
            onClick={close}
            className="rounded-xl border border-white/10 px-3 py-2 text-xs font-black text-slate-300 hover:bg-white/10"
          >
            Fechar
          </button>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
          <p className="text-sm font-black">{current?.titulo}</p>
          {current?.detalhe && (
            <p className="mt-1 text-xs leading-5 text-slate-300">{current.detalhe}</p>
          )}
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 transition-all duration-500"
            style={{ width: `${Math.round((atual / total) * 100)}%` }}
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => current?.href && router.push(current.href)}
            className="rounded-2xl border border-cyan-300/25 bg-cyan-500/10 px-4 py-3 text-xs font-black text-cyan-100 hover:bg-cyan-500/15"
          >
            Abrir etapa
          </button>

          <button
            type="button"
            onClick={next}
            className="rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-3 text-xs font-black text-white shadow-lg shadow-cyan-950/30 transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
          >
            Concluir e proximo
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes rewardPop {
          0% {
            opacity: 0;
            transform: translateY(-16px) scale(0.96);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes rewardBar {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}

