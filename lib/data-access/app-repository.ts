import { DATA_KEYS } from "@/lib/data-access/keys";
import { readData, writeData, removeData } from "@/lib/data-access/provider";

export async function getAppData<T = any>(fallback: T): Promise<T> {
  return readData<T>(DATA_KEYS.app, fallback);
}

export async function saveAppDataRepo<T = any>(data: T): Promise<void> {
  return writeData<T>(DATA_KEYS.app, data);
}

export async function getPerfilUsuario<T = any>(fallback: T): Promise<T> {
  return readData<T>(DATA_KEYS.perfilUsuario, fallback);
}

export async function savePerfilUsuario<T = any>(data: T): Promise<void> {
  return writeData<T>(DATA_KEYS.perfilUsuario, data);
}

export async function getSimuladosProva<T = any[]>(fallback: T): Promise<T> {
  return readData<T>(DATA_KEYS.simuladosProva, fallback);
}

export async function saveSimuladosProva<T = any[]>(data: T): Promise<void> {
  return writeData<T>(DATA_KEYS.simuladosProva, data);
}

export async function getQuestoesHistorico<T = any[]>(fallback: T): Promise<T> {
  return readData<T>(DATA_KEYS.questoesHistorico, fallback);
}

export async function saveQuestoesHistorico<T = any[]>(data: T): Promise<void> {
  return writeData<T>(DATA_KEYS.questoesHistorico, data);
}

export async function getFlashcards<T = any[]>(fallback: T): Promise<T> {
  return readData<T>(DATA_KEYS.flashcardsV2, fallback);
}

export async function saveFlashcards<T = any[]>(data: T): Promise<void> {
  return writeData<T>(DATA_KEYS.flashcardsV2, data);
}

export async function getRevisoes<T = any[]>(fallback: T): Promise<T> {
  return readData<T>(DATA_KEYS.revisoesV2, fallback);
}

export async function saveRevisoes<T = any[]>(data: T): Promise<void> {
  return writeData<T>(DATA_KEYS.revisoesV2, data);
}

export async function getSessoesEstudo<T = any[]>(fallback: T): Promise<T> {
  return readData<T>(DATA_KEYS.sessoesEstudo, fallback);
}

export async function saveSessoesEstudo<T = any[]>(data: T): Promise<void> {
  return writeData<T>(DATA_KEYS.sessoesEstudo, data);
}

export async function getBancoErros<T = any[]>(fallback: T): Promise<T> {
  return readData<T>(DATA_KEYS.bancoErros, fallback);
}

export async function saveBancoErros<T = any[]>(data: T): Promise<void> {
  return writeData<T>(DATA_KEYS.bancoErros, data);
}


export async function getProgresso<T = any>(fallback: T): Promise<T> {
  return readData<T>(DATA_KEYS.progresso, fallback);
}

export async function saveProgresso<T = any>(data: T): Promise<void> {
  return writeData<T>(DATA_KEYS.progresso, data);
}

export async function getProfileTimeline<T = any[]>(
  fallback: T
): Promise<T> {
  return readData<T>(DATA_KEYS.profileTimeline, fallback);
}

export async function saveProfileTimeline<T = any[]>(
  data: T
): Promise<void> {
  return writeData<T>(DATA_KEYS.profileTimeline, data);
}

export async function getGamificacao<T = any>(
  fallback: T
): Promise<T> {
  return readData<T>(DATA_KEYS.gamificacao, fallback);
}

export async function saveGamificacao<T = any>(
  data: T
): Promise<void> {
  return writeData<T>(DATA_KEYS.gamificacao, data);
}

export async function getFlashcardsLegacy<T = any[]>(
  fallback: T
): Promise<T> {
  return readData<T>(DATA_KEYS.flashcardsLegacyRepo, fallback);
}

export async function saveFlashcardsLegacy<T = any[]>(
  data: T
): Promise<void> {
  return writeData<T>(DATA_KEYS.flashcardsLegacyRepo, data);
}

export async function getRevisoesLegacy<T = any[]>(
  fallback: T
): Promise<T> {
  return readData<T>(DATA_KEYS.revisoesLegacy, fallback);
}

export async function saveRevisoesLegacy<T = any[]>(
  data: T
): Promise<void> {
  return writeData<T>(DATA_KEYS.revisoesLegacy, data);
}

export async function getPlanoDia<T = any>(
  fallback: T
): Promise<T> {
  return readData<T>(DATA_KEYS.planoDia, fallback);
}

export async function savePlanoDia<T = any>(
  data: T
): Promise<void> {
  return writeData<T>(DATA_KEYS.planoDia, data);
}

export async function getPlanningBrain<T = any>(
  fallback: T
): Promise<T> {
  return readData<T>(DATA_KEYS.planningBrain, fallback);
}

export async function savePlanningBrain<T = any>(
  data: T
): Promise<void> {
  return writeData<T>(DATA_KEYS.planningBrain, data);
}

export async function getOnboardingOs<T = any>(
  fallback: T
): Promise<T> {
  return readData<T>(DATA_KEYS.onboardingOs, fallback);
}

export async function saveOnboardingOs<T = any>(
  data: T
): Promise<void> {
  return writeData<T>(DATA_KEYS.onboardingOs, data);
}
export async function getPlannerConfig<T = any>(
  fallback: T
): Promise<T> {
  return readData<T>(DATA_KEYS.plannerConfig, fallback);
}

export async function savePlannerConfig<T = any>(
  data: T
): Promise<void> {
  return writeData<T>(DATA_KEYS.plannerConfig, data);
}
export async function getPlannerMissoes<T = any[]>(
  fallback: T
): Promise<T> {
  return readData<T>(DATA_KEYS.plannerMissoes, fallback);
}

export async function savePlannerMissoes<T = any[]>(
  data: T
): Promise<void> {
  return writeData<T>(DATA_KEYS.plannerMissoes, data);
}

export async function getFlashcardsPremium<T = any[]>(
  fallback: T
): Promise<T> {
  return readData<T>(DATA_KEYS.flashcardsPremium, fallback);
}

export async function saveFlashcardsPremium<T = any[]>(
  data: T
): Promise<void> {
  return writeData<T>(DATA_KEYS.flashcardsPremium, data);
}

export async function clearAllLocalUserData(): Promise<void> {
  await removeData(DATA_KEYS.app);
  await removeData(DATA_KEYS.perfilUsuario);
  await removeData(DATA_KEYS.simuladosProva);
  await removeData(DATA_KEYS.questoesHistorico);
  await removeData(DATA_KEYS.flashcardsV2);
  await removeData(DATA_KEYS.revisoesV2);
  await removeData(DATA_KEYS.sessoesEstudo);
  await removeData(DATA_KEYS.bancoErros);
  await removeData(DATA_KEYS.progresso);
  await removeData(DATA_KEYS.profileTimeline);
  await removeData(DATA_KEYS.gamificacao);
  await removeData(DATA_KEYS.flashcardsLegacyRepo);
  await removeData(DATA_KEYS.revisoesLegacy);
  await removeData(DATA_KEYS.planoDia);
  await removeData(DATA_KEYS.planningBrain);
  await removeData(DATA_KEYS.plannerConfig);
  await removeData(DATA_KEYS.onboardingOs);
  await removeData(DATA_KEYS.plannerMissoes);
  await removeData(DATA_KEYS.flashcardsPremium);
}
