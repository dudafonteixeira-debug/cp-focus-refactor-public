"use client";

import { DATA_KEYS } from "@/lib/data-access/keys";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { addXp } from "@/lib/gamificacao";
import { saveSessaoEstudo } from "@/lib/sessoes";
import { loadPlanoDia, persistPlanoDia } from "@/lib/planning-state";

function formatTime(seconds: number) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export default function ModoFocoPage() {
  const router = useRouter();

  const [tasks, setTasks] = useState<any[]>([]);
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(25 * 60);
  const [note, setNote] = useState("");
  const [doneModal, setDoneModal] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [xpInfo, setXpInfo] = useState<any>(null);

  async function carregar() {
    const loaded = await loadPlanoDia<any>();
    setTasks(loaded);

    const next = loaded.find((task: any) => !task.concluida);
    setSeconds(Number(next?.minutos || 25) * 60);
  }

  useEffect(() => {
    void carregar();
  }, []);

  useEffect(() => {
    if (!running) return;

    const timer = window.setInterval(() => {
      setSeconds((current) => (current > 0 ? current - 1 : 0));
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [running]);

  const pendentes = tasks.filter((task) => !task.concluida);
  const concluidas = tasks.filter((task) => task.concluida);
  const atual = pendentes[0] || null;

  const progresso = tasks.length ? Math.round((concluidas.length / tasks.length) * 100) : 0;

  function executarTarefa() {
    if (atual?.tipo === "Correcao") {
      router.push(`/questoes?materia=${encodeURIComponent(atual?.materia || "")}&topico=${encodeURIComponent(atual?.topico || "")}&origem=modo-foco`);
      return;
    }

    if (atual?.tipo === "Revisao") {
      router.push(`/revisao-inteligente?materia=${encodeURIComponent(atual?.materia || "")}&topico=${encodeURIComponent(atual?.topico || "")}&origem=modo-foco`);
      return;
    }

    abrirMaterial();
  }

  function abrirMaterial() {
    if (!atual) return;

    if (atual.materiaId && atual.topicoId && atual.subtopicoId) {
      router.push(`/materias/${atual.materiaId}/${atual.topicoId}/${atual.subtopicoId}`);
      return;
    }

    router.push("/materias");
  }

  async function concluirSessao() {
    if (!atual) {
      router.push("/dashboard");
      return;
    }

    const updated = tasks.map((task) =>
      task.id === atual.id
        ? {
            ...task,
            concluida: true,
            concluidaEm: new Date().toISOString(),
            notaSessao: note,
          }
        : task
    );

    await persistPlanoDia(updated);
    setTasks(updated);

    const segundosEstudados = Math.max(
      elapsedSeconds,
      startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0
    );

    await saveSessaoEstudo({
      id: `sessao-${Date.now()}`,
      taskId: atual.id,
      materia: atual.materia,
      topico: atual.topico,
      titulo: atual.titulo,
      tipo: atual.tipo,
      prioridade: atual.prioridade,
      minutosPlanejados: atual.minutos,
      segundosEstudados,
      nota: note,
      createdAt: new Date().toISOString(),
    });

    const game = addXp(40);
    setXpInfo(game);
    setRunning(false);
    setNote("");
    setStartedAt(null);
    setElapsedSeconds(0);
    setDoneModal(true);
  }

  async function continuarFluxo() {
    setDoneModal(false);

    const next = (await loadPlanoDia<any>()).find((task: any) => !task.concluida);

    if (!next) {
      router.push("/dashboard");
      return;
    }

    void carregar();
    setRunning(true);
  }

  if (!tasks.length) {
    return (
      <main className="cp-os-page">
        <section className="cp-os-container">
          <div className="cp-os-hero">
            <div className="cp-os-hero-inner">
              <span className="cp-os-eyebrow">Modo Foco</span>
              <h1 className="cp-os-title">Nenhum plano ativo.</h1>
              <p className="cp-os-subtitle">
                Gere o plano do dia no Planejamento OS antes de iniciar o modo foco.
              </p>

              <button
                type="button"
                onClick={() => router.push("/planejamento-inteligente")}
                className="cp-os-btn-primary mt-5"
              >
                Abrir Planejamento
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (!atual) {
    return (
      <main className="cp-os-page">
        <section className="cp-os-container">
          <div className="rounded-[36px] border border-emerald-300/20 bg-emerald-400/10 p-8 text-center">
            <h1 className="text-4xl font-black text-white">Dia finalizado</h1>
            <p className="mt-3 text-slate-300">
              Todas as tarefas do plano foram concluidas.
            </p>

            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="cp-os-btn-primary mt-6"
            >
              Voltar ao Dashboard
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="cp-os-page">
      <section className="mx-auto flex min-h-[calc(100vh-48px)] w-full max-w-[1180px] flex-col justify-center gap-5 px-4 py-5 md:px-6">
        <header className="rounded-[36px] border border-cyan-300/20 bg-[linear-gradient(135deg,rgba(20,32,88,.96),rgba(7,12,35,.98))] p-7 text-center shadow-[0_30px_120px_rgba(0,0,0,.5)]">
          <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-cyan-200">
            Modo Foco
          </span>

          <h1 className="mt-5 text-5xl font-black tracking-tight text-white md:text-7xl">
            {formatTime(seconds)}
          </h1>

          <p className="mt-3 text-sm text-slate-400">
            {running ? "Sessao em andamento" : "Sessao pausada"}
          </p>

          <div className="mx-auto mt-6 max-w-3xl rounded-[30px] border border-white/10 bg-white/[0.045] p-5">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">
              Tarefa atual
            </p>

            <h2 className="mt-3 text-3xl font-black text-white">
              {atual.titulo}
            </h2>

            <p className="mt-2 text-slate-300">
              {atual.materia} - {atual.topico}
            </p>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className="cp-os-badge-blue">{atual.tipo}</span>
              <span className="cp-os-badge-purple">{atual.prioridade}</span>
              <span className="cp-os-badge">{atual.minutos}min</span>

              <span className="rounded-full border border-cyan-300/25 bg-cyan-400/10 px-3 py-1 text-xs font-black text-cyan-100">
                {String(atual?.motivo || "").includes("erro") || String(atual?.tipo || "").toLowerCase().includes("correcao") ? "Erros detectados" : String(atual?.tipo || "").toLowerCase().includes("revisao") ? "Revisao ativa" : "Estudo guiado"}
              </span>
            </div>

            <div className="mt-5 rounded-[24px] border border-cyan-300/15 bg-cyan-400/10 p-4 text-left">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">
                Orientacao da Lyra
              </p>

              <h3 className="mt-2 text-lg font-black text-white">
                {String(atual?.motivo || "").includes("erro") || String(atual?.tipo || "").toLowerCase().includes("correcao") ? "Missao de correcao" : String(atual?.tipo || "").toLowerCase().includes("revisao") ? "Missao de memoria" : "Missao de estudo"}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                {String(atual?.motivo || "").includes("erro") || String(atual?.tipo || "").toLowerCase().includes("correcao") ? "A Lyra colocou esta tarefa no foco porque existem erros recentes neste assunto. Revise o erro, entenda a causa e registre uma anotacao curta antes de concluir." : String(atual?.tipo || "").toLowerCase().includes("revisao") ? "Esta tarefa entrou como revisao. Tente lembrar antes de abrir o material, depois confira e marque os pontos esquecidos." : "Estude o subtopico com foco no essencial, salve uma anotacao e finalize apenas quando conseguir explicar o ponto principal."}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (!running && !startedAt) setStartedAt(Date.now());
                setRunning((value) => !value);
              }}
              className="cp-os-btn-primary"
            >
              {running ? "Pausar" : "Iniciar foco"}
            </button>

            <button type="button" onClick={executarTarefa} className="cp-os-btn-primary">
              Executar tarefa
            </button>

            <button type="button" onClick={abrirMaterial} className="cp-os-btn-soft">
              Abrir material
            </button>

            <button type="button" onClick={concluirSessao} className="cp-os-btn-focus">
              Concluir sessao
            </button>

            <button type="button" onClick={() => router.push("/dashboard")} className="cp-os-btn-soft">
              Dashboard
            </button>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-300">Progresso do dia</span>
              <strong className="text-cyan-200">{progresso}%</strong>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                style={{ width: `${progresso}%` }}
              />
            </div>

            <p className="mt-3 text-sm text-slate-400">
              {concluidas.length}/{tasks.length} tarefas concluidas
            </p>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5">
            <span className="cp-os-badge-purple">Nota da sessao</span>

            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="mt-3 min-h-[110px] w-full rounded-2xl border border-white/10 bg-[#07111f] p-4 text-sm text-white outline-none focus:border-cyan-300/50"
              placeholder="Anote como foi a sessao..."
            />
          </div>
        </section>

        {doneModal ? (
          <div className="cp-os-modal-backdrop">
            <section className="cp-os-modal max-w-[620px] text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-[24px] bg-emerald-400/15 text-2xl font-black text-emerald-100">
                OK
              </div>

              <h2 className="mt-5 text-3xl font-black text-white">
                Sessao concluida
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-300">
                O plano do dia foi atualizado e seu progresso foi registrado.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[22px] border border-white/10 bg-white/[0.055] p-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">XP</p>
                  <strong className="mt-1 block text-2xl text-cyan-200">+40</strong>
                </div>

                <div className="rounded-[22px] border border-white/10 bg-white/[0.055] p-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Nivel</p>
                  <strong className="mt-1 block text-2xl text-white">{xpInfo?.nivel || 1}</strong>
                </div>

                <div className="rounded-[22px] border border-white/10 bg-white/[0.055] p-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Sequencia</p>
                  <strong className="mt-1 block text-2xl text-emerald-200">{xpInfo?.streak || 0}</strong>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button type="button" onClick={continuarFluxo} className="cp-os-btn-primary">
                  Continuar fluxo
                </button>

                <button type="button" onClick={() => router.push("/dashboard")} className="cp-os-btn-soft">
                  Dashboard
                </button>
              </div>
            </section>
          </div>
        ) : null}
      </section>
    </main>
  );
}


