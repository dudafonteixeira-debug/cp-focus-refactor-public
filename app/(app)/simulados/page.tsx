"use client";

import { SimuladosHeader } from "@/components/simulados/simulados-header";

import { DATA_KEYS } from "@/lib/data-access/keys";

import { useEffect, useMemo, useState } from "react";
import {
  MODELOS_SIMULADO_PROVA,
  corrigirSimuladoProva,
  gerarSimuladoProva,
  salvarSimuladoProva,
  listarSimuladosProva,
  type SimuladoProva,
} from "@/lib/simulados-prova/engine";

import {
  completarQuestoesProcedurais,
  textoEhErroDeApi,
} from "@/lib/simulados-prova/procedural";

import { calcularAdaptiveScores } from "@/lib/adaptive/engine";
import { ajustarDistribuicaoAdaptativa } from "@/lib/simulados-prova/adaptive";

import { salvarNaRevisaoInteligente } from "@/lib/revisao-inteligente-adapter";
import { salvarFlashcards } from "@/lib/flashcards-core";
import { loadAppData, saveAppData } from "@/lib/app-storage";

type Modo = "certo_errado" | "multipla_escolha";

function formatTime(seconds: number) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function deepText(value: any): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map(deepText).filter(Boolean).join("\n");

  if (typeof value === "object") {
    const keys = ["text", "response", "message", "output", "content", "answer", "resultado", "resposta"];

    for (const key of keys) {
      if (key in value) {
        const found = deepText(value[key]);
        if (found) return found;
      }
    }

    if (Array.isArray(value.parts)) return value.parts.map(deepText).filter(Boolean).join("\n");
    if (Array.isArray(value.candidates)) return value.candidates.map(deepText).filter(Boolean).join("\n");
  }

  return "";
}

function extractJson(text: string) {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");

  if (first >= 0 && last > first) return cleaned.slice(first, last + 1);

  return cleaned;
}

function extrairQuestoesIA(text: string): any[] {
  try {
    const json = JSON.parse(extractJson(text));
    return Array.isArray(json.questoes) ? json.questoes : [];
  } catch {}

  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();

  const matches = cleaned.match(/\{[^{}]*"materia"[^{}]*"enunciado"[^{}]*"alternativas"[^{}]*"correta"[^{}]*"explicacao"[^{}]*\}/g) || [];

  return matches
    .map((item) => {
      try {
        return JSON.parse(item);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}


function salvarBancoErrosSimulado(simulado: any) {
  try {
    const appData = loadAppData();

    const respostas = simulado?.respostas || {};

    const erradas = (simulado?.questoes || []).filter((questao: any) => {
      return respostas[questao.id] !== questao.correta;
    });

    const bancoAtual = Array.isArray(appData?.bancoErros)
      ? appData.bancoErros
      : [];

    const novosErros = erradas.map((questao: any) => ({
      id: `simulado-erro-${Date.now()}-${questao.id}`,
      origem: "simulado",
      materia: questao.materia,
      enunciado: questao.enunciado,
      alternativas: questao.alternativas,
      correta: questao.correta,
      explicacao: questao.explicacao,
      criadoEm: new Date().toISOString(),
    }));

    saveAppData({
      ...appData,
      bancoErros: [...novosErros, ...bancoAtual],
    });

    erradas.forEach((questao: any) => {
      salvarNaRevisaoInteligente({
        titulo: `Revisao - ${questao.materia}`,
        textoBase: questao.enunciado,
        materiaNome: questao.materia,
        origemTipo: "questao",
        tags: ["simulado", "erro"],
      });
    });

    salvarFlashcards(
      erradas.map((questao: any) => ({
        pergunta: questao.enunciado,
        resposta:
          questao.alternativas?.[questao.correta] || "Resposta correta",
      }))
    );
  } catch (error) {
    console.error("ERRO_INTEGRACAO_SIMULADO", error);
  }
}
export default function SimuladosPage() {
  const [simulado, setSimulado] = useState<SimuladoProva | null>(null);
  const [modeloId, setModeloId] = useState(MODELOS_SIMULADO_PROVA[0]?.id || "");
  const [modoSelecionado, setModoSelecionado] = useState<Modo>("certo_errado");
  const [adaptativoAtivo, setAdaptativoAtivo] = useState(false);
  const [idiomaSelecionado, setIdiomaSelecionado] = useState<"Ingles" | "Espanhol">("Ingles");
  const [questaoIndex, setQuestaoIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const [finalizado, setFinalizado] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [statusIA, setStatusIA] = useState("");
  const [questaoEntrouEm, setQuestaoEntrouEm] = useState(0);
  const [historicoSimulados, setHistoricoSimulados] = useState<any[]>([]);

  const modelo = MODELOS_SIMULADO_PROVA.find((item) => item.id === modeloId) || MODELOS_SIMULADO_PROVA[0];

  const modeloComIdioma = {
    ...modelo,
    materias: modelo.materias.map((item) =>
      item.materia === "Lingua Estrangeira"
        ? { ...item, materia: idiomaSelecionado }
        : item
    ),
  };

  const distribuicaoPreview = modeloComIdioma.materias;

  useEffect(() => {
    if (typeof window !== "undefined") setQuestaoEntrouEm(Date.now());
    listarSimuladosProva()
      .then((itens) => setHistoricoSimulados(itens.slice(0, 5)))
      .catch(() => setHistoricoSimulados([]));
  }, [simulado, finalizado]);

  const questaoAtual = simulado?.questoes?.[questaoIndex] || null;

  const resultado = useMemo(() => {
    if (!simulado || !finalizado) return null;
    return corrigirSimuladoProva(simulado);
  }, [simulado, finalizado]);

  const questoesIA = simulado?.questoes?.filter((q: any) => !String(q.id || "").includes("procedural")).length || 0;
  const questoesProcedurais = simulado?.questoes?.filter((q: any) => String(q.id || "").includes("procedural")).length || 0;

  useEffect(() => {
    if (!running || finalizado) return;

    const id = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          finalizarAutomatico();
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [running, finalizado, simulado]);

  async function finalizarAutomatico() {
    if (!simulado) return;

    const done = {
      ...simulado,
      finalizadoEm: new Date().toISOString(),
    };

    setSimulado(done);
    setRunning(false);
    setFinalizado(true);

    await salvarSimuladoProva(done);
    salvarBancoErrosSimulado(done);
  }

  async function gerarQuestoesMateria(
  materia: string,
  quantidade: number,
  base: SimuladoProva
) {
  const todas: any[] = [];

  for (let numero = 1; numero <= quantidade; numero++) {
    let gerou = false;

    for (let tentativa = 1; tentativa <= 3 && !gerou; tentativa++) {
      setStatusIA(`Gerando questao ${numero}/${quantidade} de ${materia}...`);

      const prompt = [
        "Voce e uma banca de concurso publico.",
        "Crie UMA questao INEDITA.",
        "Materia: " + materia,
        "Numero da questao: " + numero,
        "Modo: " + (modoSelecionado === "certo_errado" ? "Certo ou Errado" : "Multipla escolha"),
        "Nao copie questoes existentes.",
        "Nao use markdown.",
        "Nao escreva nada fora do JSON.",
        "Se for Certo/Errado, alternativas exatamente [\"Certo\", \"Errado\"].",
        "Se for Multipla escolha, use exatamente 4 alternativas.",
        "Formato obrigatorio:",
        "{\"materia\":\"" + materia + "\",\"enunciado\":\"...\",\"alternativas\":[\"...\"],\"correta\":0,\"explicacao\":\"...\"}",
      ].join("\n");

      try {
        const response = await fetch("/api/gemini", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "simulado_prova_gerar",
            prompt,
            materia,
            quantidade: 1,
            modo: modoSelecionado,
          }),
        });

        const apiJson = await response.json();

        const text =
          apiJson?.text ||
          apiJson?.response ||
          deepText(apiJson) ||
          "";

        let q: any = null;

        try {
          const parsed = JSON.parse(extractJson(text));
          q = Array.isArray(parsed?.questoes) ? parsed.questoes[0] : parsed;
        } catch {
          const extraidas = extrairQuestoesIA(text);
          q = extraidas[0];
        }

        if (textoEhErroDeApi(text)) {
          throw new Error("Quota ou limite da API");
        }

        const textoQuestao =
          q?.enunciado ||
          text
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .replace(/[{}[\]"]/g, "")
            .trim();

        if (!textoQuestao || textoQuestao.length < 25) {
          throw new Error("Questao invalida");
        }

        todas.push({
          id: `ia-${Date.now()}-${materia}-${numero}`,
          materia,

          enunciado: textoQuestao,

          alternativas:
            modoSelecionado === "certo_errado"
              ? ["Certo", "Errado"]
              : Array.isArray(q?.alternativas)
              ? q.alternativas.map(String).slice(0, 4)
              : [
                  "Alternativa A",
                  "Alternativa B",
                  "Alternativa C",
                  "Alternativa D",
                ],

          correta: Number.isFinite(Number(q?.correta))
            ? Number(q.correta)
            : 0,

          explicacao:
            String(q?.explicacao || "").trim() ||
            "Questao gerada pela IA.",

          modo: modoSelecionado,
        });

        gerou = true;
      } catch (error) {
        console.error("ERRO_QUESTAO_SIMULADO", materia, numero, tentativa, error);
      }
    }
  }

  return todas.slice(0, quantidade);
}
async function iniciarSimulado() {
  setGerando(true);
  setStatusIA(
    adaptativoAtivo
      ? "Lyra esta ajustando a prova pelas suas fraquezas..."
      : "Gerando prova por blocos de materia..."
  );

  const simuladosSalvosAdaptive = await listarSimuladosProva();

  const radarAdaptive = calcularAdaptiveScores({
    simulados: simuladosSalvosAdaptive,
  });

  const materiasFinais = adaptativoAtivo
    ? ajustarDistribuicaoAdaptativa({
        materias: modeloComIdioma.materias,
        radar: radarAdaptive,
      })
    : modeloComIdioma.materias;

  const modeloFinal = {
    ...modeloComIdioma,
    materias: materiasFinais,
    totalQuestoes: materiasFinais.reduce(
      (acc: number, item: any) => acc + Number(item.quantidade || 0),
      0
    ),
  };

  const base = gerarSimuladoProva({
    ...modeloFinal,
    modo: modoSelecionado,
  });

  const questoesGeradas: any[] = [];

  for (const bloco of modeloFinal.materias) {
    setStatusIA(`Gerando ${bloco.quantidade} questoes de ${bloco.materia}...`);

    try {
      const geradas = await gerarQuestoesMateria(
        bloco.materia,
        bloco.quantidade,
        base
      );

      questoesGeradas.push(...geradas);
    } catch (error) {
      console.error("ERRO_BLOCO_SIMULADO", bloco.materia, error);
    }
  }

  if (questoesGeradas.length < modeloFinal.totalQuestoes) {
    setStatusIA(
      `A IA gerou ${questoesGeradas.length}/${modeloFinal.totalQuestoes}. O restante foi completado pelo sistema procedural inteligente.`
    );
  } else {
    setStatusIA(
      adaptativoAtivo
        ? "Prova adaptativa gerada pela Lyra."
        : "Prova inedita gerada com IA."
    );
  }

  const questoesCompletas = completarQuestoesProcedurais({
    questoes: questoesGeradas,
    materias: modeloFinal.materias,
    modo: modoSelecionado,
  });

  setSimulado({
    ...base,
    config: modeloFinal,
    questoes: questoesCompletas.slice(0, modeloFinal.totalQuestoes),
  });

  setQuestaoIndex(0);
  setSecondsLeft(modeloFinal.duracaoMinutos * 60);
  setRunning(true);
  setFinalizado(false);
  setGerando(false);
}
function trocarQuestao(nextIndex: number) {
  setQuestaoIndex(nextIndex);
  setQuestaoEntrouEm(Date.now());
}

function responder(altIndex: number) {
    if (!simulado || !questaoAtual || finalizado) return;

    setSimulado({
      ...simulado,
      respostas: {
        ...simulado.respostas,
        [questaoAtual.id]: altIndex,
      },
    });
  }

  async function finalizar() {
  if (!simulado) return;

  const done = {
    ...simulado,
    finalizadoEm: new Date().toISOString(),
  };

  setSimulado(done);
  await salvarSimuladoProva(done);
  salvarBancoErrosSimulado(done);
  setRunning(false);
  setFinalizado(true);
}
  const diagnosticoPosSimulado = useMemo(() => {
    if (!simulado || !resultado) return null;

    const piorMateria = [...resultado.porMateria].sort((a, b) => a.taxa - b.taxa)[0];
    const melhorMateria = [...resultado.porMateria].sort((a, b) => b.taxa - a.taxa)[0];

    const tempos = simulado.temposPorQuestao || {};
    const totalTempoQuestoes = Object.values(tempos).reduce((acc: number, value: any) => acc + Number(value || 0), 0);
    const tempoMedio = resultado.total ? Math.round(totalTempoQuestoes / resultado.total) : 0;

    return {
      piorMateria,
      melhorMateria,
      tempoMedio,
      mensagem:
        resultado.taxa >= 80
          ? "Desempenho forte. A Lyra recomenda manter revisoes e usar simulados mais longos ou mais dificeis."
          : resultado.taxa >= 60
          ? "Desempenho intermediario. A Lyra recomenda reforcar as materias abaixo de 60% e manter questoes diarias."
          : "Desempenho baixo para prova. A Lyra recomenda ciclo de recuperacao com revisao, flashcards e banco de erros antes do proximo simulado.",
    };
  }, [simulado, resultado]);

  const respondidas = simulado ? Object.keys(simulado.respostas || {}).length : 0;
  const progresso = simulado ? Math.round((respondidas / Math.max(1, simulado.questoes.length)) * 100) : 0;

  return (
    <main className="cp-os-page">
      <section className="mx-auto flex w-full max-w-[1280px] flex-col gap-5 px-4 py-5 md:px-6">
        <SimuladosHeader />

        {!simulado ? (
          <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5">
              <span className="cp-os-badge-blue">Modelo de prova</span>

              <h2 className="mt-3 text-2xl font-black text-white">
                Escolha o simulado
              </h2>

              <div className="mt-5 grid gap-3">
                {MODELOS_SIMULADO_PROVA.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setModeloId(item.id)}
                    className={
                      modeloId === item.id
                        ? "rounded-[26px] border border-cyan-300/30 bg-cyan-400/10 p-5 text-left"
                        : "rounded-[26px] border border-white/10 bg-black/15 p-5 text-left transition hover:border-cyan-300/20"
                    }
                  >
                    <h3 className="text-xl font-black text-white">{item.nome}</h3>

                    <p className="mt-2 text-sm text-slate-300">
                      {item.banca} - {item.cargo}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="cp-os-badge-blue">{item.totalQuestoes} questoes</span>
                      <span className="cp-os-badge-purple">{item.duracaoMinutos}min</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <aside className="rounded-[30px] border border-rose-300/20 bg-rose-400/10 p-5">
              <span className="cp-os-badge-red">Gerador IA</span>

              <h2 className="mt-3 text-2xl font-black text-white">
                Nova prova inedita
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-300">
                Escolha o modo. A IA deve gerar questoes novas a cada simulado, respeitando a distribuicao por materia.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setModoSelecionado("certo_errado")}
                  className={modoSelecionado === "certo_errado" ? "rounded-2xl border border-cyan-300/30 bg-cyan-400/10 px-4 py-3 text-sm font-black text-cyan-100" : "rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-sm font-black text-slate-300"}
                >
                  Certo/Errado
                </button>

                <button
                  type="button"
                  onClick={() => setModoSelecionado("multipla_escolha")}
                  className={modoSelecionado === "multipla_escolha" ? "rounded-2xl border border-cyan-300/30 bg-cyan-400/10 px-4 py-3 text-sm font-black text-cyan-100" : "rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-sm font-black text-slate-300"}
                >
                  Multipla escolha
                </button>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIdiomaSelecionado("Ingles")}
                  className={idiomaSelecionado === "Ingles" ? "rounded-2xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-3 text-sm font-black text-emerald-100" : "rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-sm font-black text-slate-300"}
                >
                  Ingles
                </button>

                <button
                  type="button"
                  onClick={() => setIdiomaSelecionado("Espanhol")}
                  className={idiomaSelecionado === "Espanhol" ? "rounded-2xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-3 text-sm font-black text-emerald-100" : "rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-sm font-black text-slate-300"}
                >
                  Espanhol
                </button>
              </div>

              <button
                type="button"
                onClick={() => setAdaptativoAtivo((v) => !v)}
                className={adaptativoAtivo ? "mt-5 w-full rounded-2xl border border-cyan-300/30 bg-cyan-400/10 px-4 py-3 text-sm font-black text-cyan-100" : "mt-5 w-full rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-sm font-black text-slate-300"}
              >
                {adaptativoAtivo ? "Modo adaptativo Lyra ligado" : "Ativar modo adaptativo Lyra"}
              </button>

              <div className="mt-5 rounded-[24px] border border-white/10 bg-black/15 p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-200">
                  {adaptativoAtivo ? "Distribuicao adaptativa Lyra" : "Distribuicao padrao da prova"}
                </p>

                <div className="mt-3 space-y-2">
                  {distribuicaoPreview.map((item) => (
                    <div key={item.materia} className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">{item.materia}</span>
                      <strong className="text-white">{item.quantidade}</strong>
                    </div>
                  ))}
                </div>

                {adaptativoAtivo ? (
                  <p className="mt-4 rounded-2xl border border-cyan-300/15 bg-cyan-400/10 p-3 text-xs leading-5 text-cyan-100">
                    A Lyra vai recalcular a distribuicao no momento da geracao usando simulados anteriores, erros e materias criticas.
                  </p>
                ) : null}
              </div>

              {historicoSimulados.length ? (
                <div className="mt-5 rounded-[24px] border border-white/10 bg-black/15 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-200">
                    Historico recente
                  </p>

                  <div className="mt-3 space-y-2">
                    {historicoSimulados.map((item: any) => {
                      const total = item?.questoes?.length || 0;
                      const acertos = item?.questoes?.filter(
                        (q: any) => item?.respostas?.[q.id] === q.correta
                      ).length || 0;

                      const taxa = total ? Math.round((acertos / total) * 100) : 0;

                      return (
                        <div key={item.id} className="flex items-center justify-between rounded-2xl bg-white/[0.04] px-3 py-2 text-sm">
                          <span className="text-slate-300">
                            {String(item.finalizadoEm || item.iniciadoEm || "").slice(0, 10)}
                          </span>

                          <strong className="text-white">{taxa}%</strong>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <button type="button" onClick={iniciarSimulado} disabled={gerando} className="cp-os-btn-primary mt-5 w-full">
                {gerando ? "Gerando prova..." : "Gerar nova prova"}
              </button>

              {statusIA ? (
                <p className="mt-3 text-center text-xs font-bold text-slate-300">
                  {statusIA}
                </p>
              ) : null}
            </aside>
          </section>
        ) : finalizado && resultado ? (
          <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
            <div className="rounded-[34px] border border-white/10 bg-white/[0.045] p-6">
              <span className="cp-os-badge-blue">Resultado</span>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="cp-os-badge-purple">
          IA: {simulado.questoes.filter((q: any) => !String(q.id || "").includes("procedural")).length}
        </span>

        <span className="cp-os-badge-blue">
          Procedural: {simulado.questoes.filter((q: any) => String(q.id || "").includes("procedural")).length}
        </span>
      </div>

              <h2 className="mt-3 text-3xl font-black text-white">
                {resultado.taxa}% de aproveitamento
              </h2>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <div className="rounded-[22px] border border-emerald-300/20 bg-emerald-400/10 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-200">Acertos</p>
                  <strong className="mt-1 block text-2xl text-white">{resultado.acertos}</strong>
                </div>

                <div className="rounded-[22px] border border-rose-300/20 bg-rose-400/10 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-200">Erros</p>
                  <strong className="mt-1 block text-2xl text-white">{resultado.erros}</strong>
                </div>

                <div className="rounded-[22px] border border-cyan-300/20 bg-cyan-400/10 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Total</p>
                  <strong className="mt-1 block text-2xl text-white">{resultado.total}</strong>
                </div>
              </div>

              {diagnosticoPosSimulado ? (
                <div className="mt-6 rounded-[26px] border border-cyan-300/20 bg-cyan-400/10 p-5">
                  <span className="cp-os-badge-blue">Diagnostico Lyra</span>

                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    {diagnosticoPosSimulado.mensagem}
                  </p>

                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-[22px] border border-rose-300/20 bg-rose-400/10 p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-rose-200">Mais critica</p>
                      <strong className="mt-1 block text-lg text-white">
                        {diagnosticoPosSimulado.piorMateria?.materia || "Sem dados"}
                      </strong>
                    </div>

                    <div className="rounded-[22px] border border-emerald-300/20 bg-emerald-400/10 p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-200">Mais forte</p>
                      <strong className="mt-1 block text-lg text-white">
                        {diagnosticoPosSimulado.melhorMateria?.materia || "Sem dados"}
                      </strong>
                    </div>

                    <div className="rounded-[22px] border border-violet-300/20 bg-violet-400/10 p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-200">Tempo medio</p>
                      <strong className="mt-1 block text-lg text-white">
                        {formatTime(diagnosticoPosSimulado.tempoMedio)}
                      </strong>
                    </div>
                  </div>
                </div>
              ) : null}

              
              <div className="mt-6 space-y-3">
                {resultado.porMateria.map((item) => (
                  <article key={item.materia} className="rounded-[24px] border border-white/10 bg-black/15 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-black text-white">{item.materia}</h3>
                        <p className="mt-1 text-sm text-slate-400">
                          {item.acertos}/{item.total} acertos
                        </p>
                      </div>

                      <strong className="text-xl text-white">{item.taxa}%</strong>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                        style={{ width: `${item.taxa}%` }}
                      />
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <aside className="rounded-[30px] border border-cyan-300/20 bg-cyan-400/10 p-5">
              <span className="cp-os-badge-blue">Lyra</span>

              <h2 className="mt-3 text-2xl font-black text-white">
                Diagnostico do simulado
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-300">
                Use este resultado como mapa de partida. Materias com menor taxa devem subir no planejamento, revisao e flashcards.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSimulado(null);
                  setFinalizado(false);
                  setStatusIA("");
                }}
                className="cp-os-btn-primary mt-5 w-full"
              >
                Fazer novo simulado
              </button>
            </aside>
          </section>
        ) : (
          <section className="flex flex-col gap-5">
            <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5">
              <div className="grid gap-3 md:grid-cols-4">
                <div className="rounded-[22px] border border-cyan-300/20 bg-cyan-400/10 px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200">Tempo</p>
                  <strong className="mt-1 block text-2xl text-white">{formatTime(secondsLeft)}</strong>
                </div>

                <div className="rounded-[22px] border border-emerald-300/20 bg-emerald-400/10 px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-200">Respondidas</p>
                  <strong className="mt-1 block text-2xl text-white">{respondidas}/{simulado.questoes.length}</strong>
                </div>

                <div className="rounded-[22px] border border-violet-300/20 bg-violet-400/10 px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-200">Progresso</p>
                  <strong className="mt-1 block text-2xl text-white">{progresso}%</strong>
                </div>

                <div className="rounded-[22px] border border-rose-300/20 bg-rose-400/10 px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-200">Tempo nesta</p>
                  <strong className="mt-1 block text-xl text-white">
                    {questaoAtual && questaoEntrouEm ? formatTime(Number(simulado.temposPorQuestao?.[questaoAtual.id] || 0) + Math.round((Date.now() - questaoEntrouEm) / 1000)) : "00:00"}
                  </strong>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {simulado.questoes.map((q, i) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => trocarQuestao(i)}
                    className={
                      questaoIndex === i
                        ? "h-9 w-9 rounded-xl bg-cyan-400 text-sm font-black text-slate-950"
                        : simulado.respostas[q.id] !== undefined
                        ? "h-9 w-9 rounded-xl bg-emerald-500/70 text-sm font-black text-white"
                        : "h-9 w-9 rounded-xl bg-white/10 text-sm font-black text-white"
                    }
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-white/[0.045] p-6">
              {questaoAtual ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="cp-os-badge-purple">{questaoAtual.materia}</span>
                    <strong className="text-sm text-slate-300">Questao {questaoIndex + 1}</strong>
                  </div>

                  <h2 className="mt-6 text-2xl font-black leading-tight text-white">
                    {questaoAtual.enunciado}
                  </h2>

                  <div className="mt-6 grid gap-3">
                    {questaoAtual.alternativas.map((alt, altIndex) => {
                      const marcada = simulado.respostas[questaoAtual.id] === altIndex;

                      return (
                        <button
                          key={altIndex}
                          type="button"
                          onClick={() => responder(altIndex)}
                          className={
                            marcada
                              ? "rounded-[22px] border border-cyan-300/30 bg-cyan-500/15 p-4 text-left font-black text-cyan-100"
                              : "rounded-[22px] border border-white/10 bg-black/15 p-4 text-left font-bold text-slate-200 transition hover:bg-white/[0.06]"
                          }
                        >
                          {alt}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button type="button" onClick={() => {
                        trocarQuestao(Math.max(0, questaoIndex - 1));
                      }} className="cp-os-btn-soft">
                      Anterior
                    </button>

                    <button type="button" onClick={() => {
                        trocarQuestao(Math.min(simulado.questoes.length - 1, questaoIndex + 1));
                      }} className="cp-os-btn-primary">
                      Proxima
                    </button>

                    <button type="button" onClick={finalizar} className="cp-os-btn-soft">
                      Finalizar simulado
                    </button>
                  </div>
                </>
              ) : null}
            </section>
          </section>
        )}
      </section>
    </main>
  );
}
