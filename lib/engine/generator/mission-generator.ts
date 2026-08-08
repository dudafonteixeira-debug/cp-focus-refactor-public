import type { EngineContext } from "@/lib/engine/types";
import type { PlanoTask } from "@/lib/planning/types";
import { normalizeText } from "@/lib/engine/generator/helpers";
import { generateFlashcardTasks } from "@/lib/engine/generator/flashcard-generator";
import { generateQuestionTasks } from "@/lib/engine/generator/question-generator";
import { generateRecoveryTasks } from "@/lib/engine/generator/recovery-generator";
import { generateReviewTasks } from "@/lib/engine/generator/review-generator";

function needKey(task: PlanoTask): string {
  return [
    normalizeText(task.categoriaGerada || task.tipo),
    normalizeText(task.materia),
    normalizeText(task.topico),
  ].join("|");
}

export function generateAutomaticTasks(
  context: EngineContext,
  existingTasks: PlanoTask[]
): PlanoTask[] {
  const generated = [
    ...generateRecoveryTasks(context),
    ...generateReviewTasks(context),
    ...generateQuestionTasks(context),
    ...generateFlashcardTasks(context),
  ];

  const existingIds = new Set(
    existingTasks.map(
      (task) => String(task.id)
    )
  );

  const existingNeeds = new Set(
    existingTasks
      .filter(
        (task) =>
          Boolean(task.categoriaGerada) ||
          Boolean(task.origemGerada)
      )
      .map(needKey)
  );

  const seenIds = new Set<string>();
  const seenNeeds = new Set<string>();

  return generated.filter((task) => {
    const id = String(task.id);
    const need = needKey(task);

    if (existingIds.has(id)) {
      return false;
    }

    if (existingNeeds.has(need)) {
      return false;
    }

    if (seenIds.has(id)) {
      return false;
    }

    if (seenNeeds.has(need)) {
      return false;
    }

    seenIds.add(id);
    seenNeeds.add(need);

    return true;
  });
}
