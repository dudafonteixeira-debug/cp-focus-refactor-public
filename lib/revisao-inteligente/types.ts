export type UiReview = {
  id: string;
  materia: string;
  topico: string;
  subtopico: string;
  titulo: string;
  textoBase: string;
  proxima: string;
  ultimaRespostaEm?: string | null;
  acertos: number;
  erros: number;
  raw: any;
};
