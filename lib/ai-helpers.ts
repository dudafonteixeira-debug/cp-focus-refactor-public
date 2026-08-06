import { loadFromStorage, saveToStorage } from "@/lib/storage-core";

export const IA_STORAGE_KEY = "cp_focus_ia_key";
export const IA_ENABLED_KEY = "cp_focus_ia_enabled";

export function getIAConfig() {
  if (typeof window === "undefined") {
    return { enabled: false, hasKey: false, key: "" };
  }

  const key = loadFromStorage<string>(IA_STORAGE_KEY, "");
  const enabled = loadFromStorage<string>(IA_ENABLED_KEY, "0") === "1";

  return {
    enabled,
    hasKey: !!key,
    key,
  };
}

export function saveIAConfig(key: string, enabled: boolean) {
  if (typeof window === "undefined") return;
  saveToStorage(IA_STORAGE_KEY, key);
  saveToStorage(IA_ENABLED_KEY, enabled ? "1" : "0");
}

export function iaLigada() {
  const cfg = getIAConfig();
  return cfg.enabled && cfg.hasKey;
}

export function gerarTextoIAFake(tipo: string, base: string) {
  const texto = base.trim() || "conteúdo informado";

  if (tipo === "modo-cp") {
    return {
      titulo: "Resposta IA",
      texto: `Explicação mais elaborada com estilo de IA sobre: ${texto}.`,
    };
  }

  if (tipo === "flashcards") {
    return Array.from({ length: 5 }).map((_, i) => ({
      frente: `Flashcard IA ${i + 1}: ${texto}`,
      verso: `Resposta elaborada de revisão para ${texto}, com foco em prova.`,
    }));
  }

  if (tipo === "planejamento") {
    return [
      `Priorizar ${texto} nos próximos estudos.`,
      `Alternar teoria, revisão e questões em ${texto}.`,
      `Revisar novamente em 24h e 7 dias.`,
    ];
  }

  if (tipo === "metas") {
    return [
      `Meta sugerida: 2 horas semanais para ${texto}.`,
      `Meta sugerida: 20 questões de ${texto}.`,
    ];
  }

  if (tipo === "revisao") {
    return [`Revisão resumida e priorizada para ${texto}.`];
  }

  return {
    titulo: "IA",
    texto: `Conteúdo gerado para ${texto}.`,
  };
}

