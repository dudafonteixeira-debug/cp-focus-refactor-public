"use client";

import { DATA_KEYS } from "@/lib/data-access/keys";

import { useEffect, useMemo, useState } from "react";

import { loadAppData } from "@/lib/app-storage";
import { getPerfilUsuario, savePerfilUsuario } from "@/lib/data-access/app-repository";
import { listarSimuladosProva } from "@/lib/simulados-prova/engine";
import { calcularAdaptiveScores } from "@/lib/adaptive/engine";
import { gerarPerfilAdaptativo } from "@/lib/profile/profile-engine";
import { analisarComportamentoEstudo } from "@/lib/profile/behavior-engine";
import { listarTimelinePerfil, salvarSnapshotPerfil, analisarTimelinePerfil } from "@/lib/profile/timeline-engine";

const PERFIL_KEY = DATA_KEYS.perfilUsuario;

function perfilVazio() {
  return {
    nome: "",
    concursoAlvo: "PRF",
    banca: "CEBRASPE",
    cargo: "Policial Rodoviario Federal",
    horasDia: "2",
    rotina: "manha",
    trabalha: "sim",
    filhos: "nao",
    metaAprovacao: "",
    dificuldadePrincipal: "",
    motivacao: "",
  };
}

export default function PerfilPage() {
  const [dadosUsuario, setDadosUsuario] = useState<any>(perfilVazio());
  const [status, setStatus] = useState("");

  useEffect(() => {
    getPerfilUsuario(perfilVazio())
      .then((perfil) => {
        setDadosUsuario({ ...perfilVazio(), ...(perfil || {}) });
      })
      .catch(() => {});
  }, []);

  function atualizarCampo(campo: string, valor: string) {
    setDadosUsuario((atual: any) => ({
      ...atual,
      [campo]: valor,
    }));
  }

  function salvarPerfil() {
    savePerfilUsuario(dadosUsuario)
      .then(() => {
        setStatus("Perfil salvo. A Lyra usara esses dados para personalizar o plano.");
      })
      .catch(() => {
        setStatus("Nao foi possivel salvar o perfil.");
      });
  }

  const [mounted, setMounted] = useState(false);
  const [appData, setAppData] = useState<any>({
    materias: [],
    revisoes: [],
  });

  const [simulados, setSimulados] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);

    try {
      setAppData(loadAppData());
      listarSimuladosProva()
        .then(setSimulados)
        .catch(() => setSimulados([]));
    } catch {}
  }, []);

  const radar = calcularAdaptiveScores({
    simulados,
    reviews: appData?.revisoes || [],
    erros: appData?.bancoErros || [],
    sessoes: appData?.sessoes || [],
  });

  const perfil = useMemo(() => {
    return gerarPerfilAdaptativo({
      simulados,
      radar,
      sessoes: appData?.sessoes || [],
      revisoes: appData?.revisoes || [],
    });
  }, [simulados, radar, appData]);

  const comportamento = useMemo(() => {
    return analisarComportamentoEstudo({
      sessoes: appData?.sessoes || [],
      simulados,
      revisoes: appData?.revisoes || [],
    });
  }, [appData, simulados]);

  if (!mounted) {
    return (
      <main className="cp-os-page">
        <section className="cp-os-container" />
      </main>
    );
  }

  return (
    <main className="cp-os-page">
      <section className="cp-os-container">
        <div className="cp-os-hero cp-os-fade-up">
          <div className="cp-os-hero-inner">
            <span className="cp-os-eyebrow">Perfil adaptativo</span>

            <h1 className="cp-os-title">
              Seu perfil de estudante
            </h1>

            <p className="cp-os-subtitle">
              A Lyra acompanha seu desempenho, consistencia, simulados e revisoes para entender como voce aprende.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-4">
          <div className="cp-os-metric">
            <p className="cp-os-metric-label">Score geral</p>
            <p className="cp-os-metric-value">
              {perfil.scoreGeral}
            </p>
            <p className="cp-os-metric-hint">
              Calculado pelo desempenho real.
            </p>
          </div>

          <div className="cp-os-metric">
            <p className="cp-os-metric-label">Consistencia</p>
            <p className="cp-os-metric-value">
              {perfil.consistencia}
            </p>
            <p className="cp-os-metric-hint">
              Baseado na frequencia de estudo.
            </p>
          </div>

          <div className="cp-os-metric">
            <p className="cp-os-metric-label">Taxa media</p>
            <p className="cp-os-metric-value">
              {perfil.taxaMedia}%
            </p>
            <p className="cp-os-metric-hint">
              Media dos simulados realizados.
            </p>
          </div>

          <div className="cp-os-metric">
            <p className="cp-os-metric-label">Materia critica</p>
            <p className="cp-os-metric-value">
              {perfil.materiaMaisCritica || "Nenhuma"}
            </p>
            <p className="cp-os-metric-hint">
              Detectada pelo radar adaptativo.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="cp-os-panel">
            <div className="rounded-[28px] border border-white/10 bg-black/15 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="cp-os-badge-purple">Dados pessoais</span>
                  <h2 className="mt-3 text-2xl font-black text-white">Identidade e meta</h2>
                  <p className="mt-2 text-sm text-slate-300">
                    Esses dados ajudam a Lyra a personalizar rotina, carga, simulados e estrategia.
                  </p>
                </div>

                <button type="button" onClick={salvarPerfil} className="cp-os-btn-primary">
                  Salvar perfil
                </button>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <input className="cp-os-input" placeholder="Nome" value={dadosUsuario.nome} onChange={(e) => atualizarCampo("nome", e.target.value)} />
                <input className="cp-os-input" placeholder="Concurso alvo" value={dadosUsuario.concursoAlvo} onChange={(e) => atualizarCampo("concursoAlvo", e.target.value)} />
                <input className="cp-os-input" placeholder="Banca" value={dadosUsuario.banca} onChange={(e) => atualizarCampo("banca", e.target.value)} />
                <input className="cp-os-input" placeholder="Cargo" value={dadosUsuario.cargo} onChange={(e) => atualizarCampo("cargo", e.target.value)} />
                <input className="cp-os-input" placeholder="Horas disponiveis por dia" value={dadosUsuario.horasDia} onChange={(e) => atualizarCampo("horasDia", e.target.value)} />
                <input className="cp-os-input" placeholder="Meta de aprovacao / prazo" value={dadosUsuario.metaAprovacao} onChange={(e) => atualizarCampo("metaAprovacao", e.target.value)} />

                <select className="cp-os-input" value={dadosUsuario.rotina} onChange={(e) => atualizarCampo("rotina", e.target.value)}>
                  <option value="manha">Estudo melhor de manha</option>
                  <option value="tarde">Estudo melhor a tarde</option>
                  <option value="noite">Estudo melhor a noite</option>
                  <option value="variavel">Rotina variavel</option>
                </select>

                <select className="cp-os-input" value={dadosUsuario.trabalha} onChange={(e) => atualizarCampo("trabalha", e.target.value)}>
                  <option value="sim">Trabalho atualmente</option>
                  <option value="nao">Nao trabalho atualmente</option>
                  <option value="faculdade">Faculdade/curso ocupa parte do dia</option>
                </select>

                <select className="cp-os-input" value={dadosUsuario.filhos} onChange={(e) => atualizarCampo("filhos", e.target.value)}>
                  <option value="nao">Nao tenho filhos/responsabilidades fixas</option>
                  <option value="sim">Tenho filhos/responsabilidades familiares</option>
                </select>

                <input className="cp-os-input" placeholder="Principal dificuldade" value={dadosUsuario.dificuldadePrincipal} onChange={(e) => atualizarCampo("dificuldadePrincipal", e.target.value)} />
              </div>

              <textarea
                className="cp-os-input mt-3 min-h-[110px]"
                placeholder="Motivacao principal para ser aprovado(a)"
                value={dadosUsuario.motivacao}
                onChange={(e) => atualizarCampo("motivacao", e.target.value)}
              />

              {status ? (
                <p className="mt-3 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-3 text-sm font-bold text-emerald-100">
                  {status}
                </p>
              ) : null}
            </div>

            <div className="mt-5">
              <span className="cp-os-badge-blue">
                Perfil detectado
              </span>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-white">
                {perfil.perfil}
              </h2>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
                {perfil.recomendacao}
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="cp-os-card-flat p-4">
                <strong className="text-white">
                  Simulados
                </strong>

                <p className="mt-2 text-3xl font-black text-white">
                  {perfil.quantidadeSimulados}
                </p>

                <p className="mt-2 text-sm text-slate-400">
                  Provas registradas pelo sistema.
                </p>
              </div>

              <div className="cp-os-card-flat p-4">
                <strong className="text-white">
                  Revisoes
                </strong>

                <p className="mt-2 text-3xl font-black text-white">
                  {perfil.quantidadeRevisoes}
                </p>

                <p className="mt-2 text-sm text-slate-400">
                  Itens ativos na memoria.
                </p>
              </div>

              <div className="cp-os-card-flat p-4">
                <strong className="text-white">
                  Tempo total
                </strong>

                <p className="mt-2 text-3xl font-black text-white">
                  {Math.round((perfil.tempoTotal || 0) / 60)}h
                </p>

                <p className="mt-2 text-sm text-slate-400">
                  Horas registradas de estudo.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-[28px] border border-cyan-300/20 bg-cyan-400/10 p-5">
              <span className="cp-os-badge-blue">
                Analise Lyra
              </span>

              <p className="mt-4 text-sm leading-7 text-slate-300">
                A Lyra esta usando simulados, revisoes e desempenho para entender como voce aprende e recalcular automaticamente prioridades do sistema.
              </p>
            </div>

            <div className="mt-5 rounded-[28px] border border-rose-300/20 bg-rose-400/10 p-5">
              <span className="cp-os-badge-red">
                Perfil comportamental
              </span>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-white/[0.05] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-rose-200">
                    Consistencia emocional
                  </p>

                  <strong className="mt-2 block text-xl text-white">
                    {comportamento.consistencia}
                  </strong>
                </div>

                <div className="rounded-2xl bg-white/[0.05] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-rose-200">
                    Sessao media
                  </p>

                  <strong className="mt-2 block text-xl text-white">
                    {comportamento.mediaDuracao} min
                  </strong>
                </div>

                <div className="rounded-2xl bg-white/[0.05] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-rose-200">
                    Simulados
                  </p>

                  <strong className="mt-2 block text-xl text-white">
                    {comportamento.taxaSimulados}%
                  </strong>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {comportamento.insights.map((insight: string, index: number) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-sm leading-7 text-slate-200"
                  >
                    {insight}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="cp-os-ai-card p-6">
            <div className="cp-os-ai-orb">Lyra</div>

            <h2 className="mt-4 text-2xl font-black text-white">
              Identidade do estudante
            </h2>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl bg-white/[0.05] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">
                  Usuario
                </p>

                <strong className="mt-2 block text-xl text-white">
                  {dadosUsuario.nome || "Estudante CP Focus"}
                </strong>
              </div>

              <div className="rounded-2xl bg-white/[0.05] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">
                  Objetivo
                </p>

                <strong className="mt-2 block text-xl text-white">
                  {dadosUsuario.concursoAlvo} - {dadosUsuario.cargo}
                </strong>
              </div>

              <div className="rounded-2xl bg-white/[0.05] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">
                  Nivel atual
                </p>

                <strong className="mt-2 block text-xl text-white">
                  {perfil.scoreGeral >= 80
                    ? "Avancado"
                    : perfil.scoreGeral >= 60
                    ? "Intermediario"
                    : "Em evolucao"}
                </strong>
              </div>

              <div className="rounded-2xl bg-white/[0.05] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">
                  Estilo detectado
                </p>

                <strong className="mt-2 block text-xl text-white">
                  {perfil.consistencia === "alta"
                    ? "Consistente"
                    : perfil.consistencia === "media"
                    ? "Oscilante"
                    : "Irregular"}
                </strong>
              </div>

              <div className="rounded-2xl bg-white/[0.05] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">
                  Foco atual
                </p>

                <strong className="mt-2 block text-xl text-white">
                  {perfil.materiaMaisCritica || "Performance geral"}
                </strong>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
