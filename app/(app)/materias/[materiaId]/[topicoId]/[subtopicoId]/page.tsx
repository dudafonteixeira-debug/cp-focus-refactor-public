"use client";

import DigitalNotebook from "@/components/study/DigitalNotebook";
import { salvarFlashcards } from "@/lib/flashcards-core";
import { addXp } from "@/lib/gamificacao";
import { salvarNaRevisaoInteligente } from "@/lib/revisao-inteligente-adapter";
import { loadAppData, updateAppData } from "@/lib/app-storage";
import { finishMission, getMissionRoute, getTodayMissions, replanMission } from "@/lib/engine";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

function arr(value: any): any[] {
  return Array.isArray(value) ? value : [];
}

const PLANO_KEY = "cp_focus_plano_dia_v2";

function uid() {
  return Date.now().toString() + "_" + Math.random().toString(36).slice(2, 9);
}

export default function SubtopicoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const missionId = searchParams.get("missionId") || "";
  const params = useParams<{ materiaId: string; topicoId: string; subtopicoId: string }>();

  const materiaId = String(params?.materiaId || "");
  const topicoId = String(params?.topicoId || "");
  const subtopicoId = String(params?.subtopicoId || "");

  const [appData, setAppData] = useState<any>({ materias: [] });
  const [conteudoTexto, setConteudoTexto] = useState("");
  const [anotacaoTexto, setAnotacaoTexto] = useState("");
  const [status, setStatus] = useState("");
  const [fluxoAberto, setFluxoAberto] = useState(false);
  const [proximaTarefa, setProximaTarefa] = useState<any>(null);
  const [progressoFluxo, setProgressoFluxo] = useState({ feitas: 0, total: 0 });
  const [xpGanho, setXpGanho] = useState(0);
  const [nivelAtual, setNivelAtual] = useState(1);
  const [streakAtual, setStreakAtual] = useState(0);
  const [dadosCarregados, setDadosCarregados] = useState(false);

  function reload() {
    setAppData(loadAppData() || { materias: [] });
    setDadosCarregados(true);
  }

  useEffect(() => {
    reload();
  }, []);

  const materia = useMemo(() => {
    return arr(appData?.materias).find((m: any) => String(m.id) === materiaId) || null;
  }, [appData, materiaId]);

  const topico = useMemo(() => {
    return arr(materia?.topicos).find((t: any) => String(t.id) === topicoId) || null;
  }, [materia, topicoId]);

  const subtopico = useMemo(() => {
    return arr(topico?.subtopicos).find((s: any) => String(s.id) === subtopicoId) || null;
  }, [topico, subtopicoId]);

  useEffect(() => {
    if (!dadosCarregados) return;
    if (!missionId) return;
    if (subtopico) return;

    let ativo = true;

    void replanMission(
      missionId,
      "O conteudo vinculado a esta missao nao esta mais disponivel."
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
  }, [dadosCarregados, missionId, subtopico, router]);


  useEffect(() => {
    if (!subtopico) return;

    const ultimoConteudo = arr(subtopico.conteudos).at(-1);
    const ultimaAnotacao = arr(subtopico.anotacoes).at(-1);

    setConteudoTexto(typeof ultimoConteudo?.texto === "string" ? ultimoConteudo.texto : "");
    setAnotacaoTexto(typeof ultimaAnotacao?.texto === "string" ? ultimaAnotacao.texto : "");
  }, [subtopicoId, subtopico]);

  function updateSubtopico(mutator: (sub: any) => any) {
    updateAppData((data: any) => {
      return {
        ...data,
        materias: arr(data.materias).map((materiaItem: any) => {
          if (String(materiaItem.id) !== materiaId) return materiaItem;

          return {
            ...materiaItem,
            ultimaAtividade: new Date().toISOString(),
            topicos: arr(materiaItem.topicos).map((topicoItem: any) => {
              if (String(topicoItem.id) !== topicoId) return topicoItem;

              return {
                ...topicoItem,
                subtopicos: arr(topicoItem.subtopicos).map((sub: any) => {
                  if (String(sub.id) !== subtopicoId) return sub;
                  return mutator(sub);
                }),
              };
            }),
          };
        }),
      };
    });

    reload();
  }

  function salvarConteudo() {
    if (!conteudoTexto.trim()) return;

    updateSubtopico((sub) => ({
      ...sub,
      conteudos: [
        ...arr(sub.conteudos),
        {
          id: uid(),
          texto: conteudoTexto,
          criadoEm: new Date().toISOString(),
          tipo: "caderno-digital",
        },
      ],
    }));

    setStatus("Conteudo salvo.");
  }

  function salvarAnotacao() {
    if (!anotacaoTexto.trim()) return;

    updateSubtopico((sub) => ({
      ...sub,
      anotacoes: [
        ...arr(sub.anotacoes),
        {
          id: uid(),
          texto: anotacaoTexto,
          criadoEm: new Date().toISOString(),
          tipo: "caderno-digital",
        },
      ],
    }));

    setStatus("Anotacao salva.");
  }

  function excluirItem(tipo: "conteudos" | "anotacoes", itemId: string) {
    updateSubtopico((sub) => ({
      ...sub,
      [tipo]: arr(sub[tipo]).filter((item: any) => String(item.id) !== String(itemId)),
    }));

    setStatus("Item excluido.");
  }

  function abrirProximaTarefa() {
    if (!proximaTarefa) {
      router.push("/dashboard");
      return;
    }

    router.push(getMissionRoute(proximaTarefa));
  }

  async function marcarConcluido() {
    updateSubtopico((sub) => ({
      ...sub,
      estudado: true,
      concluido: true,
      dataEstudo: new Date().toISOString(),
    }));
    const engineBefore = await getTodayMissions();

    const missionAtual = engineBefore.missions.find((mission) =>
      String(mission.materiaId || "") === materiaId &&
      String(mission.topicoId || "") === topicoId &&
      String(mission.subtopicoId || "") === subtopicoId &&
      !mission.concluida
    );

    const engineResult = missionAtual
      ? await finishMission({ missionId: missionAtual.id })
      : engineBefore;

    const gamificacao = missionAtual && "completionApplied" in engineResult && engineResult.completionApplied
      ? await addXp(35)
      : null;
    setXpGanho(gamificacao ? 35 : 0);
    if (gamificacao) setNivelAtual(gamificacao.nivel);
    if (gamificacao) setStreakAtual(gamificacao.streak);

    setProximaTarefa(engineResult.proxima);
    setProgressoFluxo({
      feitas: engineResult.concluidas.length,
      total: engineResult.missions.length,
    });
    setFluxoAberto(true);

    setStatus("Subtopico concluido e fluxo recalculado pelo CP Focus.");
  }

  function salvarComoRevisao() {
    if (!subtopico) return;

    const conteudos = arr(subtopico.conteudos).map((item: any) => item.texto).join("\n\n");
    const anotacoes = arr(subtopico.anotacoes).map((item: any) => item.texto).join("\n\n");
    const texto = [conteudos, anotacoes].filter(Boolean).join("\n\n");

    try {
      salvarNaRevisaoInteligente({
        titulo: subtopico.nome || "Revisao",
        texto: texto || subtopico.nome || "",
        materiaId,
        topicoId,
        subtopicoId,
        materiaNome: materia?.nome,
        topicoNome: topico?.nome,
        subtopicoNome: subtopico?.nome,
        origem: "subtopico",
      } as any);

      setStatus("Salvo na revisao inteligente.");
    } catch {
      setStatus("Erro ao salvar revisao.");
    }
  }

  if (!materia || !topico || !subtopico) {
    return (
      <main className="cp-os-page">
        <section className="cp-os-container">
          <div className="cp-os-empty">
            <strong>Subtopico nao encontrado</strong>
            Volte para o Centro de Estudos.
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="cp-os-page">
      <section className="mx-auto flex w-full max-w-[1320px] flex-col gap-5 px-4 py-5 md:px-6">
        <header className="rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,rgba(18,26,72,.96),rgba(7,12,35,.98))] p-6 shadow-[0_28px_100px_rgba(0,0,0,.44)]">
          <button
            type="button"
            onClick={() => router.push(`/materias/${materiaId}/${topicoId}`)}
            className="cp-os-btn-soft"
          >
            Voltar para o topico
          </button>

          <p className="mt-5 text-[11px] font-black uppercase tracking-[0.28em] text-cyan-200">
            {materia.nome} - {topico.nome}
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight text-white md:text-5xl">
            {subtopico.nome}
          </h1>

          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
            Caderno digital inteligente para conteudos, anotacoes, revisao e execucao do estudo.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={salvarComoRevisao} className="cp-os-btn-primary">
              Salvar como revisao
            </button>

            <button type="button" onClick={marcarConcluido} className="cp-os-btn-focus">
              Marcar concluido
            </button>

            <button type="button" onClick={() => router.push("/dashboard")} className="cp-os-btn-soft">
              Voltar ao Dashboard
            </button>
          </div>

          {status ? (
            <p className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm font-bold text-emerald-100">
              {status}
            </p>
          ) : null}
        </header>

        <section className="grid gap-5 xl:grid-cols-2">
          <div className="rounded-[34px] border border-cyan-300/15 bg-[linear-gradient(135deg,rgba(20,32,88,.94),rgba(9,14,42,.98))] p-5 shadow-[0_28px_100px_rgba(0,0,0,.38)]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="cp-os-badge-blue">Conteudo principal</span>
                <h2 className="mt-3 text-2xl font-black text-white">Caderno de conteudo</h2>
                <p className="mt-1 text-sm text-slate-300">Use caneta, marca-texto, sublinhado, titulos e listas.</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={salvarConteudo} className="cp-os-btn-primary">
                  Salvar conteudo
                </button>

                <button type="button" className="cp-os-btn-soft">
                  Criar flashcard
                </button>
              </div>
            </div>

            <DigitalNotebook
              value={conteudoTexto}
              onChange={setConteudoTexto}
              placeholder="Monte seu conteudo inteligente..."
            />
          </div>

          <div className="rounded-[34px] border border-fuchsia-300/15 bg-[linear-gradient(135deg,rgba(38,20,88,.86),rgba(9,14,42,.98))] p-5 shadow-[0_28px_100px_rgba(0,0,0,.38)]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="cp-os-badge-purple">Anotacoes</span>
                <h2 className="mt-3 text-2xl font-black text-white">Caderno de anotacoes</h2>
                <p className="mt-1 text-sm text-slate-300">Registre observacoes, exemplos, macetes e pontos de prova.</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={salvarAnotacao} className="cp-os-btn-primary">
                  Salvar anotacao
                </button>

                <button type="button" className="cp-os-btn-soft">
                  Criar flashcard
                </button>
              </div>
            </div>

            <DigitalNotebook
              value={anotacaoTexto}
              onChange={setAnotacaoTexto}
              placeholder="Escreva suas anotacoes..."
            />
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <div className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5">
            <span className="cp-os-badge-blue">Conteudos salvos</span>

            <div className="mt-4 space-y-3">
              {arr(subtopico.conteudos).length ? (
                arr(subtopico.conteudos).map((item: any) => (
                  <article key={item.id} className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                    <div className="prose prose-invert max-w-none text-slate-200" dangerouslySetInnerHTML={{ __html: item.texto || "" }} />
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="text-xs text-slate-500">{item.criadoEm ? new Date(item.criadoEm).toLocaleString() : ""}</span>
                      <button type="button" onClick={() => excluirItem("conteudos", item.id)} className="cp-os-btn-soft">
                        Excluir
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <p className="text-sm text-slate-400">Nenhum conteudo salvo ainda.</p>
              )}
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5">
            <span className="cp-os-badge-purple">Anotacoes salvas</span>

            <div className="mt-4 space-y-3">
              {arr(subtopico.anotacoes).length ? (
                arr(subtopico.anotacoes).map((item: any) => (
                  <article key={item.id} className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                    <div className="prose prose-invert max-w-none text-slate-200" dangerouslySetInnerHTML={{ __html: item.texto || "" }} />
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="text-xs text-slate-500">{item.criadoEm ? new Date(item.criadoEm).toLocaleString() : ""}</span>
                      <button type="button" onClick={() => excluirItem("anotacoes", item.id)} className="cp-os-btn-soft">
                        Excluir
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <p className="text-sm text-slate-400">Nenhuma anotacao salva ainda.</p>
              )}
            </div>
          </div>
        </section>
        {fluxoAberto ? (
          <div className="cp-os-modal-backdrop">
            <section className="cp-os-modal max-w-[620px]">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-[24px] bg-emerald-400/15 text-3xl">
                OK
              </div>

              <h2 className="mt-5 text-center text-3xl font-black text-white">
                Fluxo de estudo atualizado
              </h2>

              <p className="mt-3 text-center text-sm leading-7 text-slate-300">
                Tarefa concluida. O plano do dia foi atualizado automaticamente.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[22px] border border-white/10 bg-white/[0.055] p-4 text-center">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">XP ganho</p>
                  <strong className="mt-1 block text-2xl text-cyan-200">+{xpGanho}</strong>
                </div>

                <div className="rounded-[22px] border border-white/10 bg-white/[0.055] p-4 text-center">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Nivel</p>
                  <strong className="mt-1 block text-2xl text-white">{nivelAtual}</strong>
                </div>

                <div className="rounded-[22px] border border-white/10 bg-white/[0.055] p-4 text-center">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Sequencia</p>
                  <strong className="mt-1 block text-2xl text-emerald-200">{streakAtual} dia(s)</strong>
                </div>
              </div>

              <div className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.045] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-300">Progresso do dia</span>
                  <strong className="text-cyan-200">
                    {progressoFluxo.feitas}/{progressoFluxo.total}
                  </strong>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                    style={{
                      width: progressoFluxo.total
                        ? `${Math.round((progressoFluxo.feitas / progressoFluxo.total) * 100)}%`
                        : "0%",
                    }}
                  />
                </div>
              </div>

              {proximaTarefa ? (
                <div className="mt-5 rounded-[24px] border border-cyan-300/20 bg-cyan-400/10 p-4">
                  <span className="cp-os-badge-blue">Proxima tarefa</span>
                  <h3 className="mt-3 text-xl font-black text-white">{proximaTarefa.titulo}</h3>
                  <p className="mt-1 text-sm text-slate-300">
                    {proximaTarefa.materia} - {proximaTarefa.topico}
                  </p>
                </div>
              ) : (
                <div className="mt-5 rounded-[24px] border border-emerald-300/20 bg-emerald-400/10 p-4 text-center">
                  <h3 className="text-xl font-black text-emerald-100">Dia finalizado</h3>
                  <p className="mt-2 text-sm text-emerald-50/80">
                    Nao ha mais tarefas pendentes no plano de hoje.
                  </p>
                </div>
              )}

              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button type="button" onClick={abrirProximaTarefa} className="cp-os-btn-primary">
                  {proximaTarefa ? "Continuar fluxo" : "Voltar ao Dashboard"}
                </button>

                <button type="button" onClick={() => router.push("/dashboard")} className="cp-os-btn-soft">
                  Dashboard
                </button>

                <button type="button" onClick={() => setFluxoAberto(false)} className="cp-os-btn-soft">
                  Ficar aqui
                </button>
              </div>
            </section>
          </div>
        ) : null}
      </section>
    </main>
  );
}














