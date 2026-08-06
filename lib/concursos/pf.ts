export const PF_CONCURSO = {
  id: "pf",
  nome: "Policia Federal",
  banca: "Cebraspe",
  materias: [
    {
      nome: "Portugues",
      peso: 5,
      prioridade: "Alta",
      ordem: 1,
      topicos: [
        "Interpretacao",
        "Pontuacao",
        "Concordancia",
      ],
    },
    {
      nome: "Contabilidade",
      peso: 5,
      prioridade: "Alta",
      ordem: 2,
      topicos: [
        "Balanco patrimonial",
        "DRE",
        "AVP",
      ],
    },
    {
      nome: "Administracao Financeira",
      peso: 4,
      prioridade: "Media",
      ordem: 3,
      topicos: [
        "Orcamento",
        "Receita publica",
      ],
    },
  ],
};