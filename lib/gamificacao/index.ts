import { todayKey as getTodayKey, toLocalDateKey } from "@/lib/date-utils";
import {
  getGamificacao,
  saveGamificacao,
} from "@/lib/data-access/app-repository";

export type GamificacaoState = {
  xp: number;
  nivel: number;
  streak: number;
  ultimaAtividade: string | null;
};

const DEFAULT_STATE: GamificacaoState = {
  xp: 0,
  nivel: 1,
  streak: 0,
  ultimaAtividade: null,
};

function todayKey(): string {
  return getTodayKey();
}

function yesterdayKey(): string {
  const date = new Date();
  date.setDate(date.getDate() - 1);

  return toLocalDateKey(date);
}

export async function loadGamificacao(): Promise<GamificacaoState> {
  try {
    const data = await getGamificacao<Partial<GamificacaoState>>(
      DEFAULT_STATE
    );

    return {
      ...DEFAULT_STATE,
      ...(data || {}),
    };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export async function addXp(
  amount: number
): Promise<GamificacaoState> {
  const atual = await loadGamificacao();

  const hoje = todayKey();
  const ontem = yesterdayKey();

  let streak = atual.streak || 0;

  if (atual.ultimaAtividade !== hoje) {
    if (atual.ultimaAtividade === ontem) {
      streak += 1;
    } else {
      streak = 1;
    }
  }

  const xp = Math.max(
    0,
    Number(atual.xp || 0) + Number(amount || 0)
  );

  const nivel = Math.max(
    1,
    Math.floor(xp / 250) + 1
  );

  const next: GamificacaoState = {
    xp,
    nivel,
    streak,
    ultimaAtividade: hoje,
  };

  await saveGamificacao(next);

  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(
        new CustomEvent("cp-focus-gamificacao-updated", {
          detail: next,
        })
      );
    } catch {}
  }

  return next;
}
