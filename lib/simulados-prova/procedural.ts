const temasPorMateria: Record<string, string[]> = {
  Portugues: ["crase", "concordancia", "regencia", "interpretacao de texto", "pontuacao"],
  Ingles: ["reading comprehension", "false cognates", "main idea", "vocabulary"],
  Espanhol: ["interpretacion textual", "vocabulario", "conectores", "comprension lectora"],
  "Direito Constitucional": ["direitos fundamentais", "administracao publica", "seguranca publica", "controle de constitucionalidade"],
  "Direito Administrativo": ["atos administrativos", "poderes administrativos", "responsabilidade civil do Estado", "licitacoes"],
  "Direito Penal": ["crimes contra a administracao", "tipicidade", "culpabilidade", "penas"],
  "Direito Processual Penal": ["inquerito policial", "prisao", "provas", "acao penal"],
  "Legislacao Especial": ["abuso de autoridade", "drogas", "estatuto do desarmamento", "crimes hediondos"],
  "Legislacao de Transito": ["normas gerais de circulacao", "sinalizacao", "infrações", "Sistema Nacional de Transito", "penalidades"],
  Informatica: ["seguranca da informacao", "redes", "navegadores", "sistemas operacionais"],
  Fisica: ["cinematica", "dinamica", "energia", "movimento"],
  "Raciocinio Logico-Matematico": ["proposicoes", "porcentagem", "regra de tres", "analise combinatoria"],
  "Etica no Servico Publico": ["principios eticos", "deveres do servidor", "conduta publica"],
  "Geopolitica Brasileira": ["fronteiras", "transportes", "integracao regional", "territorio brasileiro"],
};

function uid(prefix = "q") {
  return prefix + "_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
}

function tema(materia: string, index: number) {
  const temas = temasPorMateria[materia] || ["conteudo essencial", "conceito central", "aplicacao pratica"];
  return temas[index % temas.length];
}

export function gerarQuestaoProcedural(params: {
  materia: string;
  index: number;
  modo: "certo_errado" | "multipla_escolha";
}) {
  const t = tema(params.materia, params.index);
  const par = params.index % 2 === 0;

  if (params.modo === "certo_errado") {
    return {
      id: uid("procedural"),
      materia: params.materia,
      enunciado: `Sobre ${t}, julgue o item seguinte conforme a abordagem cobrada em provas de concurso: a afirmacao apresentada deve ser analisada considerando regra geral, excecoes e contexto normativo.`,
      alternativas: ["Certo", "Errado"],
      correta: par ? 0 : 1,
      explicacao: `O item trabalha ${t}. A justificativa deve observar regra geral, excecoes e pegadinhas comuns da banca.`,
      modo: params.modo,
      origem: "procedural",
    };
  }

  return {
    id: uid("procedural"),
    materia: params.materia,
    enunciado: `Em relacao a ${t}, assinale a alternativa mais adequada segundo a logica de prova de concurso.`,
    alternativas: [
      `Alternativa correta sobre ${t}, considerando regra e contexto.`,
      `Alternativa incorreta por generalizar o tema ${t}.`,
      `Alternativa incorreta por inverter conceito essencial de ${t}.`,
      `Alternativa incorreta por confundir excecao com regra em ${t}.`,
    ],
    correta: 0,
    explicacao: `A alternativa correta preserva a regra central sobre ${t}; as demais exploram generalizacao, inversao ou confusao conceitual.`,
    modo: params.modo,
    origem: "procedural",
  };
}

export function completarQuestoesProcedurais(params: {
  questoes: any[];
  materias: { materia: string; quantidade: number }[];
  modo: "certo_errado" | "multipla_escolha";
}) {
  const existentes = Array.isArray(params.questoes) ? [...params.questoes] : [];

  params.materias.forEach((bloco) => {
    const jaTem = existentes.filter((q) => q.materia === bloco.materia).length;

    for (let i = jaTem; i < bloco.quantidade; i++) {
      existentes.push(
        gerarQuestaoProcedural({
          materia: bloco.materia,
          index: i,
          modo: params.modo,
        })
      );
    }
  });

  return existentes;
}

export function textoEhErroDeApi(texto: string) {
  const lower = String(texto || "").toLowerCase();

  return (
    lower.includes("quota exceeded") ||
    lower.includes("rate limit") ||
    lower.includes("billing") ||
    lower.includes("please check your plan") ||
    lower.includes("gemini-api/docs/rate-limits")
  );
}