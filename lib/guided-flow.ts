import { loadFromStorage, saveToStorage } from "@/lib/storage-core";

export type GuidedFlowStep = {
  tipo: string;
  titulo: string;
  detalhe?: string;
  href: string;
  sourceId?: string;
  sourceType?: string;
  cor?: string;
};

export type GuidedFlowState = {
  active: boolean;
  index: number;
  steps: GuidedFlowStep[];
  completed: string[];
  startedAt: string;
  updatedAt: string;
};

const KEY = "cp-focus-guided-flow";

function safeWindow() {
  return typeof window !== "undefined";
}

export function loadGuidedFlow(): GuidedFlowState | null {
  if (!safeWindow()) return null;

  try {
    const raw = loadFromStorage<any>(KEY, null);
    if (!raw) return null;
    return raw;
  } catch {
    return null;
  }
}

export function saveGuidedFlow(flow: GuidedFlowState) {
  if (!safeWindow()) return;

  saveToStorage(KEY, flow);
  window.dispatchEvent(new Event("cp-focus-guided-flow-updated"));
}

export function startGuidedFlow(steps: GuidedFlowStep[], index = 0) {
  const cleanSteps = steps.filter((step) => step?.href);

  const flow: GuidedFlowState = {
    active: true,
    index,
    steps: cleanSteps,
    completed: [],
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveGuidedFlow(flow);
  return flow;
}

export function stopGuidedFlow() {
  const flow = loadGuidedFlow();
  if (!flow) return;

  saveGuidedFlow({
    ...flow,
    active: false,
    updatedAt: new Date().toISOString(),
  });
}

export function completeCurrentAndGetNext() {
  const flow = loadGuidedFlow();
  if (!flow || !flow.active) return null;

  const current = flow.steps[flow.index];
  const completedId = `${flow.index}:${current?.href || ""}`;

  const nextIndex = flow.index + 1;
  const hasNext = nextIndex < flow.steps.length;

  const nextFlow: GuidedFlowState = {
    ...flow,
    index: hasNext ? nextIndex : flow.index,
    active: hasNext,
    completed: Array.from(new Set([...flow.completed, completedId])),
    updatedAt: new Date().toISOString(),
  };

  saveGuidedFlow(nextFlow);

  return hasNext ? flow.steps[nextIndex] : null;
}
