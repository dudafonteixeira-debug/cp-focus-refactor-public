"use client";

import { useParams, useRouter } from "next/navigation";
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

export default function MateriaPage() {
  const params = useParams<{ materiaId: string }>();
  const router = useRouter();
  const materiaId = String(params?.materiaId || "");

  const [mounted, setMounted] = useState(false);
  const [app, setApp] = useState<AppData>({ materias: [] });
  const [novoTopico, setNovoTopico] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const data = (loadAppData() || {}) as AppData;
    setApp({
      ...data,
      materias: arr<Materia>(data.materias),
    });
    setMounted(true);
  }, []);

  const materiaAtiva = useMemo(() => {
    return arr<Materia>(app.materias).find((m) => String(m.id) === String(materiaId)) || null;
  }, [app, materiaId]);

  function persist(novo: AppData) {
    setApp(novo);
    saveAppData(novo);
  }

  function criarTopico() {
    const nome = novoTopico.trim();
    if (!nome || !materiaAtiva) return;

    const topico: Topico = {
      id: uid(),
      nome,
      subtopicos: [],
    };

    const novo = {
      ...app,
      materias: arr<Materia>(app.materias).map((m) =>
        String(m.id) !== String(materiaAtiva.id)
          ? m
          : {
              ...m,
              topicos: [...arr(m.topicos), topico],
              ultimaAtividade: nowIso(),
            }
      ),
    };

    persist(novo);
    setNovoTopico("");
    setStatus("Tópico criado.");
  }

  function editarTopico(topico: Topico) {
    if (!materiaAtiva) return;

    const nome = window.prompt("Novo nome do tópico:", topico.nome);
    if (!nome || !nome.trim()) return;

    const novo = {
      ...app,
      materias: arr<Materia>(app.materias).map((m) =>
        String(m.id) !== String(materiaAtiva.id)
          ? m
          : {
              ...m,
              topicos: arr<Topico>(m.topicos).map((t) =>
                String(t.id) !== String(topico.id)
                  ? t
                  : { ...t, nome: nome.trim() }
              ),
              ultimaAtividade: nowIso(),
            }
      ),
    };

    persist(novo);
    setStatus("Tópico editado.");
  }

  function excluirTopico(topicoId: string) {
    if (!materiaAtiva) return;

    const confirmar = window.confirm("Deseja excluir este tópico?");
    if (!confirmar) return;

    const novo = {
      ...app,
      materias: arr<Materia>(app.materias).map((m) =>
        String(m.id) !== String(materiaAtiva.id)
          ? m
          : {
              ...m,
              topicos: arr<Topico>(m.topicos).filter((t) => String(t.id) !== String(topicoId)),
              ultimaAtividade: nowIso(),
            }
      ),
    };

    persist(novo);
    setStatus("Tópico excluído.");
  }

  function editarMateria() {
    if (!materiaAtiva) return;

    const nome = window.prompt("Novo nome da matéria:", materiaAtiva.nome);
    if (!nome || !nome.trim()) return;

    const icone = window.prompt("Novo desenho da matéria:", materiaAtiva.icone || "📘");

    const novo = {
      ...app,
      materias: arr<Materia>(app.materias).map((m) =>
        String(m.id) !== String(materiaAtiva.id)
          ? m
          : {
              ...m,
              nome: nome.trim(),
              icone: icone && icone.trim() ? icone.trim() : m.icone,
              ultimaAtividade: nowIso(),
            }
      ),
    };

    persist(novo);
    setStatus("Matéria editada.");
  }

  function excluirMateria() {
    if (!materiaAtiva) return;

    const confirmar = window.confirm("Deseja excluir esta matéria?");
    if (!confirmar) return;

    const novo = {
      ...app,
      materias: arr<Materia>(app.materias).filter((m) => String(m.id) !== String(materiaAtiva.id)),
    };

    persist(novo);
    router.push("/materias");
  }

  if (!mounted) {
    return <div className="p-6 text-white">Carregando matéria...</div>;
  }

  if (!materiaAtiva) {
    return <div className="p-6 text-white">Matéria não encontrada.</div>;
  }

  const topicos = arr<Topico>(materiaAtiva.topicos);

  return (
    <div
      className="studyPagePremium min-h-screen text-white"
      style={{
        background:
          "radial-gradient(circle at 18% 0%, rgba(92,109,255,0.24), transparent 24%), radial-gradient(circle at 82% 8%, rgba(68,196,255,0.18), transparent 20%), linear-gradient(180deg, #071028 0%, #091231 42%, #071028 100%)",
      }}
    >
      <div className="w-full max-w-none px-4 py-6 md:px-6">
        <div
          className="studyHeroCard materiaHero materiaHeroPremium rounded-[34px] border p-6 md:p-8"
          style={{
            borderColor: "rgba(196,181,253,0.22)",
            background:
              "radial-gradient(circle at 10% 30%, rgba(139,92,246,0.30), transparent 32%), radial-gradient(circle at 92% 0%, rgba(59,130,246,0.20), transparent 34%), linear-gradient(135deg, rgba(15,23,42,0.96), rgba(8,13,35,0.98) 58%, rgba(35,18,67,0.86))",
            boxShadow:
              "0 34px 100px rgba(0,0,0,0.45), 0 0 54px rgba(139,92,246,0.16), inset 0 1px 0 rgba(255,255,255,0.07)",
          }}
        >
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="min-w-0">
              <button
                type="button"
                onClick={() => router.push("/materias")}
                className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-[#D8E2FF] transition hover:border-violet-300/30 hover:bg-white/[0.07]"
                style={{ borderColor: "rgba(180,192,255,0.18)" }}
              >
                ← Voltar para Centro de Estudos
              </button>

              <div className="mt-5 flex items-center gap-4">
                <div
                  className="flex h-24 w-24 items-center justify-center rounded-[28px] border text-5xl"
                  style={{
                    borderColor: "rgba(138,161,255,0.30)",
                    background: "linear-gradient(180deg, rgba(79,109,255,0.26), rgba(34,54,128,0.32))",
                    boxShadow: "0 0 30px rgba(72,102,255,0.22)",
                  }}
                >
                  {materiaAtiva.icone || "📘"}
                </div>

                <div className="min-w-0">
                  <div className="text-sm uppercase tracking-[0.28em] text-[#95A6E6]">
                    Matéria
                  </div>
                  <h1 className="mt-1 text-4xl font-black tracking-tight">
                    {materiaAtiva.nome}
                  </h1>
                  <p className="mt-2 text-base text-[#C8D3FF]">
                    Abra um tópico para organizar subtópicos, conteúdos, revisões e estudos da matéria.
                  </p>
                  <div className="mt-2 text-sm text-[#97A7E3]">
                    Última atividade: {formatTempoRelativo(materiaAtiva.ultimaAtividade)}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={editarMateria}
                className="topicoBtnPremium rounded-full border px-4 py-2 text-sm font-semibold opacity-70 transition hover:opacity-100"
                style={{ borderColor: "rgba(181,193,255,0.18)" }}
              >
                Editar matéria
              </button>

              <button
                type="button"
                onClick={excluirMateria}
                className="topicoBtnPremium rounded-full border px-4 py-2 text-sm font-semibold opacity-70 transition hover:opacity-100"
                style={{ borderColor: "rgba(255,142,142,0.20)" }}
              >
                Excluir matéria
              </button>
            </div>
          </div>
        </div>

        {status ? (
          <div
            className="mt-5 rounded-[20px] border px-4 py-3 text-sm font-medium"
            style={{
              borderColor: "rgba(82,184,162,0.28)",
              background: "rgba(21,101,85,0.18)",
            }}
          >
            {status}
          </div>
        ) : null}

        <div
          className="studyCreateCard materiaCreateBox topicosCreatePremium mt-8 rounded-[32px] border p-6"
          style={{
            borderColor: "rgba(118,137,255,0.22)",
            background: "linear-gradient(180deg, rgba(16,23,70,0.95) 0%, rgba(10,15,46,0.98) 100%)",
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Tópicos</h2>
              <p className="mt-1 text-sm text-[#A9B9F4]">
                Escolha o próximo tópico e mantenha sua trilha de estudo organizada.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]">
            <input
              value={novoTopico}
              onChange={(e) => setNovoTopico(e.target.value)}
              placeholder="Digite o nome do novo tópico"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-5 py-4 text-base text-white outline-none placeholder:text-[#95A7E9] focus:border-violet-300/40"
              style={{
                borderColor: "rgba(126,140,255,0.30)",
                background: "rgba(18,24,68,0.55)",
              }}
            />

            <button
              type="button"
              onClick={criarTopico}
              className="rounded-2xl border border-violet-300/35 bg-gradient-to-r from-violet-600 to-indigo-600 px-7 py-4 text-sm font-black text-white shadow-xl shadow-violet-950/30 transition hover:-translate-y-[1px] hover:shadow-violet-900/40"
              style={{
                borderColor: "rgba(130,167,255,0.48)",
                background: "linear-gradient(180deg, rgba(74,113,255,0.30), rgba(41,69,172,0.34))",
              }}
            >
              + Criar Tópico
            </button>
          </div>
        </div>

        <div className="studyTopicList topicosGrid topicosList mt-8">
          {topicos.length ? (
            topicos.map((topico, index) => (
              <div
                key={topico.id}
                onClick={() => router.push("/materias/" + materiaAtiva.id + "/" + topico.id)}
                className="studyTopicRow topicoCard cursor-pointer rounded-[26px] border p-5 transition duration-300"
                style={{
                  borderColor: "rgba(118,137,255,0.20)",
                  background: "linear-gradient(180deg, rgba(16,23,70,0.92) 0%, rgba(10,15,46,0.96) 100%)",
                  boxShadow: "0 10px 28px rgba(5,9,27,0.20)",
                }}
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,.16),transparent_38%)] opacity-0 transition duration-300 group-hover:opacity-100"></div><div className="relative flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <div
                        className="studyTopicNumber topicoNumber flex h-12 w-12 items-center justify-center rounded-[16px] border text-lg font-black"
                        style={{
                          borderColor: "rgba(132,150,255,0.22)",
                          background: "rgba(57,78,170,0.22)",
                        }}
                      >
                        {index + 1}
                      </div>

                      <div className="min-w-0">
                        <div className="studyTopicTitle topicoTitle truncate text-[22px] md:text-[24px] leading-tight font-black tracking-[-0.03em]">{topico.nome}</div>
                        <div className="mt-2 text-sm font-medium text-[#9FB0EC]">
                          {arr(topico.subtopicos).length} subtópico{arr(topico.subtopicos).length === 1 ? "" : "s"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => editarTopico(topico)}
                      className="studyTopicAction topicoAction rounded-full border px-4 py-2 text-xs opacity-55 hover:opacity-100"
                      style={{ borderColor: "rgba(181,193,255,0.18)" }}
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() => excluirTopico(String(topico.id))}
                      className="studyTopicAction topicoAction rounded-full border px-4 py-2 text-xs opacity-55 hover:opacity-100"
                      style={{ borderColor: "rgba(255,142,142,0.20)" }}
                    >
                      Excluir
                    </button>
                  <div className="studyTopicArrow">›</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div
              className="rounded-[24px] border p-6 text-center text-[#A9B9F4]"
              style={{
                borderColor: "rgba(118,137,255,0.20)",
                background: "rgba(14,19,58,0.85)",
              }}
            >
              Nenhum tópico criado ainda.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}