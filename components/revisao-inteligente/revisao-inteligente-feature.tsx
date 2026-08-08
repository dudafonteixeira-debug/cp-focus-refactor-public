"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { finishMission, getMissionRoute } from "@/lib/engine";
import { loadFase2Store, saveFase2Store } from "@/lib/fase2-storage";
import { loadAppData } from "@/lib/app-storage";
import {
  arr,
  gradeColor,
  gradeLabel,
  nextDateByGrade,
  reviewToUi,
  todayIso,
  toText,
  uid,
} from "@/lib/revisao-inteligente/core";
import type { UiReview } from "@/lib/revisao-inteligente/types";

export function RevisaoInteligenteFeature() {
  const router = useRouter();
  // AUTO_START_REVIEW_FROM_DASHBOARD
  useEffect(() => {
    const url = new URL(window.location.href);

    if (url.searchParams.get("auto") === "true") {
      setTimeout(() => {
        const revisarBtn = Array.from(document.querySelectorAll("button")).find((btn) =>
          btn.textContent?.toLowerCase().includes("revisar agora")
        ) as HTMLButtonElement | undefined;

        if (revisarBtn) {
          revisarBtn.click();
        }
      }, 500);
    }
  }, []);

  const [store, setStore] = useState<any>(null);
  const [appData, setAppData] = useState<any>(null);
  const [tab, setTab] = useState<"fila" | "concluidas" | "estatisticas">("fila");
  const [visual, setVisual] = useState<"lista" | "cards">("lista");
  const [materiaFiltro, setMateriaFiltro] = useState("Todas");
  const [topicoFiltro, setTopicoFiltro] = useState("Todos");
  const [ordem, setOrdem] = useState("Prioridade");
  const [aberta, setAberta] = useState<UiReview | null>(null);
  const [lembranca, setLembranca] = useState("");
  const [mostrarConteudo, setMostrarConteudo] = useState(false);
  const [manualAberto, setManualAberto] = useState(false);
  const [manualTitulo, setManualTitulo] = useState("");
  const [manualTexto, setManualTexto] = useState("");
  const [manualMateria, setManualMateria] = useState("");
  const [manualTopico, setManualTopico] = useState("");
  const [manualSubtopico, setManualSubtopico] = useState("");
  const [segundos, setSegundos] = useState(25 * 60);
  const [rodando, setRodando] = useState(false);

  function carregar() {
    setStore(loadFase2Store());
    setAppData(loadAppData());
  }

  useEffect(() => {
    carregar();
  }, []);

  useEffect(() => {
    if (!rodando) return;
    const timer = window.setInterval(() => {
      setSegundos((s) => (s > 0 ? s - 1 : 25 * 60));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [rodando]);

  const reviews = arr(store?.reviews);
  const sessions = arr(store?.sessions);

  const fila = useMemo(() => {
    let lista = reviews
      .filter((item: any) => !item.ultimaRespostaEm && String(item.proximaRevisaoEm || todayIso()) <= todayIso())
      .map(reviewToUi);

    if (materiaFiltro !== "Todas") lista = lista.filter((r) => r.materia === materiaFiltro);
    if (topicoFiltro !== "Todos") lista = lista.filter((r) => r.topico === topicoFiltro);

    if (ordem === "Dificuldade") lista = lista.sort((a, b) => b.erros - a.erros);
    if (ordem === "Prazo") lista = lista.sort((a, b) => a.proxima.localeCompare(b.proxima));

    return lista;
  }, [reviews, materiaFiltro, topicoFiltro, ordem]);

  const concluidas = useMemo(() => {
    return reviews
      .filter((item: any) => item.ultimaRespostaEm)
      .sort((a: any, b: any) => String(b.ultimaRespostaEm).localeCompare(String(a.ultimaRespostaEm)))
      .map(reviewToUi);
  }, [reviews]);

  const materias = useMemo(() => {
    return Array.from(new Set(reviews.map((r: any) => r.materiaNome || "Sem materia")));
  }, [reviews]);

  const topicos = useMemo(() => {
    return Array.from(
      new Set(
        reviews
          .filter((r: any) => materiaFiltro === "Todas" || (r.materiaNome || "Sem materia") === materiaFiltro)
          .map((r: any) => r.topicoNome || "Sem topico")
      )
    );
  }, [reviews, materiaFiltro]);

  const materiasApp = arr(appData?.materias);

  const topicosApp = useMemo(() => {
    const materia = materiasApp.find((m: any) => (m.nome || m.titulo) === manualMateria);
    return arr(materia?.topicos);
  }, [materiasApp, manualMateria]);

  const subtopicosApp = useMemo(() => {
    const topico = topicosApp.find((t: any) => (t.nome || t.titulo) === manualTopico);
    return arr(topico?.subtopicos);
  }, [topicosApp, manualTopico]);

  const lastSessionByReview = useMemo(() => {
    const map: Record<string, any> = {};
    sessions.forEach((s: any) => {
      if (!map[s.reviewItemId] || String(s.respondedAt) > String(map[s.reviewItemId].respondedAt)) {
        map[s.reviewItemId] = s;
      }
    });
    return map;
  }, [sessions]);

  const chartData = useMemo(() => {
    function pad(n: number) {
      return String(n).padStart(2, "0");
    }

    function localKey(date: Date) {
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    }

    function labelData(date: Date) {
      return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}`;
    }

    const nomes = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

    const hoje = new Date();
    const domingo = new Date(hoje);
    domingo.setDate(hoje.getDate() - hoje.getDay());

    const dias = Array.from({ length: 7 }).map((_, index) => {
      const data = new Date(domingo);
      data.setDate(domingo.getDate() + index);
      return data;
    });

    return dias.map((data) => {
      const dia = localKey(data);

      const lista = sessions.filter((s: any) => {
        const respondido = s.respondedAt ? new Date(s.respondedAt) : null;
        if (!respondido) return false;
        return localKey(respondido) === dia;
      });

      return {
        dia,
        label: `${nomes[data.getDay()]} ${labelData(data)}`,
        feitas: lista.length,
        boas: lista.filter((s: any) => Number(s.grade) >= 4).length,
        medias: lista.filter((s: any) => Number(s.grade) === 3).length,
        fracas: lista.filter((s: any) => Number(s.grade) <= 2).length,
      };
    });
  }, [sessions]);

  const maxChart = Math.max(1, ...chartData.map((d) => d.feitas));
  const total = sessions.length;
  const boasTotal = sessions.filter((s: any) => Number(s.grade) >= 4).length;
  const mediasTotal = sessions.filter((s: any) => Number(s.grade) === 3).length;
  const fracasTotal = sessions.filter((s: any) => Number(s.grade) <= 2).length;
  const taxa = total ? Math.round((boasTotal / total) * 100) : 0;
  const sequencia = boasTotal;

  const pontos = chartData.map((d, i) => {
    const x = 40 + i * 90;
    const y = 220 - (d.feitas / maxChart) * 170;
    return `${x},${y}`;
  }).join(" ");

  const area = `40,220 ${pontos} 580,220`;

  const sugestao = useMemo(() => {
    if (fila.length > 0 && taxa < 50) return "Comece pelas revisoes vencidas e refaca os pontos que voce nao lembrou. Hoje o foco deve ser recuperar base.";
    if (fila.length > 0 && taxa < 80) return "Comece pela fila de hoje e priorize os itens com mais erros. Depois revise os topicos de desempenho medio.";
    if (fila.length > 0) return "Sua taxa esta boa. Mantenha a consistencia revisando os itens de hoje antes de estudar conteudo novo.";
    return "Sua fila esta em dia. Salve novos conteudos do Centro de Estudos ou erros do Banco de Erros para manter o ciclo ativo.";
  }, [fila.length, taxa]);

  const conteudosDaRevisao = useMemo(() => {
    if (!aberta) return [];

    const list: { titulo: string; texto: string }[] = [];
    if (aberta.textoBase) list.push({ titulo: "Texto base da revisao", texto: aberta.textoBase });

    const materia = arr(appData?.materias).find((m: any) => String(m.id) === String(aberta.raw.materiaId));
    const topico = arr(materia?.topicos).find((t: any) => String(t.id) === String(aberta.raw.topicoId));
    const sub = arr(topico?.subtopicos).find((s: any) => String(s.id) === String(aberta.raw.subtopicoId));

    arr(sub?.conteudos).forEach((c: any, i: number) => list.push({ titulo: "Conteudo " + (i + 1), texto: toText(c) }));
    arr(sub?.anotacoes).forEach((a: any, i: number) => list.push({ titulo: "Anotacao " + (i + 1), texto: toText(a) }));
    arr(sub?.iaRespostas || sub?.respostasIA || sub?.ia || sub?.blocosIA).forEach((ia: any, i: number) => list.push({ titulo: "IA " + (i + 1), texto: toText(ia) }));

    if (list.length === 0) list.push({ titulo: "Revisao", texto: "Nenhum conteudo detalhado encontrado para esta revisao." });
    return list.filter((x) => x.texto.trim());
  }, [aberta, appData]);

  const minutos = String(Math.floor(segundos / 60)).padStart(2, "0");
  const segundosTexto = String(segundos % 60).padStart(2, "0");
  // AUTO_OPEN_SPECIFIC_REVIEW
  useEffect(() => {
    const params = new URL(window.location.href).searchParams;
    const auto = params.get("auto");
    const reviewId = params.get("reviewId");

    if (auto !== "true") return;
    if (!fila.length) return;

    const alvo = reviewId
      ? fila.find((item) => String(item.id) === String(reviewId))
      : fila[0];

    if (!alvo) return;

    setTab("fila");
    setAberta(alvo);
    setLembranca("");
    setMostrarConteudo(false);
  }, [fila]);


  function salvarStore(next: any) {
    saveFase2Store({ ...next, updatedAt: new Date().toISOString() });
    carregar();
  }

  async function responder(id: string, grade: number) {
    const atual = loadFase2Store();
    const now = new Date().toISOString();

    const reviewsNext = arr(atual.reviews).map((r: any) => {
      if (r.id !== id) return r;
      return {
        ...r,
        ultimaRespostaEm: now,
        atualizadoEm: now,
        proximaRevisaoEm: nextDateByGrade(grade),
        acertos: (r.acertos || 0) + (grade >= 3 ? 1 : 0),
        erros: (r.erros || 0) + (grade <= 2 ? 1 : 0),
        status: "revisao",
      };
    });

    const session = {
      id: "session_" + uid(),
      reviewItemId: id,
      grade,
      respondedAt: now,
    };

    salvarStore({
      ...atual,
      reviews: reviewsNext,
      sessions: [session, ...arr(atual.sessions)],
    });

    setAberta(null);
    setLembranca("");
    setMostrarConteudo(false);

    const missionId = new URL(window.location.href).searchParams.get("missionId");

    if (missionId) {
      const engineResult = await finishMission({
        missionId,
        nota: `Revisao concluida com nota ${grade}/5.`,
      });

      if (engineResult.proxima) {
        router.push(getMissionRoute(engineResult.proxima));
        return;
      }

      router.push("/dashboard");
    }
  }

  function desfazer(id: string) {
    const atual = loadFase2Store();
    salvarStore({
      ...atual,
      reviews: arr(atual.reviews).map((r: any) =>
        r.id === id ? { ...r, ultimaRespostaEm: null, proximaRevisaoEm: todayIso() } : r
      ),
      sessions: arr(atual.sessions).filter((s: any) => s.reviewItemId !== id),
    });
  }

  function excluir(id: string) {
    if (!window.confirm("Excluir esta revisao definitivamente?")) return;
    const atual = loadFase2Store();
    salvarStore({
      ...atual,
      reviews: arr(atual.reviews).filter((r: any) => r.id !== id),
      sessions: arr(atual.sessions).filter((s: any) => s.reviewItemId !== id),
    });
  }

  function criarManual() {
    const materia = materiasApp.find((m: any) => (m.nome || m.titulo) === manualMateria);
    const topico = topicosApp.find((t: any) => (t.nome || t.titulo) === manualTopico);
    const sub = subtopicosApp.find((s: any) => (s.nome || s.titulo) === manualSubtopico);

    const atual = loadFase2Store();
    const now = new Date().toISOString();

    const item = {
      id: "review_" + uid(),
      origemId: sub?.id || topico?.id || materia?.id || "manual",
      origemTipo: sub?.id ? "subtopico" : "conteudo",
      materiaId: materia?.id,
      materiaNome: manualMateria || "Manual",
      topicoId: topico?.id,
      topicoNome: manualTopico || "Manual",
      subtopicoId: sub?.id,
      subtopicoNome: manualSubtopico || "",
      titulo: manualTitulo || manualSubtopico || "Revisao manual",
      textoBase: manualTexto || "Revisao manual criada pelo usuario.",
      tags: ["manual"],
      status: "nova",
      easiness: 2.5,
      intervaloDias: 0,
      repeticoes: 0,
      acertos: 0,
      erros: 0,
      ultimaRespostaEm: null,
      proximaRevisaoEm: todayIso(),
      criadoEm: now,
      atualizadoEm: now,
    };

    salvarStore({ ...atual, reviews: [item, ...arr(atual.reviews)] });
    setManualAberto(false);
    setManualTitulo("");
    setManualTexto("");
    setManualMateria("");
    setManualTopico("");
    setManualSubtopico("");
    setTab("fila");
  }

  function resetar() {
    if (!window.confirm("Resetar todas as revisoes?")) return;
    salvarStore({
      reviews: [],
      sessions: [],
      studyPacks: [],
      weakTopics: [],
      metrics: {
        revisoesHoje: 0,
        revisoesAtrasadas: 0,
        totalReviews: 0,
        acertos: 0,
        erros: 0,
        taxaAcerto: 0,
        sequenciaAcertos: 0,
      },
      updatedAt: new Date().toISOString(),
    });
  }

  if (!store) {
    return <main className="min-h-screen bg-[#060918] p-6 text-white">Carregando revisoes...</main>;
  }

  return (
    <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-[radial-gradient(circle_at_20%_0%,rgba(124,58,237,0.28),transparent_28%),radial-gradient(circle_at_85%_10%,rgba(217,70,239,0.16),transparent_24%),linear-gradient(180deg,#050816_0%,#070b1c_55%,#020617_100%)] px-4 py-6 text-white md:px-8">
      <section className="mx-auto flex w-full max-w-[1480px] flex-col gap-8">
        <header className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.32em] text-fuchsia-200">ðŸŽ¯ Sistema de revisao</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">Revis&atilde;o Inteligente âœ¨</h1>
            <p className="mt-2 text-sm text-slate-300">Revise de forma inteligente e fortale&ccedil;a seus pontos fracos.</p>
          </div>

          <button onClick={() => setManualAberto(true)} className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-black shadow-lg shadow-fuchsia-950/40 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-cyan-950/30 active:scale-[0.98]">
            + Criar manualmente
          </button>
        </header>

        <nav className="grid max-w-3xl gap-2 rounded-[1.6rem] border border-violet-300/20 bg-white/[0.06] p-2 text-sm font-black text-slate-300 shadow-2xl shadow-violet-950/25 md:grid-cols-3">
          <button onClick={() => setTab("fila")} className={`rounded-2xl px-5 py-4 ${tab === "fila" ? "bg-gradient-to-r from-violet-700 to-fuchsia-700 text-white shadow-lg shadow-fuchsia-950/40" : "hover:bg-white/10"}`}>Fila de Revis&atilde;o</button>
          <button onClick={() => setTab("estatisticas")} className={`rounded-2xl px-5 py-4 ${tab === "estatisticas" ? "bg-gradient-to-r from-violet-700 to-fuchsia-700 text-white shadow-lg shadow-fuchsia-950/40" : "hover:bg-white/10"}`}>Estat&iacute;sticas</button>
          <button onClick={() => setTab("concluidas")} className={`rounded-2xl px-5 py-4 ${tab === "concluidas" ? "bg-gradient-to-r from-violet-700 to-fuchsia-700 text-white shadow-lg shadow-fuchsia-950/40" : "hover:bg-white/10"}`}>Conclu&iacute;das</button>
        </nav>

        <section className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_340px] 2xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0 w-full space-y-6">
            {tab === "fila" && (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    ["Itens hoje", fila.length, "Fila ativa"],
                    ["Pendentes", reviews.filter((r: any) => !r.ultimaRespostaEm).length, "A revisar"],
                    ["Total", reviews.length, "Base real"],
                    ["Taxa", taxa + "%", "Desempenho"],
                  ].map((card) => (
                    <div key={card[0]} className="rounded-[1.7rem] border border-violet-300/20 bg-gradient-to-br from-[#12183d]/95 via-[#0b1029]/95 to-violet-950/35 p-6 shadow-xl shadow-violet-950/35">
                      <p className="text-sm text-slate-400">{card[0]}</p>
                      <p className="mt-2 text-3xl font-black">{card[1]}</p>
                      <p className="mt-1 text-xs font-black text-fuchsia-200">{card[2]}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-3xl border border-violet-300/20 bg-white/[0.05] p-4">
                  <div className="grid gap-3 md:grid-cols-4">
                    <select value={ordem} onChange={(e) => setOrdem(e.target.value)} className="h-12 rounded-2xl border border-violet-300/20 bg-[#050816] px-4 text-sm text-white outline-none">
                      <option>Prioridade</option>
                      <option>Dificuldade</option>
                      <option>Prazo</option>
                    </select>

                    <select value={materiaFiltro} onChange={(e) => { setMateriaFiltro(e.target.value); setTopicoFiltro("Todos"); }} className="h-12 rounded-2xl border border-violet-300/20 bg-[#050816] px-4 text-sm text-white outline-none">
                      <option>Todas</option>
                      {materias.map((m) => <option key={m}>{m}</option>)}
                    </select>

                    <select value={topicoFiltro} onChange={(e) => setTopicoFiltro(e.target.value)} className="h-12 rounded-2xl border border-violet-300/20 bg-[#050816] px-4 text-sm text-white outline-none">
                      <option>Todos</option>
                      {topicos.map((t) => <option key={t}>{t}</option>)}
                    </select>

                    <div className="flex h-12 rounded-2xl border border-violet-300/20 bg-[#050816] p-1">
                      <button onClick={() => setVisual("lista")} className={`flex-1 rounded-xl text-sm font-black ${visual === "lista" ? "bg-violet-600 text-white" : "text-slate-400"}`}>Lista</button>
                      <button onClick={() => setVisual("cards")} className={`flex-1 rounded-xl text-sm font-black ${visual === "cards" ? "bg-violet-600 text-white" : "text-slate-400"}`}>Cards</button>
                    </div>
                  </div>
                </div>

                <div className={visual === "cards" ? "grid gap-5 lg:grid-cols-2" : "space-y-5"}>
                  {fila.length === 0 && (
                    <div className="rounded-[2rem] border border-violet-300/20 bg-gradient-to-br from-[#11163a]/95 via-[#0b1029]/95 to-violet-950/25 p-10 text-center shadow-xl shadow-violet-950/30 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:shadow-cyan-950/30">
                      <p className="text-2xl font-black">Nenhuma revis&atilde;o pendente hoje</p>
                      <p className="mt-2 text-sm text-slate-400">Salve itens do Centro de Estudos ou Banco de Erros para aparecerem aqui.</p>
                    </div>
                  )}

                  {fila.map((item) => (
                    <article key={item.id} className={`rounded-[1.8rem] border border-violet-300/20 bg-gradient-to-br from-[#11163a]/95 via-[#0b1029]/95 to-violet-950/25 p-6 shadow-xl shadow-violet-950/30 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:shadow-cyan-950/30 ${visual === "lista" ? "flex flex-col gap-4 xl:flex-row xl:items-center" : "space-y-4"}`}>
                      <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-indigo-600 text-2xl font-black shadow-lg shadow-fuchsia-950/40">ðŸ“˜</div>
                      <div className="min-w-0 flex-1">
                        <h2 className="break-words text-xl font-black">{item.materia}</h2>
                        <p className="mt-1 text-sm text-slate-300">{item.topico}</p>
                        {item.subtopico && <p className="mt-1 text-xs text-fuchsia-200">{item.subtopico}</p>}
                        <p className="mt-2 text-xs text-slate-500">{item.titulo}</p>
                      </div>
                      <div className="rounded-2xl border border-violet-300/20 bg-white/[0.06] p-4 xl:w-[160px]">
                        <p className="text-xs text-slate-400">Erros</p>
                        <p className="text-2xl font-black text-rose-300">{item.erros}</p>
                      </div>
                      <div className="flex w-full flex-col gap-2 xl:w-[180px]">
                        <button onClick={() => { setAberta(item); setLembranca(""); setMostrarConteudo(false); }} className="h-12 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-sm font-black shadow-lg shadow-fuchsia-950/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-cyan-950/30 active:scale-[0.98]">Revisar agora</button>
                        <button onClick={() => excluir(item.id)} className="h-10 rounded-2xl border border-rose-300/30 bg-rose-500/10 text-xs font-black text-rose-100">Excluir</button>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}

            {tab === "estatisticas" && (
              <div className="space-y-6 w-full max-w-full overflow-x-hidden">
                <div className="rounded-[2rem] border border-violet-300/25 bg-gradient-to-br from-[#0b1029] via-[#11163a] to-[#1a0b2e] p-7 shadow-2xl shadow-fuchsia-950/35">
                  <div className="flex justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-black">Evolu&ccedil;&atilde;o das revis&otilde;es</h2>
                      <p className="mt-1 text-sm text-slate-400">&Uacute;ltimos 7 dias</p>
                    </div>
                    <span className="rounded-2xl border border-fuchsia-300/20 bg-fuchsia-500/10 px-4 py-2 text-sm font-black text-fuchsia-100">{total} respostas</span>
                  </div>

                  <svg viewBox="0 0 620 250" className="mt-6 h-[290px] w-full">
                    <defs>
                      <linearGradient id="areaGrad" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#a855f7" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#a855f7" stopOpacity="0.03" />
                      </linearGradient>
                    </defs>
                    {[0, 1, 2, 3, 4].map((i) => (
                      <line key={i} x1="40" x2="580" y1={50 + i * 42} y2={50 + i * 42} stroke="rgba(255,255,255,.08)" />
                    ))}
                    <polygon points={area} fill="url(#areaGrad)" />
                    <polyline points={pontos} fill="none" stroke="#a855f7" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    {chartData.map((d, i) => {
                      const x = 40 + i * 90;
                      const y = 220 - (d.feitas / maxChart) * 170;
                      return (
                        <g key={d.dia}>
                          <circle cx={x} cy={y} r="7" fill="#d8b4fe" stroke="#7c3aed" strokeWidth="4" />
                          <text x={x} y={y - 18} textAnchor="middle" fill="#f0abfc" fontSize="14" fontWeight="800">{d.feitas}</text>
                          <text x={x} y="244" textAnchor="middle" fill="#94a3b8" fontSize="12">{d.label}</text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                <div className="rounded-[2rem] border border-violet-300/20 bg-gradient-to-br from-[#11163a]/95 via-[#0b1029]/95 to-violet-950/25 p-6 shadow-2xl shadow-violet-950/30">
                  <h2 className="text-xl font-black">Revis&otilde;es por dia</h2>
                  <div className="mt-6 flex max-w-full gap-4 overflow-x-auto pb-3 pr-2 scroll-smooth snap-x snap-mandatory [scrollbar-width:thin] [scrollbar-color:#22d3ee_transparent]">
                    {chartData.map((d) => {
                      const perc = d.feitas ? Math.round((d.boas / d.feitas) * 100) : 0;
                      return (
                        <div key={d.dia} className="rounded-3xl border border-violet-300/20 bg-[#0b1029]/80 p-4 text-center">
                          <p className="text-2xl font-black">{d.feitas}</p>
                          <div className={`mx-auto mt-3 grid h-16 w-16 place-items-center rounded-full border-[8px] bg-[#060918] transition-all duration-300 ${d.dia === todayIso() ? "border-cyan-300 shadow-[0_0_25px_rgba(34,211,238,0.45)]" : "border-fuchsia-500"}`}>
                            <span className="text-xs font-black">{perc}%</span>
                          </div>
                          <p className="mt-3 text-xs text-slate-400">{d.label}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {tab === "concluidas" && (
              <div className="space-y-5">
                {concluidas.length === 0 && <div className="rounded-[2rem] border border-violet-300/20 bg-gradient-to-br from-[#11163a]/95 via-[#0b1029]/95 to-violet-950/25 p-10 text-center shadow-xl shadow-violet-950/30 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:shadow-cyan-950/30">Nenhuma revis&atilde;o conclu&iacute;da.</div>}
                {concluidas.map((item) => {
                  const session = lastSessionByReview[item.id];
                  const grade = Number(session?.grade || 0);
                  return (
                    <article key={item.id} className="rounded-3xl border border-violet-300/20 bg-gradient-to-br from-[#11163a]/95 to-emerald-950/20 p-5">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <h2 className="text-xl font-black">{item.materia}</h2>
                          <p className="text-sm text-slate-300">{item.topico}</p>
                          <p className="mt-2 text-xs text-slate-500">{session?.respondedAt ? new Date(session.respondedAt).toLocaleString() : ""}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className={`rounded-xl border px-4 py-2 text-xs font-black ${gradeColor(grade)}`}>{gradeLabel(grade)}</span>
                          <button onClick={() => desfazer(item.id)} className="rounded-xl border border-amber-300/30 bg-amber-500/10 px-4 py-2 text-xs font-black text-amber-100">Desfazer</button>
                          <button onClick={() => excluir(item.id)} className="rounded-xl border border-rose-300/30 bg-rose-500/10 px-4 py-2 text-xs font-black text-rose-100">Excluir</button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          <aside className="min-w-0 w-full space-y-6 xl:sticky xl:top-6 xl:self-start xl:pl-4 2xl:pl-6">
            <section className="rounded-[2rem] border border-violet-300/20 bg-gradient-to-br from-[#11163a]/95 via-[#0b1029]/95 to-violet-950/25 p-6 backdrop-blur-xl shadow-2xl shadow-violet-950/30">
              <h2 className="text-lg font-black">Resumo r&aacute;pido</h2>
              <div className="mt-5 space-y-3">
                <div className="rounded-2xl bg-white/[0.06] p-4"><p className="text-2xl font-black">{total}</p><p className="text-xs text-slate-400">Total de revis&otilde;es</p></div>
                <div className="rounded-2xl bg-white/[0.06] p-4"><p className="text-2xl font-black text-lime-300">{taxa}%</p><p className="text-xs text-slate-400">Taxa de acertos</p></div>
                <div className="rounded-2xl bg-white/[0.06] p-4"><p className="text-2xl font-black text-amber-300">{sequencia}</p><p className="text-xs text-slate-400">Sequ&ecirc;ncia</p></div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-violet-300/20 bg-gradient-to-br from-[#11163a]/95 via-[#0b1029]/95 to-violet-950/25 p-6 backdrop-blur-xl shadow-2xl shadow-violet-950/30">
              <h2 className="text-lg font-black">Revis&otilde;es por desempenho</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-[140px_1fr]">
                <div className="grid h-32 w-32 place-items-center rounded-full border-[18px] border-rose-400 bg-[#060918]">
                  <div className="text-center"><p className="text-2xl font-black">{total}</p><p className="text-xs text-slate-400">Total</p></div>
                </div>
                <div className="space-y-3 text-sm">
                  <p><span className="text-emerald-300">â—</span> Boas/F&aacute;ceis: {boasTotal}</p>
                  <p><span className="text-amber-300">â—</span> M&eacute;dias: {sessions.filter((s: any) => Number(s.grade) === 3).length}</p>
                  <p><span className="text-rose-300">â—</span> Fracas: {sessions.filter((s: any) => Number(s.grade) <= 2).length}</p>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-cyan-300/30 bg-gradient-to-br from-[#082f49]/60 via-[#14183f] to-fuchsia-950/50 p-6 shadow-2xl shadow-fuchsia-950/40 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/30">
              <h2 className="text-lg font-black">âœ¦ IA do CP Focus</h2>
              <p className="mt-4 text-sm leading-7 text-slate-200">{sugestao}</p>
            </section>

            <section className="rounded-[2rem] border border-cyan-300/30 bg-gradient-to-br from-[#082f49]/55 via-[#080d21]/95 to-fuchsia-950/30 p-6 text-center shadow-2xl shadow-fuchsia-950/35">
              <p className="text-sm font-black tracking-widest text-slate-300">FOCO</p>
              <p className="mt-3 text-5xl font-black drop-shadow-[0_0_18px_rgba(217,70,239,0.55)]">{minutos}:{segundosTexto}</p>
              <button onClick={() => setRodando((v) => !v)} className="mt-5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-black">{rodando ? "PAUSAR" : "INICIAR"}</button>
            </section>
          </aside>
        </section>
      </section>

      {aberta && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] border border-violet-300/20 bg-gradient-to-br from-[#11163a] to-violet-950 p-6">
            <div className="flex justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-fuchsia-200">Revis&atilde;o ativa</p>
                <h2 className="mt-2 text-2xl font-black">{aberta.materia}</h2>
                <p className="mt-1 text-sm text-slate-400">{aberta.topico} {aberta.subtopico ? ">" : ""} {aberta.subtopico}</p>
              </div>
              <button onClick={() => setAberta(null)} className="rounded-xl border border-violet-300/20 px-4 py-2 text-sm font-black">Fechar</button>
            </div>

            <div className="mt-6 rounded-2xl border border-violet-300/20 bg-white/[0.06] p-5">
              <p className="text-sm font-black">Antes de ver o conte&uacute;do, escreva o que voc&ecirc; lembra:</p>
              <textarea value={lembranca} onChange={(e) => setLembranca(e.target.value)} className="mt-4 min-h-[130px] w-full rounded-2xl border border-violet-300/20 bg-[#050816] p-4 text-sm text-white outline-none" placeholder="Digite o que voce lembra..." />
              <button onClick={() => setMostrarConteudo(true)} className="mt-4 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-black">Ver conte&uacute;do completo</button>
            </div>

            {mostrarConteudo && (
              <div className="mt-5 space-y-4">
                {conteudosDaRevisao.map((c, i) => (
                  <div key={i} className="rounded-2xl border border-violet-300/20 bg-white/[0.06] p-5">
                    <p className="font-black text-fuchsia-100">{c.titulo}</p>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-300">{c.texto}</p>
                  </div>
                ))}

                <div className="grid gap-3 sm:grid-cols-5">
                  <button onClick={() => responder(aberta.id, 1)} className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-black">Nao lembrei</button>
                  <button onClick={() => responder(aberta.id, 2)} className="rounded-2xl bg-orange-500 px-4 py-3 text-sm font-black">Fraca</button>
                  <button onClick={() => responder(aberta.id, 3)} className="rounded-2xl bg-amber-500 px-4 py-3 text-sm font-black">Media</button>
                  <button onClick={() => responder(aberta.id, 4)} className="rounded-2xl bg-violet-600 px-4 py-3 text-sm font-black">Boa</button>
                  <button onClick={() => responder(aberta.id, 5)} className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black">Facil</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {manualAberto && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-[2rem] border border-violet-300/20 bg-gradient-to-br from-[#11163a] to-violet-950 p-6">
            <div className="flex justify-between gap-4">
              <h2 className="text-2xl font-black">Criar revis&atilde;o manual</h2>
              <button onClick={() => setManualAberto(false)} className="rounded-xl border border-violet-300/20 px-4 py-2 text-sm font-black">Fechar</button>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <select value={manualMateria} onChange={(e) => { setManualMateria(e.target.value); setManualTopico(""); setManualSubtopico(""); }} className="h-12 rounded-2xl border border-violet-300/20 bg-[#050816] px-4 text-sm text-white outline-none">
                <option value="">Materia</option>
                {materiasApp.map((m: any) => <option key={m.id || m.nome}>{m.nome || m.titulo}</option>)}
              </select>
              <select value={manualTopico} onChange={(e) => { setManualTopico(e.target.value); setManualSubtopico(""); }} className="h-12 rounded-2xl border border-violet-300/20 bg-[#050816] px-4 text-sm text-white outline-none">
                <option value="">Topico</option>
                {topicosApp.map((t: any) => <option key={t.id || t.nome}>{t.nome || t.titulo}</option>)}
              </select>
              <select value={manualSubtopico} onChange={(e) => setManualSubtopico(e.target.value)} className="h-12 rounded-2xl border border-violet-300/20 bg-[#050816] px-4 text-sm text-white outline-none">
                <option value="">Subtopico</option>
                {subtopicosApp.map((s: any) => <option key={s.id || s.nome}>{s.nome || s.titulo}</option>)}
              </select>
            </div>

            <input value={manualTitulo} onChange={(e) => setManualTitulo(e.target.value)} className="mt-4 h-12 w-full rounded-2xl border border-violet-300/20 bg-[#050816] px-4 text-sm text-white outline-none" placeholder="Titulo" />
            <textarea value={manualTexto} onChange={(e) => setManualTexto(e.target.value)} className="mt-4 min-h-[130px] w-full rounded-2xl border border-violet-300/20 bg-[#050816] p-4 text-sm text-white outline-none" placeholder="Texto base" />
            <button onClick={criarManual} className="mt-5 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-black">Salvar revis&atilde;o</button>
          </div>
        </div>
      )}
    </main>
  );
}



