"use client";

import { PlanningCompleted } from "@/components/planning/planning-completed";
import { PlanningConfigModal } from "@/components/planning/planning-config-modal";
import { PlanningExecution } from "@/components/planning/planning-execution";
import { PlanningHeader } from "@/components/planning/planning-header";
import { PlanningMetrics } from "@/components/planning/planning-metrics";
import { PlanningOverview } from "@/components/planning/planning-overview";
import type { PlanningViewModel } from "@/lib/planning/types";

export function PlanningView(props: PlanningViewModel) {
  return (
    <main className="cp-os-page">
      <section className="mx-auto flex w-full max-w-[1320px] flex-col gap-5 px-4 py-5 md:px-6">
        <PlanningHeader gerarPlanoDoDia={props.gerarPlanoDoDia} continuarDia={props.continuarDia} />
        <PlanningOverview brain={props.brain} materiasAtivas={props.materiasAtivas.length} abrirConfig={() => props.setConfigAberta(true)} />
        <PlanningMetrics {...props} />
        <PlanningExecution pendentes={props.pendentes} gerarPlanoDoDia={props.gerarPlanoDoDia} abrirTask={props.abrirTask} concluirTask={props.concluirTask} />
        <PlanningCompleted concluidas={props.concluidas} concluirTask={props.concluirTask} />
        {props.configAberta && props.brain ? (
          <PlanningConfigModal
            brain={props.brain}
            dias={props.dias}
            novaMateria={props.novaMateria}
            fechar={() => props.setConfigAberta(false)}
            setNovaMateria={props.setNovaMateria}
            updateBrain={props.updateBrain}
            updateMateria={props.updateMateria}
            toggleDia={props.toggleDia}
            adicionarMateriaManual={props.adicionarMateriaManual}
          />
        ) : null}
      </section>
    </main>
  );
}
