"use client";

import { SimuladosHeader } from "@/components/simulados/simulados-header";
import { SimuladosSetup } from "@/components/simulados/simulados-setup";
import { SimuladosRunner } from "@/components/simulados/simulados-runner";
import { SimuladosResult } from "@/components/simulados/simulados-result";

import { DATA_KEYS } from "@/lib/data-access/keys";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { finishMission, getMissionRoute } from "@/lib/engine";
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
export function SimuladosFeature() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const missionId = searchParams.get("missionId") || "";
  const [simulado, setSimulado] = useState<SimuladoProva | null>(null);
  const [nextMission, setNextMission] = useState<any>(null);
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

  async function concluirMissaoDoSimulado(done: SimuladoProva) {
    if (!missionId) return;

    const resultadoFinal = corrigirSimuladoProva(done);

    const engineResult = await finishMission({
      missionId,
      nota: `Simulado concluido com ${resultadoFinal.taxa}% de aproveitamento. Acertos: ${resultadoFinal.acertos}. Erros: ${resultadoFinal.erros}.`,
    });

    setNextMission(engineResult.proxima);
  }

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
    await concluirMissaoDoSimulado(done);
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
      await concluirMissaoDoSimulado(done);
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
          <SimuladosSetup
              adaptativoAtivo={adaptativoAtivo}
              distribuicaoPreview={distribuicaoPreview}
              gerando={gerando}
              historicoSimulados={historicoSimulados}
              idiomaSelecionado={idiomaSelecionado}
              iniciarSimulado={iniciarSimulado}
              modeloId={modeloId}
              modoSelecionado={modoSelecionado}
              setAdaptativoAtivo={setAdaptativoAtivo}
              setIdiomaSelecionado={setIdiomaSelecionado}
              setModeloId={setModeloId}
              setModoSelecionado={setModoSelecionado}
              statusIA={statusIA}
            />) : finalizado && resultado ? (
          <SimuladosResult
                continuarFluxo={
                  missionId
                    ? () => {
                        if (nextMission) {
                          router.push(getMissionRoute(nextMission));
                          return;
                        }

                        router.push("/dashboard");
                      }
                    : undefined
                }
              diagnostico={diagnosticoPosSimulado}
              formatTime={formatTime}
              novoSimulado={() => {
                setSimulado(null);
                setFinalizado(false);
                setStatusIA("");
              }}
              resultado={resultado}
              simulado={simulado}
            />
        ) : (
          <SimuladosRunner
              finalizar={finalizar}
              formatTime={formatTime}
              progresso={progresso}
              questaoAtual={questaoAtual}
              questaoEntrouEm={questaoEntrouEm}
              questaoIndex={questaoIndex}
              responder={responder}
              respondidas={respondidas}
              secondsLeft={secondsLeft}
              simulado={simulado}
              trocarQuestao={trocarQuestao}
            />)}
      </section>
    </main>
  );
}






