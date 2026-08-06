import { todayKey as getTodayKey, toLocalDateKey } from "@/lib/date-utils";
export type AdaptiveMateriaScore = {
  materia: string;
  score: number;
  nivel: "forte" | "media" | "critica";
  tempoEstudadoMin: number;
  revisoes: number;
  erros: number;
};

function arr(value: any): any[] {
  return Array.isArray(value) ? value : [];
}

function normalizarTexto(value: any) {
  return String(value || "Sem materia")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function nomeMateriaCanonico(value: any) {
  const raw = String(value || "Sem materia").trim();
  const key = normalizarTexto(raw);

  if (key === "portugues" || key.includes("portugu")) return "Portugues";
  if (key.includes("constitucional")) return "Direito Constitucional";
  if (key.includes("transito")) return "Legislacao de Transito";

  return raw || "Sem materia";
}

export function calcularAdaptiveScores(params: {
  sessoes?: any[];
  reviews?: any[];
  erros?: any[];
  flashcards?: any[];
  questoes?: any[];
  simulados?: any[];
}) {
  const sessoes = arr(params.sessoes);
  const reviews = arr(params.reviews);
  const erros = arr(params.erros);
  const flashcards = arr(params.flashcards);
  const questoes = arr(params.questoes);
  const simulados = arr(params.simulados);

  const materiaMap = new Map<string, AdaptiveMateriaScore>();

  function ensureMateria(nome: string) {
    const canonico = nomeMateriaCanonico(nome);
    const key = normalizarTexto(canonico);

    if (!materiaMap.has(key)) {
      materiaMap.set(key, {
        materia: canonico,
        score: 0,
        nivel: "media",
        tempoEstudadoMin: 0,
        revisoes: 0,
        erros: 0,
      });
    }

    return materiaMap.get(key)!;
  }

  sessoes.forEach((sessao) => {
    const item = ensureMateria(sessao.materia || "Sem materia");

    item.tempoEstudadoMin += Math.round(
      Number(sessao.segundosEstudados || 0) / 60
    );

    item.score += 2;
  });

  reviews.forEach((review) => {
    const item = ensureMateria(review.materiaNome || review.materia || "Sem materia");

    item.revisoes += 1;
    item.score += Number(review.acertos || 0) * 3;
    item.score -= Number(review.erros || 0) * 5;
  });

  simulados.forEach((simulado) => {
    const questoesSimulado = arr(simulado.questoes);
    const respostas = simulado.respostas || {};

    questoesSimulado.forEach((questao: any) => {
      const nome = questao.materia || questao.materiaNome || "Sem materia";
      const item = ensureMateria(nome);
      const acertou = respostas[questao.id] === questao.correta;

      if (acertou) {
        item.score += 2;
      } else {
        item.erros += 1;
        item.score -= 12;
      }
    });
  });

  questoes.forEach((questao) => {
    const item = ensureMateria(questao.materia || questao.materiaNome || "Sem materia");

    if (questao.acertou) {
      item.score += 3;
    } else {
      item.erros += 1;
      item.score -= 10;
    }
  });

  flashcards.forEach((card) => {
    const item = ensureMateria(card.materia || card.materiaNome || "Sem materia");

    if (card.ultimaNota === "dificil") {
      item.erros += 1;
      item.score -= 6;
    }

    if (card.ultimaNota === "regular") item.score -= 3;
    if (card.ultimaNota === "bom") item.score += 2;
    if (card.ultimaNota === "excelente") item.score += 4;

    if (
      String(card.proximaRevisao || "").slice(0, 10) <=
      getTodayKey()
    ) {
      item.score -= 2;
    }
  });

  erros.forEach((erro) => {
    const item = ensureMateria(erro.materiaNome || erro.materia || "Sem materia");

    item.erros += 1;
    item.score -= 8;
  });

  return [...materiaMap.values()]
    .filter((item) => normalizarTexto(item.materia) !== "sem materia")
    .map((item) => {
      let nivel: "forte" | "media" | "critica" = "media";

      if (item.score >= 25) nivel = "forte";
      else if (item.score <= 0) nivel = "critica";

      return {
        ...item,
        nivel,
      };
    })
    .sort((a, b) => a.score - b.score);
}
