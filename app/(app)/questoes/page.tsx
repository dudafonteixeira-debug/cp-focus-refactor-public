"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { salvarHistoricoQuestao } from "@/lib/questoes-history";
import { salvarQuestaoErradaNoBanco } from "@/lib/questoes/integracao-banco-erros";
import { finishMission, getMissionRoute, replanMission } from "@/lib/engine";

type Questao = {
  id: string;
  materia: string;
  topico: string;
  enunciado: string;
  alternativas: string[];
  correta: number;
  explicacao: string;
};

const QUESTOES_BASE: Questao[] = [
  {
    id: "q1",
    materia: "Direito Constitucional",
    topico: "Direitos fundamentais",
    enunciado: "Os direitos fundamentais possuem carater absoluto, nao admitindo restricoes em nenhuma hipotese.",
    alternativas: ["Certo", "Errado"],
    correta: 1,
    explicacao: "Os direitos fundamentais nao sao absolutos. Podem sofrer restricoes quando houver colisao com outros direitos ou valores constitucionais.",
  },
  {
    id: "q2",
    materia: "Portugues",
    topico: "Crase",
    enunciado: "Assinale a alternativa em que o uso da crase esta correto.",
    alternativas: [
      "Entreguei o documento a ela.",
      "Cheguei a Brasilia ontem.",
      "Refiro-me a aluna aprovada.",
      "Refiro-me a aprovada.",
    ],
    correta: 2,
    explicacao: "Na forma normativa, ha crase quando ocorre a fusao da preposicao a com o artigo feminino a. Exemplo correto seria: Refiro-me a aluna aprovada, quando ha artigo feminino exigido pelo contexto.",
  },
];

export default function QuestoesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const materiaContexto = searchParams.get("materia") || "";
  const topicoContexto = searchParams.get("topico") || "";
  const origemContexto = searchParams.get("origem") || "";
  const missionId = searchParams.get("missionId") || "";
  const [index, setIndex] = useState(0);
  const [resposta, setResposta] = useState<number | null>(null);
  const [corrigida, setCorrigida] = useState(false);
  const [acertos, setAcertos] = useState(0);
  const [erros, setErros] = useState(0);
  const [processingCompletion, setProcessingCompletion] = useState(false);

  const questoesFiltradas = useMemo(() => {
    if (!materiaContexto) return QUESTOES_BASE;

    const filtradas = QUESTOES_BASE.filter((q) =>
      q.materia.toLowerCase().includes(materiaContexto.toLowerCase())
    );

    return filtradas.length ? filtradas : QUESTOES_BASE;
  }, [materiaContexto]);

  const questao = questoesFiltradas[index] || questoesFiltradas[0];

  useEffect(() => {
    if (!missionId) return;
    if (questoesFiltradas.length > 0) return;

    let ativo = true;

    void replanMission(
      missionId,
      "Nao existem questoes compativeis com esta missao no momento."
    ).then((engineResult) => {
      if (!ativo) return;

      if (engineResult.proxima) {
        router.replace(getMissionRoute(engineResult.proxima));
        return;
      }

      router.replace("/dashboard");
    });

    return () => {
      ativo = false;
    };
  }, [missionId, questoesFiltradas.length, router]);
  const progresso = Math.round(((index + 1) / questoesFiltradas.length) * 100);
  const acertou = resposta === questao.correta;

  function corrigir() {
    if (resposta === null) return;

    const acertouAgora = resposta === questao.correta;

    const registroQuestao = {
      id: `resp-${Date.now()}`,
      questaoId: questao.id,
      materia: questao.materia,
      topico: questao.topico,
      enunciado: questao.enunciado,
      respostaUsuario: resposta,
      respostaTexto: questao.alternativas[resposta],
      respostaCorreta: questao.correta,
      respostaCorretaTexto: questao.alternativas[questao.correta],
      acertou: acertouAgora,
      explicacao: questao.explicacao,
      criadoEm: new Date().toISOString(),
    };

    salvarHistoricoQuestao(registroQuestao);
    salvarQuestaoErradaNoBanco(registroQuestao);

    setCorrigida(true);

    if (acertouAgora) {
      setAcertos((v) => v + 1);
    } else {
      setErros((v) => v + 1);
    }
  }

  async function proxima() {
    if (processingCompletion) return;
    const ultimaQuestao = index >= questoesFiltradas.length - 1;

    if (!ultimaQuestao) {
      setIndex((v) => v + 1);
      setResposta(null);
      setCorrigida(false);
      return;
    }

    if (missionId) {
      setProcessingCompletion(true);
      const totalRespondidas = acertos + erros;

      const engineResult = await finishMission({
        missionId,
        nota: `Questoes concluídas: ${totalRespondidas}. Acertos: ${acertos}. Erros: ${erros}.`,
      });

      if (engineResult.proxima) {
        router.push(getMissionRoute(engineResult.proxima));
        return;
      }

      router.push("/dashboard");
      return;
    }

    setIndex(0);
    setResposta(null);
    setCorrigida(false);
  }

  const taxa = useMemo(() => {
    const total = acertos + erros;
    return total ? Math.round((acertos / total) * 100) : 0;
  }, [acertos, erros]);

  return (
    <main className="cp-os-page">
      <section className="mx-auto flex w-full max-w-[1280px] flex-col gap-5 px-4 py-5 md:px-6">
        <header className="rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,rgba(18,26,72,.96),rgba(7,12,35,.98))] p-6 shadow-[0_28px_100px_rgba(0,0,0,.44)]">
          <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-cyan-200">
            {origemContexto ? `Treino vindo de ${origemContexto}` : "Treino inteligente"}
          </span>

          <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-5xl">
            Questoes
          </h1>

          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
            Resolva questoes, corrija visualmente e alimente o historico de desempenho do CP Focus.
            {materiaContexto ? ` Contexto recebido: ${materiaContexto}${topicoContexto ? " - " + topicoContexto : ""}.` : ""}
          </p>
        </header>

        <section className="grid gap-3 md:grid-cols-4">
          <div className="rounded-[22px] border border-cyan-300/20 bg-cyan-400/10 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200">Progresso</p>
            <strong className="mt-1 block text-2xl text-white">{progresso}%</strong>
          </div>

          <div className="rounded-[22px] border border-emerald-300/20 bg-emerald-400/10 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-200">Acertos</p>
            <strong className="mt-1 block text-2xl text-white">{acertos}</strong>
          </div>

          <div className="rounded-[22px] border border-rose-300/20 bg-rose-400/10 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-200">Erros</p>
            <strong className="mt-1 block text-2xl text-white">{erros}</strong>
          </div>

          <div className="rounded-[22px] border border-violet-300/20 bg-violet-400/10 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-200">Taxa</p>
            <strong className="mt-1 block text-2xl text-white">{taxa}%</strong>
          </div>
        </section>

        <section className="rounded-[34px] border border-white/10 bg-white/[0.045] p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="cp-os-badge-blue">{questao.materia}</span>
              <span className="ml-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-black text-slate-200">
                {questao.topico}
              </span>
            </div>

            <strong className="text-sm text-slate-300">
              {index + 1}/{questoesFiltradas.length}
            </strong>
          </div>

          <h2 className="mt-6 text-2xl font-black leading-tight text-white">
            {questao.enunciado}
          </h2>

          <div className="mt-6 grid gap-3">
            {questao.alternativas.map((alt, altIndex) => {
              const marcada = resposta === altIndex;
              const correta = questao.correta === altIndex;

              let classe =
                "rounded-[22px] border border-white/10 bg-black/15 p-4 text-left font-bold text-slate-200 transition hover:bg-white/[0.06]";

              if (corrigida && correta) {
                classe = "rounded-[22px] border border-emerald-300/30 bg-emerald-500/15 p-4 text-left font-black text-emerald-100";
              }

              if (corrigida && marcada && !correta) {
                classe = "rounded-[22px] border border-rose-300/30 bg-rose-500/15 p-4 text-left font-black text-rose-100";
              }

              if (!corrigida && marcada) {
                classe = "rounded-[22px] border border-cyan-300/30 bg-cyan-500/15 p-4 text-left font-black text-cyan-100";
              }

              return (
                <button
                  key={altIndex}
                  type="button"
                  onClick={() => !corrigida && setResposta(altIndex)}
                  className={classe}
                >
                  {alt}
                </button>
              );
            })}
          </div>

          {corrigida ? (
            <div className={acertou ? "mt-6 rounded-[24px] border border-emerald-300/20 bg-emerald-400/10 p-5" : "mt-6 rounded-[24px] border border-rose-300/20 bg-rose-400/10 p-5"}>
              <p className="text-sm font-black text-white">
                {acertou ? "Resposta correta" : "Resposta incorreta"}
              </p>

              <p className="mt-2 text-sm leading-7 text-slate-300">
                {questao.explicacao}
              </p>
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            {!corrigida ? (
              <button type="button" onClick={corrigir} className="cp-os-btn-primary" disabled={resposta === null}>
                Corrigir
              </button>
            ) : (
              <button type="button" onClick={proxima} className="cp-os-btn-primary">
                {index === questoesFiltradas.length - 1 && missionId ? "Concluir missao" : "Proxima questao"}
              </button>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}






