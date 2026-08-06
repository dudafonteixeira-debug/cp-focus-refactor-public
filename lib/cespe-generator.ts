import type { CespeQuestion } from "@/lib/fase2-types";

function createId() {
  return `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function generateCespeQuestions(assunto: string, quantidade = 5): CespeQuestion[] {
  const base = assunto.trim() || "assunto não informado";

  return Array.from({ length: quantidade }).map((_, index) => {
    const numero = index + 1;
    const gabarito = numero % 2 === 0 ? "E" : "C";

    return {
      id: createId(),
      assunto: base,
      enunciado: `${numero}. Julgue o item a seguir acerca de ${base}: a afirmação apresentada deve ser analisada em contexto prático e conceitual.`,
      gabarito,
      explicacao:
        gabarito === "C"
          ? `O item ${numero} foi marcado como CERTO porque, neste modelo, representa uma formulação compatível com o núcleo do assunto ${base}.`
          : `O item ${numero} foi marcado como ERRADO porque, neste modelo, apresenta uma generalização indevida sobre ${base}.`,
    };
  });
}
