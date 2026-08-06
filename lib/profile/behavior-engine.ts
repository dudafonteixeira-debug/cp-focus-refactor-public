function avg(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function analisarComportamentoEstudo(params: {
  sessoes?: any[];
  simulados?: any[];
  revisoes?: any[];
}) {
  const sessoes = Array.isArray(params.sessoes) ? params.sessoes : [];
  const simulados = Array.isArray(params.simulados) ? params.simulados : [];
  const revisoes = Array.isArray(params.revisoes) ? params.revisoes : [];

  const duracoes = sessoes.map((s: any) =>
    Number(s?.duracaoMin || 0)
  );

  const mediaDuracao = Math.round(avg(duracoes));

  const diasAtivos = new Set(
    sessoes.map((s: any) =>
      String(s?.criadoEm || "").slice(0, 10)
    )
  ).size;

  const consistencia =
    diasAtivos >= 20
      ? "alta"
      : diasAtivos >= 8
      ? "media"
      : "baixa";

  const taxaSimulados = avg(
    simulados.map((simulado: any) => {
      const total = simulado?.questoes?.length || 0;

      const acertos =
        simulado?.questoes?.filter(
          (q: any) =>
            simulado?.respostas?.[q.id] === q.correta
        ).length || 0;

      return total ? (acertos / total) * 100 : 0;
    })
  );

  const insights: string[] = [];

  if (mediaDuracao > 120) {
    insights.push(
      "Seu tempo medio de estudo esta muito alto. A Lyra detectou risco de fadiga mental."
    );
  }

  if (mediaDuracao < 35 && sessoes.length > 10) {
    insights.push(
      "Voce estuda em blocos curtos. A Lyra pode aumentar sua eficiencia com ciclos dinamicos."
    );
  }

  if (consistencia === "baixa") {
    insights.push(
      "A Lyra detectou baixa consistencia recente. O foco agora deve ser recuperar frequencia."
    );
  }

  if (taxaSimulados < 50 && revisoes.length < 15) {
    insights.push(
      "Seu desempenho esta abaixo do esperado e a quantidade de revisoes ainda e baixa."
    );
  }

  if (taxaSimulados >= 75 && consistencia === "alta") {
    insights.push(
      "Voce apresenta perfil de estudante consistente com alto potencial competitivo."
    );
  }

  if (!insights.length) {
    insights.push(
      "A Lyra ainda esta aprendendo seu comportamento de estudo."
    );
  }

  return {
    mediaDuracao,
    consistencia,
    taxaSimulados: Math.round(taxaSimulados),
    insights,
  };
}