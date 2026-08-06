export const ERROR_MESSAGES = {
  GENERIC: "Ocorreu um erro inesperado. Tente novamente.",
  LOAD_DATA: "Não foi possível carregar os dados do app.",
  SAVE_DATA: "Não foi possível salvar os dados do app.",
  INVALID_INPUT: "Preencha os campos corretamente.",
  IA_GENERATION: "Não foi possível gerar o conteúdo agora.",
  NOT_FOUND: "Conteúdo não encontrado.",
} as const;

export function getErrorMessage(key?: keyof typeof ERROR_MESSAGES) {
  if (!key) return ERROR_MESSAGES.GENERIC;
  return ERROR_MESSAGES[key] ?? ERROR_MESSAGES.GENERIC;
}
