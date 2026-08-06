import { loadAppData } from "@/lib/app-storage";
import type { Fase2ReviewItem } from "@/lib/fase2-types";
import { todayIsoDate } from "@/lib/spaced-repetition";

function createId(prefix: string, seed: string) {
  return `${prefix}_${seed}`;
}

export function buildReviewSeedFromApp(): Fase2ReviewItem[] {
  const app = loadAppData();
  const materias = Array.isArray(app?.materias) ? app.materias : [];
  const hoje = todayIsoDate();
  const now = new Date().toISOString();

  const items: Fase2ReviewItem[] = [];

  materias.forEach((materia: any) => {
    (materia.topicos ?? []).forEach((topico: any) => {
      (topico.subtopicos ?? []).forEach((subtopico: any) => {
        const conteúdos = Array.isArray(subtopico.conteúdos) ? subtopico.conteúdos : [];

        if (conteúdos.length === 0) {
          items.push({
            id: createId("subtopico", subtopico.id),
            origemId: subtopico.id,
            origemTipo: "subtopico",
            materiaId: materia.id,
            materiaNome: materia.nome,
            topicoId: topico.id,
            topicoNome: topico.nome,
            subtopicoId: subtopico.id,
            subtopicoNome: subtopico.nome,
            titulo: subtopico.nome,
            textoBase: `${materia.nome} > ${topico.nome} > ${subtopico.nome}`,
            tags: [materia.nome, topico.nome, subtopico.nome].filter(Boolean),
            status: "nova",
            easiness: 2.5,
            intervaloDias: 0,
            repeticoes: 0,
            acertos: 0,
            erros: 0,
            ultimaRespostaEm: null,
            proximaRevisaoEm: hoje,
            criadoEm: now,
            atualizadoEm: now,
          });
        }

        conteúdos.forEach((conteudo: any) => {
          items.push({
            id: createId("conteudo", conteudo.id),
            origemId: conteudo.id,
            origemTipo: "conteudo",
            materiaId: materia.id,
            materiaNome: materia.nome,
            topicoId: topico.id,
            topicoNome: topico.nome,
            subtopicoId: subtopico.id,
            subtopicoNome: subtopico.nome,
            titulo: conteudo.titulo ?? subtopico.nome,
            textoBase: conteudo.texto ?? subtopico.nome,
            tags: [materia.nome, topico.nome, subtopico.nome].filter(Boolean),
            status: "nova",
            easiness: 2.5,
            intervaloDias: 0,
            repeticoes: 0,
            acertos: 0,
            erros: 0,
            ultimaRespostaEm: null,
            proximaRevisaoEm: hoje,
            criadoEm: now,
            atualizadoEm: now,
          });
        });
      });
    });
  });

  return items;
}

export function mergeReviewSeeds(
  current: Fase2ReviewItem[],
  incoming: Fase2ReviewItem[]
): Fase2ReviewItem[] {
  const map = new Map<string, Fase2ReviewItem>();

  current.forEach((item) => map.set(item.id, item));

  incoming.forEach((item) => {
    if (!map.has(item.id)) {
      map.set(item.id, item);
    }
  });

  return Array.from(map.values());
}
