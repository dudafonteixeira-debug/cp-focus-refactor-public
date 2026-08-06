export function ajustarDistribuicaoAdaptativa(params: {
  materias: { materia: string; quantidade: number }[];
  radar?: any[];
}) {
  const materias = Array.isArray(params.materias) ? params.materias : [];
  const radar = Array.isArray(params.radar) ? params.radar : [];

  const total = materias.reduce((acc, item) => acc + Number(item.quantidade || 0), 0);

  if (!total || !radar.length) {
    return materias;
  }

  const criticas = radar
    .filter((item) => item.nivel === "critica")
    .map((item) => String(item.materia || ""));

  if (!criticas.length) {
    return materias;
  }

  let ajustadas = materias.map((item) => {
    const critica = criticas.some(
      (nome) =>
        nome.toLowerCase().includes(item.materia.toLowerCase()) ||
        item.materia.toLowerCase().includes(nome.toLowerCase())
    );

    return {
      ...item,
      quantidade: Number(item.quantidade || 0) + (critica ? 2 : 0),
    };
  });

  let soma = ajustadas.reduce((acc, item) => acc + item.quantidade, 0);

  while (soma > total) {
    const candidata = [...ajustadas]
      .filter((item) => item.quantidade > 1)
      .sort((a, b) => b.quantidade - a.quantidade)[0];

    if (!candidata) break;

    ajustadas = ajustadas.map((item) =>
      item.materia === candidata.materia
        ? { ...item, quantidade: item.quantidade - 1 }
        : item
    );

    soma--;
  }

  return ajustadas;
}