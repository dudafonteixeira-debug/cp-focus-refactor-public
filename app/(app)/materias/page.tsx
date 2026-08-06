"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { loadAppData, saveAppData } from "@/lib/app-storage";

type Subtopico = {
  id: string;
  nome: string;
};

type Topico = {
  id: string;
  nome: string;
  subtopicos?: Subtopico[];
};

type Materia = {
  id: string;
  nome: string;
  icone?: string;
  topicos?: Topico[];
  ultimaAtividade?: string;
};

type AppData = {
  materias?: Materia[];
  [key: string]: unknown;
};

const ICONES = ["⚖️", "📜", "🧮", "🌎", "🧠", "🛡️", "📚", "✏️", "🔬", "💼", "🧾", "📘"];

function uid() {
  return Date.now().toString() + "_" + Math.random().toString(36).slice(2, 9);
}

function arr<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : [];
}

function nowIso() {
  return new Date().toISOString();
}

function formatTempoRelativo(iso?: string) {
  if (!iso) return "Sem atividade";

  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);

  if (min < 1) return "Último estudo agora";
  if (min < 60) return "Último estudo há " + min + " min";
  if (h < 24) return "Último estudo há " + h + " hora" + (h > 1 ? "s" : "");
  return "Último estudo há " + d + " dia" + (d > 1 ? "s" : "");
}

function contarSubtopicos(topicos?: Topico[]) {
  return arr(topicos).reduce((acc, topico) => acc + arr(topico.subtopicos).length, 0);
}

function previewMateria(materia: Materia) {
  const topicos = arr(materia.topicos);
  if (!topicos.length) return "Nenhum tópico criado ainda.";

  const nomesTopicos = topicos.slice(0, 2).map((item) => item.nome).filter(Boolean);
  const nomesSubs = topicos
    .flatMap((topico) => arr(topico.subtopicos))
    .slice(0, 2)
    .map((item) => item.nome)
    .filter(Boolean);

  const partes: string[] = [];

  if (nomesTopicos.length) {
    partes.push("Tópicos: " + nomesTopicos.join(" • "));
  }

  if (nomesSubs.length) {
    partes.push("Subtópicos: " + nomesSubs.join(" • "));
  }

  return partes.join("  |  ");
}

export default function MateriasPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [app, setApp] = useState<AppData>({ materias: [] });
  const [busca, setBusca] = useState("");
  const [novaMateria, setNovaMateria] = useState("");
  const [iconeSelecionado, setIconeSelecionado] = useState("📘");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [status, setStatus] = useState("📘");

  useEffect(() => {
    const data = (loadAppData() || {}) as AppData;
    setApp({
      ...data,
      materias: arr<Materia>(data.materias),
    });
    setMounted(true);
  }, []);

  function persist(novo: AppData) {
    setApp(novo);
    saveAppData(novo);
  }

  const materiasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const materias = arr<Materia>(app.materias);

    if (!termo) return materias;

    return materias.filter((materia) => {
      if (materia.nome.toLowerCase().includes(termo)) return true;

      return arr<Topico>(materia.topicos).some((topico) => {
        if (topico.nome.toLowerCase().includes(termo)) return true;

        return arr<Subtopico>(topico.subtopicos).some((subtopico) =>
          subtopico.nome.toLowerCase().includes(termo)
        );
      });
    });
  }, [app, busca]);

  function criarMateria() {
    const nome = novaMateria.trim();
    if (!nome) return;

    const materia: Materia = {
      id: uid(),
      nome,
      icone: iconeSelecionado,
      topicos: [],
      ultimaAtividade: nowIso(),
    };

    const novo = {
      ...app,
      materias: [...arr<Materia>(app.materias), materia],
    };

    persist(novo);
    setNovaMateria("");
    setIconeSelecionado("📘");
    setPickerOpen(false);
    setStatus("Matéria criada.");
  }

  function editarMateria(materia: Materia) {
    const nome = window.prompt("Novo nome da matéria:", materia.nome);
    if (!nome || !nome.trim()) return;

    const icone = window.prompt("Novo desenho da matéria:", materia.icone || "📘");

    const novo = {
      ...app,
      materias: arr<Materia>(app.materias).map((item) =>
        item.id !== materia.id
          ? item
          : {
              ...item,
              nome: nome.trim(),
              icone: icone && icone.trim() ? icone.trim() : item.icone,
              ultimaAtividade: nowIso(),
            }
      ),
    };

    persist(novo);
    setStatus("Matéria editada.");
  }

  function excluirMateria(materiaId: string) {
    const confirmar = window.confirm("Deseja excluir esta matéria?");
    if (!confirmar) return;

    const novo = {
      ...app,
      materias: arr<Materia>(app.materias).filter((materia) => materia.id !== materiaId),
    };

    persist(novo);
    setStatus("Matéria excluída.");
  }

  if (!mounted) {
    return <div className="p-6 text-white">Carregando Centro de Estudos...</div>;
  }

  return (
    <div
      className="materiasPremiumRoot min-h-screen text-white"
      style={{
        background:
          "radial-gradient(circle at 18% 0%, rgba(92,109,255,0.24), transparent 24%), radial-gradient(circle at 82% 8%, rgba(68,196,255,0.18), transparent 20%), linear-gradient(180deg, #071028 0%, #091231 42%, #071028 100%)",
      }}
    >
      <div className="w-full max-w-none px-4 py-6 md:px-6">
        <div
          className="materiasPremiumPanel overflow-hidden rounded-[34px] border border-white/10 shadow-2xl shadow-black/30"
          style={{
            borderColor: "rgba(116,136,255,0.30)",
            background: "linear-gradient(180deg, rgba(10,18,54,0.94) 0%, rgba(8,13,40,0.96) 100%)",
            boxShadow: "0 16px 80px rgba(8,12,36,0.55)",
          }}
        >
          <div
            className="materiasTopbar border-b px-5 py-4 md:px-8"
            style={{ borderColor: "rgba(117,127,205,0.20)" }}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-full"
                  style={{
                    background: "radial-gradient(circle at 30% 30%, #3ee0ff, #3b5dff 70%, #111a5c 100%)",
                    boxShadow: "0 0 24px rgba(59,93,255,0.45)",
                  }}
                >
                  <span className="text-lg font-extrabold">◥</span>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-[0.26em] text-[#97A7E3]">CP Focus</div>
                  <div className="text-2xl font-extrabold tracking-tight">Centro de Estudos</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-[#DFE7FF]">
                <div className="rounded-full border px-4 py-2" style={{ borderColor: "rgba(180,192,255,0.18)" }}>
                  💎 Nível 12
                </div>
                <div className="rounded-full border px-4 py-2" style={{ borderColor: "rgba(180,192,255,0.18)" }}>
                  🔥 5 Dias de Foco
                </div>
              </div>
            </div>
          </div>

          <main className="px-5 py-5 md:px-8 md:py-6">
            <div className="materiasHeroGrid grid gap-6 xl:grid-cols-[minmax(0,1fr)_520px] xl:items-start">
              <div className="min-w-0">
                <h1 className="materiasHeroTitle">Centro de Estudos</h1>
                <p className="mt-4 max-w-3xl text-lg text-[#C5CFF9] md:text-2xl">
                  Organize matérias, tópicos e subtópicos em um fluxo simples para continuar estudando sem se perder.
                </p>
              </div>

              <div className="w-full max-w-[620px] space-y-3">
                <div
                  className="materiaSearch premiumInput flex items-center gap-3 rounded-2xl border px-4 py-3"
                  style={{
                    borderColor: "rgba(126,140,255,0.45)",
                    background: "rgba(24,24,70,0.35)",
                    boxShadow: "0 0 30px rgba(90,100,255,0.14)",
                  }}
                >
                  <span className="text-xl">🔎</span>
                  <input
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Buscar matéria, tópico ou subtópico..."
                    className="w-full bg-transparent text-base outline-none placeholder:text-[#A7B4ED] md:text-lg"
                  />
                </div>

                <div
                  className="materiaCreator premiumCreator rounded-[22px] border p-3"
                  style={{
                    borderColor: "rgba(126,140,255,0.24)",
                    background: "rgba(17,24,77,0.55)",
                  }}
                >
                  <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                    <input
                      value={novaMateria}
                      onChange={(e) => setNovaMateria(e.target.value)}
                      placeholder="Nova matéria"
                      className="rounded-2xl border px-4 py-3 text-sm outline-none placeholder:text-[#95A7E9] md:text-base"
                      style={{
                        borderColor: "rgba(126,140,255,0.30)",
                        background: "rgba(19,23,67,0.45)",
                      }}
                    />

                    <button
                      type="button"
                      onClick={criarMateria}
                      className="rounded-2xl border px-5 py-3 text-sm font-extrabold"
                      style={{
                        borderColor: "rgba(131,170,255,0.60)",
                        background: "linear-gradient(180deg, rgba(67,114,255,0.30), rgba(48,77,199,0.30))",
                      }}
                    >
                      + Nova Matéria
                    </button>
                  </div>

                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => setPickerOpen((prev) => !prev)}
                      className="flex w-full items-center justify-between rounded-[18px] border px-4 py-3 text-sm"
                      style={{
                        borderColor: "rgba(126,140,255,0.24)",
                        background: "rgba(13,19,54,0.46)",
                      }}
                    >
                      <span>Desenho da matéria: {iconeSelecionado}</span>
                      <span>{pickerOpen ? "▴" : "▾"}</span>
                    </button>

                    {pickerOpen ? (
                      <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-6">
                        {ICONES.map((icone) => {
                          const ativo = iconeSelecionado === icone;

                          return (
                            <button
                              key={icone}
                              type="button"
                              onClick={() => setIconeSelecionado(icone)}
                              className="flex h-14 items-center justify-center rounded-[18px] border text-2xl transition hover:-translate-y-[1px]"
                              style={{
                                borderColor: ativo ? "rgba(131,170,255,0.68)" : "rgba(126,140,255,0.22)",
                                background: ativo
                                  ? "linear-gradient(180deg, rgba(74,113,255,0.30), rgba(41,69,172,0.32))"
                                  : "rgba(13,19,54,0.46)",
                                boxShadow: ativo ? "0 0 24px rgba(83,110,255,0.18)" : "none",
                              }}
                            >
                              {icone}
                            </button>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            {status ? (
              <div
                className="hidden"
                style={{
                  borderColor: "rgba(82,184,162,0.28)",
                  background: "rgba(21,101,85,0.18)",
                }}
              >
                {status}
              </div>
            ) : null}

            <div className="materiasGrid mt-4 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {materiasFiltradas.length ? (
                materiasFiltradas.map((materia) => {
                  const topicos = arr(materia.topicos);
                  const qtdSubs = contarSubtopicos(materia.topicos);

                  return (
                    <div
                      key={materia.id}
                      onClick={() => router.push("/materias/" + materia.id)}
                      className="cursor-pointer rounded-[22px] border px-4 py-3 transition duration-300 hover:-translate-y-[3px] hover:shadow-[0_20px_50px_rgba(0,0,0,0.35)] hover:border-violet-400/40 hover:bg-white/[0.03]"
                      style={{
                        borderColor: "rgba(126,140,255,0.24)",
                        background: "linear-gradient(180deg, rgba(16,23,70,0.95) 0%, rgba(10,15,46,0.98) 100%)",
                        boxShadow: "0 12px 32px rgba(8,12,36,0.30)",
                      }}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className="flex h-10 w-10 items-center justify-center rounded-[16px] border text-xl"
                              style={{
                                borderColor: "rgba(138,161,255,0.30)",
                                background: "linear-gradient(180deg, rgba(79,109,255,0.26), rgba(34,54,128,0.32))",
                                boxShadow: "0 0 30px rgba(72,102,255,0.18)",
                              }}
                            >
                              {materia.icone || "📘"}
                            </div>

                            <div className="min-w-0">
                              <div className="truncate text-2xl font-extrabold tracking-tight">
                                {materia.nome}
                              </div>
                              <div className="mt-1 text-sm text-[#A9B9F4]">
                                {formatTempoRelativo(materia.ultimaAtividade)}
                              </div>
                            </div>
                          </div>

                          <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-[#DCE5FF]">
                            <span
                              className="rounded-full border px-2.5 py-1 text-[11px]"
                              style={{ borderColor: "rgba(122,141,255,0.18)" }}
                            >
                              {topicos.length} tópico{topicos.length === 1 ? "" : "s"}
                            </span>
                            <span
                              className="rounded-full border px-2.5 py-1 text-[11px]"
                              style={{ borderColor: "rgba(122,141,255,0.18)" }}
                            >
                              {qtdSubs} subtópico{qtdSubs === 1 ? "" : "s"}
                            </span>
                          </div>
                        </div>

                        <div
                          className="flex shrink-0 items-center gap-2">
                          <span
                            className="rounded-full border border-violet-300/35 bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-1.5 text-[11px] font-black text-white shadow-lg shadow-violet-950/30"
                          >
                            Abrir
                          </span>
                        </div>

                        <div
                          className="flex shrink-0 items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => editarMateria(materia)}
                            className="rounded-full border px-2.5 py-1 text-[11px] opacity-35 hover:opacity-100"
                            style={{ borderColor: "rgba(181,193,255,0.18)" }}
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() => excluirMateria(materia.id)}
                            className="rounded-full border px-2.5 py-1 text-[11px] opacity-35 hover:opacity-100"
                            style={{ borderColor: "rgba(255,142,142,0.20)" }}
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div
                  className="md:col-span-2 2xl:col-span-3 rounded-[28px] border p-5 text-center"
                  style={{
                    borderColor: "rgba(126,140,255,0.20)",
                    background: "rgba(14,19,58,0.84)",
                  }}
                >
                  <div className="text-2xl font-bold">Nenhuma matéria encontrada</div>
                  <div className="mt-2 text-[#A9B9F4]">
                    Crie uma nova matéria ou ajuste sua busca.
                  </div>
                </div>
              )}
            </div>
          
      <style jsx global>{`
        .materiasGrid {
          grid-template-columns: repeat(auto-fit, minmax(430px, 1fr)) !important;
          gap: 14px !important;
          margin-top: 18px !important;
        }

        .materiaCard {
          min-height: 148px !important;
          padding: 16px !important;
          border-radius: 24px !important;
          background: linear-gradient(180deg, rgba(18, 28, 78, .82), rgba(8, 14, 44, .96)) !important;
          border-color: rgba(255, 255, 255, .10) !important;
          box-shadow: 0 12px 34px rgba(0, 0, 0, .22) !important;
        }

        .materiaCard:hover {
          transform: translateY(-4px) scale(1.005) !important;
          border-color: rgba(139, 92, 246, .45) !important;
          background: linear-gradient(180deg, rgba(24, 35, 96, .92), rgba(10, 16, 50, .98)) !important;
        }

        .materiaCard [class*="line-clamp"] {
          max-width: 100% !important;
          opacity: .72 !important;
        }

        .materiaCreator {
          max-width: 620px !important;
          padding: 12px !important;
          background: rgba(12, 20, 58, .62) !important;
          border-color: rgba(255, 255, 255, .10) !important;
        }

        .materiaSearch {
          max-width: 620px !important;
          background: rgba(9, 14, 38, .70) !important;
          border-color: rgba(139, 92, 246, .30) !important;
        }
      `}</style>
          
      <style jsx global>{`
        .materiasPremiumRoot {
          background:
            radial-gradient(circle at 14% 0%, rgba(139,92,246,.22), transparent 30%),
            radial-gradient(circle at 86% 10%, rgba(37,99,235,.16), transparent 32%),
            linear-gradient(180deg, #050816 0%, #07111f 56%, #020617 100%) !important;
        }

        .materiasPremiumPanel {
          background:
            linear-gradient(135deg, rgba(15,23,42,.94), rgba(8,13,35,.98) 55%, rgba(35,18,67,.80)) !important;
          border: 1px solid rgba(255,255,255,.10) !important;
          box-shadow: 0 30px 100px rgba(0,0,0,.38) !important;
        }

        .materiasTopbar {
          display: none !important;
        }

        .materiasHeroGrid {
          min-height: 220px;
          padding-top: 14px;
          padding-bottom: 8px;
        }

        .materiasHeroTitle {
          max-width: 760px;
          font-size: clamp(2.8rem, 4.4vw, 4.9rem);
          line-height: .9;
          letter-spacing: -0.07em;
          font-weight: 950;
          color: #ffffff;
        }

        .materiasHeroSubtitle {
          max-width: 680px !important;
          margin-top: 22px !important;
          color: rgba(203,213,225,.82) !important;
          font-size: 1.05rem !important;
          line-height: 1.75 !important;
        }

        .premiumInput,
        .premiumCreator {
          width: 100% !important;
          max-width: none !important;
          background: rgba(15,23,42,.70) !important;
          border: 1px solid rgba(148,163,184,.16) !important;
          box-shadow: 0 18px 60px rgba(0,0,0,.30), inset 0 1px 0 rgba(255,255,255,.04) !important;
          backdrop-filter: blur(18px);
        }

        .materiaCreator {
          padding: 14px !important;
          border-radius: 26px !important;
        }

        .materiasGrid {
          margin-top: 18px !important;
          display: grid !important;
          grid-template-columns: repeat(auto-fit, minmax(460px, 1fr)) !important;
          gap: 16px !important;
        }

        .materiaCard {
          min-height: 112px !important;
          padding: 18px !important;
          border-radius: 26px !important;
          background:
            linear-gradient(180deg, rgba(15,23,42,.76), rgba(8,14,38,.96)) !important;
          border: 1px solid rgba(148,163,184,.18) !important;
          box-shadow: 0 22px 70px rgba(0,0,0,.38), 0 0 0 1px rgba(139,92,246,.08), inset 0 1px 0 rgba(255,255,255,.05) !important;
          backdrop-filter: blur(18px);
        }

        .materiaCard:hover {
          transform: translateY(-4px) scale(1.005) !important;
          border-color: rgba(139,92,246,.62) !important; box-shadow: 0 26px 80px rgba(0,0,0,.45), 0 0 42px rgba(139,92,246,.16) !important;
          background:
            linear-gradient(180deg, rgba(28,38,92,.86), rgba(10,16,44,.98)) !important;
        }

        .materiaCard h2,
        .materiaCard .text-\\[24px\\],
        .materiaCard .text-\\[26px\\] {
          font-size: 1.55rem !important;
          line-height: 1.15 !important;
          letter-spacing: -0.035em !important;
          white-space: normal !important;
          overflow: visible !important;
          text-overflow: unset !important;
        }

        .materiaCard button {
          opacity: .42;
        }

        .materiaCard:hover button {
          opacity: 1;
        }

        .materiaCard span:has(+ span),
        .materiaCard .rounded-full {
          border-color: rgba(255,255,255,.10) !important;
          background: rgba(255,255,255,.045) !important;
        }

        @media (max-width: 900px) {
          .materiasHeroGrid {
            grid-template-columns: 1fr !important;
          }

          .materiasGrid {
            grid-template-columns: 1fr !important;
          }

          .materiasHeroTitle {
            font-size: 3rem !important;
          }
        }
      `}</style>
          </main>
        </div>
      </div>
    </div>
  );
}
