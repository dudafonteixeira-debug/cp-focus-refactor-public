import { loadFromStorage, saveToStorage } from "@/lib/storage-core";

import { addXp, loadGamificacao } from "@/lib/gamificacao";

export type XpState = {
  xp: number;
  level: number;
  streak: number;
  lastStudyDate: string | null;
  updatedAt: string;
};

const CLAIMED_KEY = "cp-focus-xp-claimed-steps";

async function toXpState(): Promise<XpState> {
  const game = await loadGamificacao();

  return {
    xp: Number(game.xp || 0),
    level: Number(game.nivel || 1),
    streak: Number(game.streak || 0),
    lastStudyDate: game.ultimaAtividade || null,
    updatedAt: new Date().toISOString(),
  };
}

export async function loadXpState(): Promise<XpState> {
  return toXpState();
}

export async function saveXpState(
  _state: XpState
): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    window.dispatchEvent(
      new CustomEvent("cp-focus-gamificacao-updated", {
        detail: await loadGamificacao(),
      })
    );
  } catch {}
}

export async function addStudyXp(
  amount: number
): Promise<XpState> {
  await addXp(Math.max(0, amount));

  return toXpState();
}

export function xpForNextLevel(state: XpState): number {
  return state.level * 250;
}

export function currentLevelProgress(state: XpState): number {
  const previousLevelXp = (state.level - 1) * 250;
  const nextLevelXp = state.level * 250;
  const progress = state.xp - previousLevelXp;
  const total = nextLevelXp - previousLevelXp;

  return Math.min(
    100,
    Math.round((progress / total) * 100)
  );
}

function loadClaimedXpKeys(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = loadFromStorage<any>(CLAIMED_KEY, null);

    return raw ? raw : [];
  } catch {
    return [];
  }
}

function saveClaimedXpKeys(keys: string[]): void {
  if (typeof window === "undefined") return;

  saveToStorage(CLAIMED_KEY, Array.from(new Set(keys)));
}

export async function awardXpOnce(
  stepKey: string,
  amount: number
): Promise<{
  state: XpState;
  awarded: boolean;
}> {
  const key = String(stepKey || "").trim();

  if (!key) {
    const state = await addStudyXp(amount);

    return {
      state,
      awarded: true,
    };
  }

  const claimed = loadClaimedXpKeys();

  if (claimed.includes(key)) {
    return {
      state: await loadXpState(),
      awarded: false,
    };
  }

  const state = await addStudyXp(amount);

  saveClaimedXpKeys([...claimed, key]);

  return {
    state,
    awarded: true,
  };
}

