export const PRF_CONCURSO = {
  id: "prf",
  nome: "PRF",
  banca: "Cebraspe",
  materias: [
    {
      nome: "Portugues",
      peso: 5,
      prioridade: "Alta",
      ordem: 1,
      topicos: [
        "Interpretacao de texto",
        "Crase",
        "Pontuacao",
        "Concordancia",
        "Regencia",
      ],
    },
    {
      nome: "Direito Constitucional",
      peso: 4,
      prioridade: "Alta",
      ordem: 2,
      topicos: [
        "Direitos fundamentais",
        "Organizacao do Estado",
        "Administracao publica",
      ],
    },
    {
      nome: "Legislacao de Transito",
      peso: 5,
      prioridade: "Alta",
      ordem: 3,
      topicos: [
        "Normas de circulacao",
        "Sistema nacional de transito",
        "Sinalizacao",
      ],
    },
    {
      nome: "Informatica",
      peso: 2,
      prioridade: "Media",
      ordem: 4,
      topicos: [
        "Windows",
        "Internet",
        "Seguranca da informacao",
      ],
    },
  ],
};