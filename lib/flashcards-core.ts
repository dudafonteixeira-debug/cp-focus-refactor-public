import {
  getFlashcardsLegacy,
  saveFlashcardsLegacy,
} from "@/lib/data-access/app-repository";

function arr(value: any): any[] {
  return Array.isArray(value) ? value : [];
}

function uid(prefix: string): string {
  return (
    prefix +
    "_" +
    Date.now().toString() +
    "_" +
    Math.random().toString(36).slice(2, 9)
  );
}

export async function salvarFlashcards(
  cards: any[]
): Promise<any[]> {
  const atual = arr(
    await getFlashcardsLegacy<any[]>([])
  );

  const novos = arr(cards).map((card: any) => ({
    ...card,
    id: card.id || uid("card"),
    pergunta: card.pergunta || "",
    resposta: card.resposta || "",
    criadoEm: card.criadoEm || new Date().toISOString(),
  }));

  const next = [...atual, ...novos];

  await saveFlashcardsLegacy(next);

  return next;
}

export async function listarFlashcards(): Promise<any[]> {
  try {
    return arr(
      await getFlashcardsLegacy<any[]>([])
    );
  } catch {
    return [];
  }
}

