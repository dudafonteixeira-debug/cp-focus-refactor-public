import {
  getSessoesEstudo,
  saveSessoesEstudo,
} from "@/lib/data-access/app-repository";

export type SessaoEstudo = {
  id: string;
  taskId?: string;
  materia?: string;
  topico?: string;
  titulo?: string;
  tipo?: string;
  prioridade?: string;
  minutosPlanejados?: number;
  segundosEstudados: number;
  nota?: string;
  createdAt: string;
};

export async function loadSessoesEstudo(): Promise<SessaoEstudo[]> {
  return getSessoesEstudo<SessaoEstudo[]>([]);
}

export async function saveSessaoEstudo(
  sessao: SessaoEstudo
): Promise<void> {
  const atual = await loadSessoesEstudo();
  const next = [sessao, ...atual].slice(0, 200);

  await saveSessoesEstudo(next);

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("cp-focus-sessoes-updated", { detail: next })
    );
  }
}
