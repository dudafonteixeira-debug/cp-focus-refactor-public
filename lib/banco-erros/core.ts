import type { CadernoIA, ErroItem, ModoIA, PrioridadeErro } from "@/lib/banco-erros/types";

export function arr<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : [];
}

export function uid(prefix = "id") {
  return prefix + "_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
}

export function safeString(value: unknown, fallback = "") {
  if (typeof value === "string") return value;
  if (value == null) return fallback;
  return String(value);
}

export function prioridadeLabel(value: PrioridadeErro) {
  if (value === "critico") return "Crítico";
  if (value === "medio") return "Médio";
  return "Leve";
}

export function prioridadePeso(value: PrioridadeErro) {
  if (value === "critico") return 3;
  if (value === "medio") return 2;
  return 1;
}

export function normalizePrioridade(value: any): PrioridadeErro {
  if (value === "critico") return "critico";
  if (value === "medio") return "medio";
  return "leve";
}

export function deepText(value: any): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map(deepText).filter(Boolean).join("\n");

  if (typeof value === "object") {
    const keys = ["text", "response", "message", "output", "content", "answer", "resultado", "resposta"];
    for (const key of keys) {
      if (key in value) {
        const found = deepText(value[key]);
        if (found) return found;
      }
    }

    if (Array.isArray(value.parts)) {
      const found = value.parts.map(deepText).filter(Boolean).join("\n");
      if (found) return found;
    }

    if (Array.isArray(value.candidates)) {
      const found = value.candidates.map(deepText).filter(Boolean).join("\n");
      if (found) return found;
    }
  }

  return "";
}

export function extractJson(text: string) {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first >= 0 && last > first) return cleaned.slice(first, last + 1);
  return cleaned;
}

export function parseCaderno(raw: any): CadernoIA | null {
  const tentativas: string[] = [];

  function coletar(value: any) {
    if (!value) return;

    if (typeof value === "string") {
      tentativas.push(value);
      return;
    }

    if (typeof value === "object") {
      ["text", "response", "message", "output", "content", "answer", "resultado", "resposta", "data"].forEach((key) => {
        if (value[key]) coletar(value[key]);
      });

      if (Array.isArray(value.parts)) value.parts.forEach(coletar);
      if (Array.isArray(value.candidates)) value.candidates.forEach(coletar);
    }
  }

  coletar(raw);

  for (const texto of tentativas) {
    const limpo = texto
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const first = limpo.indexOf("{");
    const last = limpo.lastIndexOf("}");

    const possiveis = [
      limpo,
      first >= 0 && last > first ? limpo.slice(first, last + 1) : "",
    ].filter(Boolean);

    for (const item of possiveis) {
      try {
        const parsed = JSON.parse(item);

        const questoes = arr<any>(parsed.questoes)
          .map((q, index) => ({
            id: safeString(q.id, "q_" + index),
            enunciado: safeString(q.enunciado),
            alternativas: arr<any>(q.alternativas).map((a) => safeString(a)).filter(Boolean),
            correta: Number(q.correta ?? 0),
            explicacao: safeString(q.explicacao),
            modo: (q.modo === "cespe" ? "cespe" : "objetiva") as ModoIA,
          }))
          .filter((q) => q.enunciado && q.alternativas.length >= 2);

        if (questoes.length) {
          return {
            titulo: safeString(parsed.titulo, "Treino adaptativo do banco de erros"),
            questoes,
          };
        }
      } catch {}
    }
  }

  return null;
}

export function collectErros(app: any): ErroItem[] {
  const itens: ErroItem[] = [];

  arr<any>(app?.materias).forEach((materia) => {
    arr<any>(materia?.topicos).forEach((topico) => {
      arr<any>(topico?.subtopicos).forEach((sub) => {
        arr<any>(sub?.erros).forEach((erro, index) => {
          itens.push({
            id: safeString(erro.id, `${materia.id}_${topico.id}_${sub.id}_erro_${index}`),
            materiaId: safeString(materia.id),
            topicoId: safeString(topico.id),
            subtopicoId: safeString(sub.id),
            materiaNome: safeString(materia.nome, "Sem matéria"),
            topicoNome: safeString(topico.nome, "Sem tópico"),
            subtopicoNome: safeString(sub.nome, "Sem subtópico"),
            enunciado: safeString(erro.enunciado, "Erro sem enunciado"),
            respostaUsuario: safeString(erro.respostaUsuario),
            respostaCorreta: safeString(erro.respostaCorreta),
            comentario: safeString(erro.comentario),
            criadoEm: safeString(erro.criadoEm, new Date().toISOString()),
            origem: "erros",
            prioridade: normalizePrioridade(erro.prioridade),
          });
        });

        arr<any>(sub?.questoesErradas).forEach((erro, index) => {
          itens.push({
            id: safeString(erro.id, `${materia.id}_${topico.id}_${sub.id}_questao_${index}`),
            materiaId: safeString(materia.id),
            topicoId: safeString(topico.id),
            subtopicoId: safeString(sub.id),
            materiaNome: safeString(materia.nome, "Sem matéria"),
            topicoNome: safeString(topico.nome, "Sem tópico"),
            subtopicoNome: safeString(sub.nome, "Sem subtópico"),
            enunciado: safeString(erro.enunciado, "Erro sem enunciado"),
            respostaUsuario: safeString(erro.respostaUsuario),
            respostaCorreta: safeString(erro.respostaCorreta),
            comentario: safeString(erro.comentario),
            criadoEm: safeString(erro.criadoEm, new Date().toISOString()),
            origem: "questoesErradas",
            prioridade: normalizePrioridade(erro.prioridade),
          });
        });
      });
    });
  });

  return itens;
}

export function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

export function delayIA(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
