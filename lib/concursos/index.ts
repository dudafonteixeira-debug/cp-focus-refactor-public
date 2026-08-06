import { PF_CONCURSO } from "./pf";
import { PRF_CONCURSO } from "./prf";

export const CONCURSOS_PRESET = [
  PRF_CONCURSO,
  PF_CONCURSO,
];

export function getConcursoPreset(id: string) {
  return CONCURSOS_PRESET.find(
    (item) => item.id === id
  );
}