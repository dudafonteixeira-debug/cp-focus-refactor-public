import { createManualReview } from "@/lib/fase2-service";

export type SalvarRevisaoPayload = {
  titulo?: string;
  textoBase?: string;
  materiaId?: string;
  materiaNome?: string;
  topicoId?: string;
  topicoNome?: string;
  subtopicoId?: string;
  subtopicoNome?: string;
  origemId?: string;
  origemTipo?: "conteudo" | "subtopico" | "questao";
  tags?: string[];
};

export function salvarNaRevisaoInteligente(payload: SalvarRevisaoPayload) {
  return createManualReview({
    titulo:
      payload.titulo ||
      payload.subtopicoNome ||
      payload.topicoNome ||
      payload.materiaNome ||
      "Revisao inteligente",
    textoBase: payload.textoBase || "Item salvo para revisao inteligente.",
    materiaId: payload.materiaId,
    materiaNome: payload.materiaNome,
    topicoId: payload.topicoId,
    topicoNome: payload.topicoNome,
    subtopicoId: payload.subtopicoId,
    subtopicoNome: payload.subtopicoNome,
    origemId:
      payload.origemId ||
      payload.subtopicoId ||
      payload.topicoId ||
      payload.materiaId,
    origemTipo: payload.origemTipo || "conteudo",
    tags: payload.tags || ["integracao"],
  });
}