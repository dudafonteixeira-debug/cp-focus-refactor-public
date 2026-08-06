import { gerarPreferenciasInteligentes } from "@/lib/profile/preferences-engine";

export function aplicarPerfilNoPlanejamento(params: {
  dadosUsuario?: any;
  perfil?: any;
  comportamento?: any;
  capacidadePadraoMin?: number;
}) {
  const preferencias = gerarPreferenciasInteligentes({
    dadosUsuario: params.dadosUsuario,
    perfil: params.perfil,
    comportamento: params.comportamento,
  });

  const capacidadeMinutos = Math.max(
    30,
    Math.min(
      Number(params.capacidadePadraoMin || 180),
      Number(preferencias.cargaIdealMin || 90)
    )
  );

  const limiteTarefas =
    preferencias.intensidade === "leve"
      ? 3
      : preferencias.intensidade === "alta"
      ? 7
      : 5;

  const minutosPorSessao = Number(preferencias.duracaoSessaoMin || 40);

  const mensagemLyra =
    preferencias.intensidade === "leve"
      ? "A Lyra reduziu a carga do dia para proteger sua consistencia."
      : preferencias.intensidade === "alta"
      ? "A Lyra liberou uma carga mais intensa porque seu perfil permite maior volume."
      : "A Lyra manteve uma carga equilibrada para o seu perfil atual.";

  return {
    preferencias,
    capacidadeMinutos,
    limiteTarefas,
    minutosPorSessao,
    mensagemLyra,
  };
}