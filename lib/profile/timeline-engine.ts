import { todayKey as getTodayKey, toLocalDateKey } from "@/lib/date-utils";
import {
  getProfileTimeline,
  saveProfileTimeline,
} from "@/lib/data-access/app-repository";

export type TimelineSnapshot = {
  id: string;
  criadoEm: string;
  scoreGeral: number;
  consistencia: string;
  taxaMedia: number;
  materiaMaisCritica?: string | null;
  quantidadeSimulados: number;
  quantidadeRevisoes: number;
  quantidadeSessoes: number;
};

function uid(): string {
  return (
    "snap_" +
    Date.now() +
    "_" +
    Math.random().toString(36).slice(2, 8)
  );
}

function arr(value: any): TimelineSnapshot[] {
  return Array.isArray(value) ? value : [];
}

export async function listarTimelinePerfil(): Promise<
  TimelineSnapshot[]
> {
  try {
    return arr(
      await getProfileTimeline<TimelineSnapshot[]>([])
    );
  } catch {
    return [];
  }
}

export async function salvarSnapshotPerfil(
  perfil: any
): Promise<TimelineSnapshot[]> {
  if (!perfil) {
    return listarTimelinePerfil();
  }

  const atual = await listarTimelinePerfil();
  const hoje = getTodayKey();

  const jaTemHoje = atual.some((item) =>
    String(item.criadoEm || "").startsWith(hoje)
  );

  if (jaTemHoje) {
    return atual;
  }

  const novo: TimelineSnapshot = {
    id: uid(),
    criadoEm: new Date().toISOString(),
    scoreGeral: Number(perfil.scoreGeral || 0),
    consistencia: String(perfil.consistencia || "baixa"),
    taxaMedia: Number(perfil.taxaMedia || 0),
    materiaMaisCritica: perfil.materiaMaisCritica || null,
    quantidadeSimulados: Number(
      perfil.quantidadeSimulados || 0
    ),
    quantidadeRevisoes: Number(
      perfil.quantidadeRevisoes || 0
    ),
    quantidadeSessoes: Number(
      perfil.quantidadeSessoes || 0
    ),
  };

  const next = [novo, ...atual].slice(0, 90);

  await saveProfileTimeline(next);

  return next;
}

export function analisarTimelinePerfil(
  timeline: TimelineSnapshot[]
) {
  const itens = arr(timeline);

  if (itens.length < 2) {
    return {
      tendencia: "inicial",
      mensagem:
        "A Lyra ainda esta formando sua linha do tempo comportamental.",
      variacaoScore: 0,
      variacaoTaxa: 0,
    };
  }

  const atual = itens[0];
  const anterior = itens[1];

  const variacaoScore =
    Number(atual.scoreGeral || 0) -
    Number(anterior.scoreGeral || 0);

  const variacaoTaxa =
    Number(atual.taxaMedia || 0) -
    Number(anterior.taxaMedia || 0);

  let tendencia = "estavel";
  let mensagem = "Seu perfil esta relativamente estavel.";

  if (variacaoScore >= 8 || variacaoTaxa >= 8) {
    tendencia = "melhora";
    mensagem =
      "A Lyra detectou melhora recente no seu perfil de estudo.";
  }

  if (variacaoScore <= -8 || variacaoTaxa <= -8) {
    tendencia = "queda";
    mensagem =
      "A Lyra detectou queda recente de desempenho ou consistencia.";
  }

  return {
    tendencia,
    mensagem,
    variacaoScore,
    variacaoTaxa,
  };
}
