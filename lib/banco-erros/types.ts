export type PrioridadeErro = "leve" | "medio" | "critico";
export type DificuldadeIA = "facil" | "medio" | "dificil";
export type ModoIA = "objetiva" | "cespe";

export type ErroItem = {
  id: string;
  materiaId: string;
  topicoId: string;
  subtopicoId: string;
  materiaNome: string;
  topicoNome: string;
  subtopicoNome: string;
  enunciado: string;
  respostaUsuario: string;
  respostaCorreta: string;
  comentario: string;
  criadoEm: string;
  origem: "erros" | "questoesErradas";
  prioridade: PrioridadeErro;
};

export type QuestaoIA = {
  id: string;
  enunciado: string;
  alternativas: string[];
  correta: number;
  explicacao: string;
  modo?: ModoIA;
};

export type CadernoIA = {
  titulo: string;
  questoes: QuestaoIA[];
};
