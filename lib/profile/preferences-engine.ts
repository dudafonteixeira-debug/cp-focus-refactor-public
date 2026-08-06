export function gerarPreferenciasInteligentes(params: {
  dadosUsuario?: any;
  perfil?: any;
  comportamento?: any;
}) {
  const dados = params.dadosUsuario || {};
  const perfil = params.perfil || {};
  const comportamento = params.comportamento || {};

  const horasDia = Number(dados.horasDia || 2);
  const temFilhos = dados.filhos === "sim";
  const trabalha = dados.trabalha === "sim" || dados.trabalha === "faculdade";

  let cargaIdealMin = Math.max(30, horasDia * 60);

  if (temFilhos) cargaIdealMin -= 25;
  if (trabalha) cargaIdealMin -= 20;
  if (perfil.consistencia === "baixa") cargaIdealMin = Math.min(cargaIdealMin, 75);

  cargaIdealMin = Math.max(30, Math.round(cargaIdealMin));

  let duracaoSessaoMin = 50;

  if (comportamento.mediaDuracao && comportamento.mediaDuracao < 40) {
    duracaoSessaoMin = 30;
  }

  if (temFilhos || trabalha) {
    duracaoSessaoMin = Math.min(duracaoSessaoMin, 40);
  }

  let intensidade = "moderada";

  if (perfil.scoreGeral >= 75 && perfil.consistencia === "alta") {
    intensidade = "alta";
  }

  if (perfil.consistencia === "baixa" || temFilhos) {
    intensidade = "leve";
  }

  let frequenciaSimuladoDias = 30;

  if (perfil.scoreGeral >= 70) frequenciaSimuladoDias = 15;
  if (perfil.scoreGeral >= 82) frequenciaSimuladoDias = 7;

  const melhorHorario =
    dados.rotina === "manha"
      ? "manha"
      : dados.rotina === "tarde"
      ? "tarde"
      : dados.rotina === "noite"
      ? "noite"
      : "flexivel";

  const estrategia =
    perfil.consistencia === "baixa"
      ? "reduzir atrito e criar constancia antes de aumentar volume"
      : perfil.materiaMaisCritica
      ? "priorizar recuperacao de materia critica com revisao e questoes"
      : "manter equilibrio entre teoria, questoes e simulados";

  return {
    cargaIdealMin,
    duracaoSessaoMin,
    intensidade,
    frequenciaSimuladoDias,
    melhorHorario,
    estrategia,
  };
}