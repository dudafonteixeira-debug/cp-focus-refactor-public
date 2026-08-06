import { updateAppData } from "@/lib/app-storage";

export function instalarPresetConcurso(preset: any) {
  if (!preset) return;

  const agora = Date.now();

  updateAppData((data: any) => {
    const materias = preset.materias.map(
      (materia: any, materiaIndex: number) => ({
        id: `preset-mat-${agora}-${materiaIndex}`,
        nome: materia.nome,
        origem: "preset-concurso",

        planejamento: {
          peso: materia.peso,
          prioridade: materia.prioridade,
          ordem: materia.ordem,
        },

        topicos: materia.topicos.map(
          (topico: string, topicoIndex: number) => ({
            id: `preset-top-${agora}-${materiaIndex}-${topicoIndex}`,
            nome: topico,

            subtopicos: [
              {
                id: `preset-sub-${agora}-${materiaIndex}-${topicoIndex}`,
                nome: topico,
                estudado: false,
                concluido: false,
                conteudos: [],
                anotacoes: [],
                erros: [],
                questoesErradas: [],
              },
            ],
          })
        ),
      })
    );

    const existentes = Array.isArray(data.materias) ? data.materias : [];

    const nomesExistentes = new Set(
      existentes.map((item: any) => String(item.nome || "").toLowerCase().trim())
    );

    const novas = materias.filter(
      (item: any) => !nomesExistentes.has(String(item.nome || "").toLowerCase().trim())
    );

    return {
      ...data,
      materias: [...existentes, ...novas],
      onboardingCompleto: true,
      concursoAtual: preset.nome,
      bancaAtual: preset.banca,
    };
  });
}