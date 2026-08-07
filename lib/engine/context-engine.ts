import { calcularAdaptiveScores } from "@/lib/adaptive/engine";
import {
  getBancoErros,
  getFlashcards,
  getQuestoesHistorico,
  getRevisoes,
  getSessoesEstudo,
  getSimuladosProva,
} from "@/lib/data-access/app-repository";
import { todayKey } from "@/lib/planning-state";
import type { EngineContext } from "@/lib/engine/types";

export async function buildEngineContext(
  input: Partial<EngineContext> = {}
): Promise<EngineContext> {
  const [sessoes, revisoes, erros, flashcards, questoes, simulados] =
    await Promise.all([
      getSessoesEstudo<any[]>([]),
      getRevisoes<any[]>([]),
      getBancoErros<any[]>([]),
      getFlashcards<any[]>([]),
      getQuestoesHistorico<any[]>([]),
      getSimuladosProva<any[]>([]),
    ]);

  const radar = calcularAdaptiveScores({
    sessoes,
    reviews: revisoes,
    erros,
    flashcards,
    questoes,
    simulados,
  });

  return {
    data: input.data || todayKey(),
    tempoDisponivelMinutos: input.tempoDisponivelMinutos,
    energia: input.energia,
    sessoes,
    revisoes,
    erros,
    flashcards,
    questoes,
    simulados,
    radar,
  };
}
