export const DATA_KEYS = {
  app: "cp-focus-app",
  perfilUsuario: "cp_focus_perfil_usuario_v1",
  simuladosProva: "cp_focus_simulados_prova_v1",
  profileTimeline: "cp_focus_profile_timeline_v1",
  questoesHistorico: "cp_focus_questoes_historico_v1",
  flashcardsV2: "cpfocus_flashcards_v2",
  flashcardsLegacy: "cp-focus-flashcards",
  flashcardsLegacyRepo: "cp-focus-flashcards",
  revisoesV2: "cpfocus_revisoes_v2",
  revisoesLegacy: "cp-focus-revisoes",
  sessoesEstudo: "cp_focus_sessoes_estudo_v1",
  bancoErros: "cp_focus_banco_erros_v1",
  progresso: "cp_focus_progresso_v1",
  gamificacao: "cp_focus_gamificacao_v1",
  planoDia: "cp_focus_plano_dia_v2",
  planningBrain: "cp_focus_planning_brain_v2",
  plannerConfig: "cp_focus_planner_config_v1",
  onboardingOs: "cp_focus_onboarding_os",
  plannerMissoes: "cp-focus-missoes",
  flashcardsPremium: "cp-focus-flashcards-premium",
} as const;

export type DataKeyName = keyof typeof DATA_KEYS;




 

