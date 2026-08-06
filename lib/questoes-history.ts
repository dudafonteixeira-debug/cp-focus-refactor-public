import {
  getQuestoesHistorico,
  saveQuestoesHistorico,
} from "@/lib/data-access/app-repository";
import { DATA_KEYS } from "@/lib/data-access/keys";

export const QUESTOES_HISTORY_KEY = DATA_KEYS.questoesHistorico;

function arr(value: any): any[] {
  return Array.isArray(value) ? value : [];
}

export async function salvarHistoricoQuestao(
  item: any
): Promise<any[]> {
  const atual = arr(await getQuestoesHistorico<any[]>([]));
  const next = [item, ...atual].slice(0, 500);

  await saveQuestoesHistorico(next);

  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(
        new CustomEvent("cp-focus-questoes-updated", {
          detail: next,
        })
      );
    } catch {}
  }

  return next;
}

export async function listarHistoricoQuestoes(): Promise<any[]> {
  try {
    return arr(await getQuestoesHistorico<any[]>([]));
  } catch {
    return [];
  }
}

export async function listarQuestoesErradas(): Promise<any[]> {
  const historico = await listarHistoricoQuestoes();

  return historico.filter((item: any) => !item.acertou);
}

export async function listarQuestoesCertas(): Promise<any[]> {
  const historico = await listarHistoricoQuestoes();

  return historico.filter((item: any) => item.acertou);
}
