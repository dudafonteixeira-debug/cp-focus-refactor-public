export type SimuladoModo = "certo_errado" | "multipla_escolha";

import {
  getSimuladosProva,
  saveSimuladosProva,
} from "@/lib/data-access/app-repository";

export type SimuladoMateriaConfig = {
  materia: string;
  quantidade: number;
};

export type SimuladoProvaConfig = {
  id: string;
  nome: string;
  banca: string;
  cargo: string;
  totalQuestoes: number;
  duracaoMinutos: number;
  modo?: SimuladoModo;
  materias: SimuladoMateriaConfig[];
};

export type SimuladoQuestao = {
  id: string;
  materia: string;
  enunciado: string;
  alternativas: string[];
  correta: number;
  explicacao: string;
  modo?: SimuladoModo;
};

export type SimuladoProva = {
  id: string;
  config: SimuladoProvaConfig;
  questoes: SimuladoQuestao[];
  respostas: Record<string, number>;
  temposPorQuestao: Record<string, number>;
  iniciadoEm: string;
  finalizadoEm?: string;
};

export const MODELOS_SIMULADO_PROVA: SimuladoProvaConfig[] = [
  {
    id: "prf-prova-real-120",
    nome: "PRF - Simulado prova real",
    banca: "CEBRASPE",
    cargo: "Policial Rodoviario Federal",
    totalQuestoes: 120,
    duracaoMinutos: 270,
    modo: "certo_errado",
    materias: [
      { materia: "Portugues", quantidade: 13 },
      { materia: "Lingua Estrangeira", quantidade: 15 },
      { materia: "Raciocinio Logico-Matematico", quantidade: 8 },
      { materia: "Informatica", quantidade: 8 },
      { materia: "Fisica", quantidade: 7 },
      { materia: "Etica no Servico Publico", quantidade: 4 },
      { materia: "Geopolitica Brasileira", quantidade: 10 },

      { materia: "Direito Constitucional", quantidade: 6 },
      { materia: "Direito Administrativo", quantidade: 6 },
      { materia: "Direito Penal", quantidade: 6 },
      { materia: "Direito Processual Penal", quantidade: 6 },
      { materia: "Legislacao Especial", quantidade: 6 },

      { materia: "Legislacao de Transito", quantidade: 25 },
    ],
  },
  {
    id: "prf-diagnostico-curto",
    nome: "PRF - Diagnostico curto",
    banca: "CEBRASPE",
    cargo: "Policial Rodoviario Federal",
    totalQuestoes: 30,
    duracaoMinutos: 45,
    modo: "certo_errado",
    materias: [
      { materia: "Portugues", quantidade: 4 },
      { materia: "Direito Constitucional", quantidade: 4 },
      { materia: "Direito Administrativo", quantidade: 3 },
      { materia: "Direito Penal", quantidade: 3 },
      { materia: "Direito Processual Penal", quantidade: 3 },
      { materia: "Legislacao Especial", quantidade: 3 },
      { materia: "Legislacao de Transito", quantidade: 10 },
    ],
  },
];

function uid(prefix = "id") {
  return prefix + "_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
}

function questaoModelo(materia: string, index: number, modo: SimuladoModo): SimuladoQuestao {
  const base = materia.toLowerCase();

  if (modo === "certo_errado") {
    return {
      id: uid("q"),
      materia,
      enunciado: `(${materia}) Item ${index + 1}: Julgue o item conforme o padrao Certo ou Errado.`,
      alternativas: ["Certo", "Errado"],
      correta: Math.random() > 0.5 ? 0 : 1,
      explicacao: "Este item foi gerado como base local. Na proxima etapa, a IA vai substituir por itens ineditos e contextualizados.",
      modo,
    };
  }

  if (base.includes("portugues")) {
    return {
      id: uid("q"),
      materia,
      enunciado: `(${materia}) Questao ${index + 1}: Assinale a alternativa correta conforme a norma-padrao.`,
      alternativas: [
        "O emprego da crase sempre ocorre antes de palavra masculina.",
        "A concordancia verbal depende da relacao entre sujeito e verbo.",
        "Toda palavra antecedida por artigo recebe acento grave.",
        "Pronome obliquo nunca pode exercer funcao sintatica.",
      ],
      correta: 1,
      explicacao: "A concordancia verbal depende da relacao entre sujeito e verbo. As demais afirmacoes estao generalizadas ou incorretas.",
      modo,
    };
  }

  if (base.includes("constitucional")) {
    return {
      id: uid("q"),
      materia,
      enunciado: `(${materia}) Questao ${index + 1}: Sobre direitos fundamentais, julgue a alternativa correta.`,
      alternativas: [
        "Direitos fundamentais possuem carater absoluto em qualquer situacao.",
        "Direitos fundamentais podem sofrer limitacoes em caso de colisao com outros direitos.",
        "Direitos fundamentais nao se aplicam nas relacoes entre particulares.",
        "A Constituicao nao admite restricao legal a direitos fundamentais.",
      ],
      correta: 1,
      explicacao: "Direitos fundamentais nao sao absolutos e podem sofrer limitacoes quando houver colisao com outros valores constitucionais.",
      modo,
    };
  }

  return {
    id: uid("q"),
    materia,
    enunciado: `(${materia}) Questao ${index + 1}: Sobre normas de transito, assinale a alternativa correta.`,
    alternativas: [
      "A seguranca viaria depende apenas da conduta do pedestre.",
      "O Sistema Nacional de Transito integra orgaos e entidades com competencias especificas.",
      "As normas gerais de circulacao nao se aplicam a vias urbanas.",
      "A sinalizacao sempre prevalece sobre a autoridade de transito.",
    ],
    correta: 1,
    explicacao: "O Sistema Nacional de Transito e composto por orgaos e entidades com competencias definidas em lei.",
    modo,
  };
}

export function gerarSimuladoProva(config: SimuladoProvaConfig): SimuladoProva {
  const questoes: SimuladoQuestao[] = [];

  config.materias.forEach((item) => {
    for (let i = 0; i < item.quantidade; i++) {
      questoes.push(questaoModelo(item.materia, i, config.modo || "certo_errado"));
    }
  });

  return {
    id: uid("simulado"),
    config,
    questoes,
    respostas: {},
    temposPorQuestao: {},
    iniciadoEm: new Date().toISOString(),
  };
}

export function corrigirSimuladoProva(simulado: SimuladoProva) {
  const total = simulado.questoes.length;
  const acertos = simulado.questoes.filter(
    (q) => simulado.respostas[q.id] === q.correta
  ).length;

  const erros = total - acertos;
  const taxa = total ? Math.round((acertos / total) * 100) : 0;

  const porMateria = simulado.config.materias.map((m) => {
    const questoesMateria = simulado.questoes.filter((q) => q.materia === m.materia);
    const acertosMateria = questoesMateria.filter(
      (q) => simulado.respostas[q.id] === q.correta
    ).length;

    return {
      materia: m.materia,
      total: questoesMateria.length,
      acertos: acertosMateria,
      erros: questoesMateria.length - acertosMateria,
      taxa: questoesMateria.length
        ? Math.round((acertosMateria / questoesMateria.length) * 100)
        : 0,
    };
  });

  return {
    total,
    acertos,
    erros,
    taxa,
    porMateria,
  };
}

export async function salvarSimuladoProva(
  simulado: SimuladoProva
): Promise<void> {
  const atual = await getSimuladosProva<SimuladoProva[]>([]);
  const next = [simulado, ...atual].slice(0, 50);

  await saveSimuladosProva(next);
}

export async function listarSimuladosProva(): Promise<SimuladoProva[]> {
  return getSimuladosProva<SimuladoProva[]>([]);
}
