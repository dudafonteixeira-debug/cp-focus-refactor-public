import { todayKey as getTodayKey, toLocalDateKey } from "@/lib/date-utils";
import type { Fase2ReviewItem, ReviewGrade } from "@/lib/fase2-types";

export function todayIsoDate() {
  return getTodayKey();
}

export function addDaysToIsoDate(isoDate: string, days: number) {
  const date = new Date(`${isoDate}T12:00:00`);
  date.setDate(date.getDate() + days);
  return toLocalDateKey(date);
}

export function isDue(isoDate: string) {
  return isoDate <= todayIsoDate();
}

export function scheduleNextReview(item: Fase2ReviewItem, grade: ReviewGrade): Fase2ReviewItem {
  let easiness = item.easiness || 2.5;
  let repeticoes = item.repeticoes || 0;
  let intervaloDias = item.intervaloDias || 0;

  if (grade < 3) {
    repeticoes = 0;
    intervaloDias = 1;
    easiness = Math.max(1.3, easiness - 0.2);
  } else {
    repeticoes += 1;

    if (repeticoes === 1) intervaloDias = 1;
    else if (repeticoes === 2) intervaloDias = 3;
    else intervaloDias = Math.round(intervaloDias * easiness);

    easiness =
      easiness +
      (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));

    easiness = Math.max(1.3, Number(easiness.toFixed(2)));
  }

  const hoje = todayIsoDate();

  return {
    ...item,
    easiness,
    repeticoes,
    intervaloDias,
    status: repeticoes >= 2 ? "revisao" : "aprendendo",
    acertos: grade >= 3 ? item.acertos + 1 : item.acertos,
    erros: grade < 3 ? item.erros + 1 : item.erros,
    ultimaRespostaEm: hoje,
    proximaRevisaoEm: addDaysToIsoDate(hoje, intervaloDias),
    atualizadoEm: new Date().toISOString(),
  };
}
