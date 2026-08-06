export function gerarSugestaoEstudo(materias: any[]) {
  if (!materias?.length) {
    return "Adicione matérias para gerar sugestões.";
  }

  const primeira = materias[0];

  return `Sugestão de hoje: estudar ${primeira.nome} por conteúdo concluído e revisar subtópicos pendentes.`;
}

export function gerarFlashcardIA(conteudo: string) {
  return {
    frente: `O que significa: ${conteudo.slice(0, 50)}?`,
    verso: conteudo,
  };
}

export function gerarMissaoIA(materia: string) {
  return {
    titulo: `Missão IA - ${materia}`,
    tempo: "25 min",
    questoes: 10,
  };
}








