function avg(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function gerarPerfilAdaptativo(params: {
  simulados?: any[];
  radar?: any[];
  sessoes?: any[];
  revisoes?: any[];
}) {
  const simulados = Array.isArray(params.simulados) ? params.simulados : [];
  const radar = Array.isArray(params.radar) ? params.radar : [];
  const sessoes = Array.isArray(params.sessoes) ? params.sessoes : [];
  const revisoes = Array.isArray(params.revisoes) ? params.revisoes : [];

  const medias = simulados.map((simulado: any) => {
    const total = simulado?.questoes?.length || 0;

    const acertos =
      simulado?.questoes?.filter(
        (q: any) => simulado?.respostas?.[q.id] === q.correta
      ).length || 0;

    return total ? Math.round((acertos / total) * 100) : 0;
  });

  const taxaMedia = Math.round(avg(medias));

  const materiasCriticas = radar.filter(
    (item: any) => item?.nivel === "critica"
  );

  const materiaMaisCritica = materiasCriticas[0]?.materia || null;

  const tempoTotal = sessoes.reduce(
    (acc: number, sessao: any) => acc + Number(sessao?.duracaoMin || 0),
    0
  );

  const consistencia =
    sessoes.length >= 20
      ? "alta"
      : sessoes.length >= 8
      ? "media"
      : "baixa";

  let perfil = "Estudante em desenvolvimento";

  if (taxaMedia >= 80 && consistencia === "alta") {
    perfil = "Estudante consistente de alto desempenho";
  } else if (taxaMedia >= 65) {
    perfil = "Estudante estrategico em evolucao";
  } else if (taxaMedia < 50 && consistencia === "baixa") {
    perfil = "Estudante com baixa consistencia";
  }

  let recomendacao =
    "A Lyra recomenda manter revisoes e constancia.";

  if (materiaMaisCritica) {
    recomendacao =
      "A Lyra detectou necessidade de reforco em " +
      materiaMaisCritica +
      ".";
  }

  const scoreGeral = clamp(
    Math.round(
      taxaMedia * 0.7 +
        Math.min(sessoes.length * 2, 20) +
        Math.min(revisoes.length, 10)
    ),
    0,
    100
  );

  return {
    perfil,
    scoreGeral,
    taxaMedia,
    consistencia,
    tempoTotal,
    materiaMaisCritica,
    recomendacao,
    quantidadeSimulados: simulados.length,
    quantidadeSessoes: sessoes.length,
    quantidadeRevisoes: revisoes.length,
  };
}