import { updateAppData } from "@/lib/app-storage";

function arr(value: any) {
  return Array.isArray(value) ? value : [];
}

function uid(prefix = "id") {
  return prefix + "_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
}

export function salvarQuestaoErradaNoBanco(payload: any) {
  if (!payload || payload.acertou) return;

  updateAppData((current: any) => {
    const materiaNome = payload.materia || "Geral";
    const topicoNome = payload.topico || "Treino";
    const subtopicoNome = "Questoes";

    const erro = {
      id: uid("questao"),
      enunciado: payload.enunciado,
      respostaUsuario: payload.respostaTexto,
      respostaCorreta: payload.respostaCorretaTexto,
      comentario: payload.explicacao,
      criadoEm: new Date().toISOString(),
      prioridade: "medio",
      origem: "questoes",
    };

    const materias = arr(current?.materias);
    let materiaExiste = false;

    const nextMaterias = materias.map((materia: any) => {
      if (materia.nome !== materiaNome) return materia;

      materiaExiste = true;
      let topicoExiste = false;

      const topicos = arr(materia.topicos).map((topico: any) => {
        if (topico.nome !== topicoNome) return topico;

        topicoExiste = true;
        let subtopicoExiste = false;

        const subtopicos = arr(topico.subtopicos).map((sub: any) => {
          if (sub.nome !== subtopicoNome) return sub;

          subtopicoExiste = true;

          return {
            ...sub,
            questoesErradas: [erro, ...arr(sub.questoesErradas)],
          };
        });

        if (!subtopicoExiste) {
          subtopicos.unshift({
            id: uid("sub"),
            nome: subtopicoNome,
            estudado: false,
            conteudos: [],
            anotacoes: [],
            erros: [],
            questoesErradas: [erro],
          });
        }

        return {
          ...topico,
          subtopicos,
        };
      });

      if (!topicoExiste) {
        topicos.unshift({
          id: uid("topico"),
          nome: topicoNome,
          subtopicos: [
            {
              id: uid("sub"),
              nome: subtopicoNome,
              estudado: false,
              conteudos: [],
              anotacoes: [],
              erros: [],
              questoesErradas: [erro],
            },
          ],
        });
      }

      return {
        ...materia,
        topicos,
      };
    });

    if (!materiaExiste) {
      nextMaterias.unshift({
        id: uid("materia"),
        nome: materiaNome,
        topicos: [
          {
            id: uid("topico"),
            nome: topicoNome,
            subtopicos: [
              {
                id: uid("sub"),
                nome: subtopicoNome,
                estudado: false,
                conteudos: [],
                anotacoes: [],
                erros: [],
                questoesErradas: [erro],
              },
            ],
          },
        ],
      });
    }

    return {
      ...current,
      materias: nextMaterias,
    };
  });
}