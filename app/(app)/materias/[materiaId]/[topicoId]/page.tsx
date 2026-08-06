"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { loadAppData, updateAppData } from "@/lib/app-storage";

type SavedAiItem = {
  id: string;
  titulo?: string;
  texto: string;
  tipo?: string;
  criadoEm: string;
};

function uid() {
  return Date.now().toString() + "_" + Math.random().toString(36).slice(2, 9);
}

function arr<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : [];
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

function deepExtractString(value: any): string {
  if (!value) return "";

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "";

    try {
      const parsed = JSON.parse(trimmed);
      const nested = deepExtractString(parsed);
      return nested || trimmed;
    } catch {
      return trimmed;
    }
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => deepExtractString(item)).filter(Boolean).join("\n").trim();
  }

  if (typeof value === "object") {
    const priorityKeys = [
      "text",
      "response",
      "message",
      "output",
      "content",
      "answer",
      "resultado",
      "resposta",
      "finalText",
      "final_text",
      "generatedText",
      "generated_text",
    ];

    for (const key of priorityKeys) {
      if (key in value) {
        const extracted = deepExtractString(value[key]);
        if (extracted) return extracted;
      }
    }

    if (Array.isArray(value?.parts)) {
      const fromParts = value.parts.map((item: any) => deepExtractString(item)).filter(Boolean).join("\n").trim();
      if (fromParts) return fromParts;
    }

    if (Array.isArray(value?.candidates)) {
      const fromCandidates = value.candidates
        .map((candidate: any) => deepExtractString(candidate))
        .filter(Boolean)
        .join("\n")
        .trim();
      if (fromCandidates) return fromCandidates;
    }

    for (const key of Object.keys(value)) {
      const extracted = deepExtractString(value[key]);
      if (extracted) return extracted;
    }
  }

  return "";
}

function cleanAiText(raw: any): string {
  const extracted = deepExtractString(raw).trim();
  if (!extracted) return "";

  const sanitized = extracted
    .replace(/^\s*```json\s*/i, "")
    .replace(/^\s*```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  if (
    (sanitized.startsWith("{") && sanitized.endsWith("}")) ||
    (sanitized.startsWith("[") && sanitized.endsWith("]"))
  ) {
    try {
      const parsed = JSON.parse(sanitized);
      const nested = deepExtractString(parsed).trim();
      if (nested) return nested;
    } catch {}
  }

  return sanitized;
}

function hasSavedContent(sub: any) {
  return arr<any>(sub?.conteudos).length > 0;
}

function hasSavedNotes(sub: any) {
  return arr<any>(sub?.anotacoes).length > 0;
}

function subtopicosSignature(list: any[]) {
  return list.map((item) => String(item?.id || "")).join("|");
}

export default function TopicoPage() {
  const router = useRouter();
  const params = useParams<{ materiaId: string; topicoId: string }>();

  const materiaId = String(params?.materiaId || "");
  const topicoId = String(params?.topicoId || "");

  const [appData, setAppData] = useState<any>({ materias: [] });
  const [mounted, setMounted] = useState(false);

  const [novoSubtopico, setNovoSubtopico] = useState("");
  const [status, setStatus] = useState("");

  const [subtopicoSelecionadoId, setSubtopicoSelecionadoId] = useState<string>("");
  const [manualPrompt, setManualPrompt] = useState("");
  const [iaTexto, setIaTexto] = useState("");
  const [iaTipo, setIaTipo] = useState("");
  const [iaLoading, setIaLoading] = useState(false);
  const [iaErro, setIaErro] = useState("");

  useEffect(() => {
    setAppData(loadAppData() || { materias: [] });
    setMounted(true);
  }, []);

  function reloadApp() {
    setAppData(loadAppData() || { materias: [] });
  }

  const materia = useMemo(() => {
    return arr<any>(appData?.materias).find((m) => String(m.id) === materiaId) || null;
  }, [appData, materiaId]);

  const topico = useMemo(() => {
    return arr<any>(materia?.topicos).find((t) => String(t.id) === topicoId) || null;
  }, [materia, topicoId]);

  const subtopicos = useMemo(() => arr<any>(topico?.subtopicos), [topico]);
  const [filtroSubtopicos, setFiltroSubtopicos] = useState<"todos" | "pendentes" | "concluidos">("todos");

  const subtopicosConcluidos = useMemo(() => {
    return subtopicos.filter((sub) => !!sub.estudado).length;
  }, [subtopicosSignature(subtopicos)]);

  const progressoTopico = useMemo(() => {
    if (!subtopicos.length) return 0;
    return Math.round((subtopicosConcluidos / subtopicos.length) * 100);
  }, [subtopicosConcluidos, subtopicos.length]);

  const subtopicosFiltrados = useMemo(() => {
    if (filtroSubtopicos === "pendentes") return subtopicos.filter((sub) => !sub.estudado);
    if (filtroSubtopicos === "concluidos") return subtopicos.filter((sub) => !!sub.estudado);
    return subtopicos;
  }, [subtopicosSignature(subtopicos), filtroSubtopicos]);

  const subtopicoSelecionado = useMemo(() => {
    return subtopicos.find((sub) => String(sub.id) === String(subtopicoSelecionadoId)) || null;
  }, [subtopicos, subtopicoSelecionadoId]);

  useEffect(() => {
    if (!subtopicoSelecionadoId && subtopicos.length > 0) {
      setSubtopicoSelecionadoId(String(subtopicos[0].id));
    }
  }, [subtopicoSelecionadoId, subtopicosSignature(subtopicos)]);

  function criarSubtopico() {
    const nome = novoSubtopico.trim();
    if (!nome || !materia || !topico) return;

    updateAppData((data: any) => {
      const materias = [...(data?.materias || [])];
      const materiaIndex = materias.findIndex((m: any) => String(m.id) === materiaId);
      if (materiaIndex === -1) return data;

      const topicos = [...(materias[materiaIndex].topicos || [])];
      const topicoIndex = topicos.findIndex((t: any) => String(t.id) === topicoId);
      if (topicoIndex === -1) return data;

      const novoItem = {
        id: uid(),
        nome,
        estudado: false,
        conteudos: [],
        anotacoes: [],
        erros: [],
        iaRespostas: [],
      };

      topicos[topicoIndex] = {
        ...topicos[topicoIndex],
        subtopicos: [...(topicos[topicoIndex].subtopicos || []), novoItem],
      };

      materias[materiaIndex] = {
        ...materias[materiaIndex],
        topicos,
        ultimaAtividade: new Date().toISOString(),
      };

      return { ...data, materias };
    });

    setNovoSubtopico("");
    setStatus("Subtópico criado.");
    reloadApp();
  }

  function editarSubtopico(subtopico: any) {
    const nome = window.prompt("Novo nome do subtópico:", subtopico.nome);
    if (!nome || !nome.trim()) return;

    updateAppData((data: any) => {
      const materias = [...(data?.materias || [])];
      const materiaIndex = materias.findIndex((m: any) => String(m.id) === materiaId);
      if (materiaIndex === -1) return data;

      const topicos = [...(materias[materiaIndex].topicos || [])];
      const topicoIndex = topicos.findIndex((t: any) => String(t.id) === topicoId);
      if (topicoIndex === -1) return data;

      const subtopicosAtualizados = [...(topicos[topicoIndex].subtopicos || [])].map((sub: any) =>
        String(sub.id) === String(subtopico.id)
          ? { ...sub, nome: nome.trim() }
          : sub
      );

      topicos[topicoIndex] = {
        ...topicos[topicoIndex],
        subtopicos: subtopicosAtualizados,
      };

      materias[materiaIndex] = {
        ...materias[materiaIndex],
        topicos,
        ultimaAtividade: new Date().toISOString(),
      };

      return { ...data, materias };
    });

    setStatus("Subtópico editado.");
    reloadApp();
  }

  function excluirSubtopico(subtopicoIdExcluir: string) {
    const confirmar = window.confirm("Deseja excluir este subtópico?");
    if (!confirmar) return;

    updateAppData((data: any) => {
      const materias = [...(data?.materias || [])];
      const materiaIndex = materias.findIndex((m: any) => String(m.id) === materiaId);
      if (materiaIndex === -1) return data;

      const topicos = [...(materias[materiaIndex].topicos || [])];
      const topicoIndex = topicos.findIndex((t: any) => String(t.id) === topicoId);
      if (topicoIndex === -1) return data;

      const subtopicosAtualizados = [...(topicos[topicoIndex].subtopicos || [])].filter(
        (sub: any) => String(sub.id) !== String(subtopicoIdExcluir)
      );

      topicos[topicoIndex] = {
        ...topicos[topicoIndex],
        subtopicos: subtopicosAtualizados,
      };

      materias[materiaIndex] = {
        ...materias[materiaIndex],
        topicos,
        ultimaAtividade: new Date().toISOString(),
      };

      return { ...data, materias };
    });

    if (String(subtopicoSelecionadoId) === String(subtopicoIdExcluir)) {
      setSubtopicoSelecionadoId("");
      setIaTexto("");
      setIaTipo("");
    }

    setStatus("Subtópico excluído.");
    reloadApp();
  }

  async function gerarIA(tipo: "explicacao" | "resumo" | "questoes" | "manual") {
    if (!materia || !topico || !subtopicoSelecionado) {
      setIaErro("Selecione um subtópico para usar a IA.");
      return;
    }

    const promptManual = manualPrompt.trim();
    if (tipo === "manual" && !promptManual) {
      setIaErro("Digite um prompt manual antes de enviar.");
      return;
    }

    setIaLoading(true);
    setIaErro("");
    setStatus("");

    const baseInstruction =
      tipo === "explicacao"
        ? "Explique este subtópico de forma didática, objetiva e útil para estudo."
        : tipo === "resumo"
        ? "Crie um resumo claro, organizado e útil para revisão deste subtópico."
        : tipo === "questoes"
        ? "Crie questões de estudo com enunciado e gabarito comentado sobre este subtópico."
        : promptManual;

    const payload = {
      prompt: baseInstruction,
      userInput: promptManual || baseInstruction,
      action: tipo,
      snapshot: {
        materiaId: materia.id,
        materiaNome: materia.nome,
        materiaIcone: materia.icone || "📘",
        topicoId: topico.id,
        topicoNome: topico.nome,
        subtopicoId: subtopicoSelecionado.id,
        subtopicoNome: subtopicoSelecionado.nome,
        conteudos: arr<any>(subtopicoSelecionado.conteudos),
        anotacoes: arr<any>(subtopicoSelecionado.anotacoes),
        erros: arr<any>(subtopicoSelecionado.erros),
      },
    };

    try {
      const response = await fetch("/api/ia", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const rawText = await response.text();

      let parsed: any = rawText;
      try {
        parsed = JSON.parse(rawText);
      } catch {}

      const textoLimpo = cleanAiText(parsed) || cleanAiText(rawText);

      if (!response.ok) {
        throw new Error(textoLimpo || "A IA não conseguiu responder agora.");
      }

      if (!textoLimpo) {
        throw new Error("A IA respondeu sem texto útil.");
      }

      setIaTexto(textoLimpo);
      setIaTipo(tipo);
      setStatus("Resposta da IA gerada.");
    } catch (error: any) {
      setIaErro(error?.message || "Não foi possível gerar a resposta da IA.");
    } finally {
      setIaLoading(false);
    }
  }

  function salvarIA() {
    if (!subtopicoSelecionado || !iaTexto.trim()) {
      setIaErro("Não há resposta da IA para salvar.");
      return;
    }

    updateAppData((data: any) => {
      const materias = [...(data?.materias || [])];
      const materiaIndex = materias.findIndex((m: any) => String(m.id) === materiaId);
      if (materiaIndex === -1) return data;

      const topicos = [...(materias[materiaIndex].topicos || [])];
      const topicoIndex = topicos.findIndex((t: any) => String(t.id) === topicoId);
      if (topicoIndex === -1) return data;

      const subtopicosAtualizados = [...(topicos[topicoIndex].subtopicos || [])].map((sub: any) => {
        if (String(sub.id) !== String(subtopicoSelecionado.id)) return sub;

        const historico = [...(sub.iaRespostas || [])];
        historico.push({
          id: uid(),
          titulo: sub.nome,
          texto: iaTexto.trim(),
          tipo: iaTipo || "manual",
          criadoEm: new Date().toISOString(),
        });

        return {
          ...sub,
          iaRespostas: historico,
        };
      });

      topicos[topicoIndex] = {
        ...topicos[topicoIndex],
        subtopicos: subtopicosAtualizados,
      };

      materias[materiaIndex] = {
        ...materias[materiaIndex],
        topicos,
        ultimaAtividade: new Date().toISOString(),
      };

      return { ...data, materias };
    });

    setStatus("Resposta da IA salva.");
    reloadApp();
  }

  if (!mounted) {
    return <div className="p-6 text-white">Carregando tópico...</div>;
  }

  if (!materia || !topico) {
    return <div className="p-6 text-white">Tópico não encontrado.</div>;
  }

  return (
    <div 
      className="min-h-screen text-white"
      style={{
        background:
          "radial-gradient(circle at 18% 0%, rgba(92,109,255,0.24), transparent 24%), radial-gradient(circle at 82% 8%, rgba(68,196,255,0.18), transparent 20%), linear-gradient(180deg, #071028 0%, #091231 42%, #071028 100%)",
      }}
    >
      <div  className="mx-auto max-w-[1480px] px-4 py-6">
        <div 
          className="rounded-[30px] border p-6 md:p-8"
          style={{
            borderColor: "rgba(116,136,255,0.30)",
            background: "linear-gradient(180deg, rgba(10,18,54,0.94) 0%, rgba(8,13,40,0.96) 100%)",
            boxShadow: "0 16px 80px rgba(8,12,36,0.55)",
          }}
        >
          <div  className="flex flex-wrap items-start justify-between gap-6">
            <div  className="min-w-0">
              <button
                type="button"
                onClick={() => router.push("/materias/" + materia.id)}
                className="rounded-full border px-4 py-2 text-sm text-[#D8E2FF] transition hover:bg-white/5"
                style={{ borderColor: "rgba(180,192,255,0.18)" }}
              >
                ← Voltar para {materia.nome}
              </button>

              <div  className="mt-5 flex items-center gap-4">
                <div 
                  className="flex h-16 w-16 items-center justify-center rounded-[20px] border text-3xl"
                  style={{
                    borderColor: "rgba(138,161,255,0.30)",
                    background: "linear-gradient(180deg, rgba(79,109,255,0.26), rgba(34,54,128,0.32))",
                    boxShadow: "0 0 30px rgba(72,102,255,0.22)",
                  }}
                >
                  {materia.icone || "📘"}
                </div>

                <div  className="min-w-0">
                  <div  className="text-sm uppercase tracking-[0.28em] text-[#95A6E6]">
                    {materia.nome}
                  </div>
                  <h1 className="mt-1 text-4xl font-black tracking-tight">{topico.nome}</h1>
                  <p className="mt-2 text-base text-[#C8D3FF]">
                    Crie e abra subtópicos. O painel lateral fica só para a IA contextual.
                  </p>
                </div>
              </div>
            </div>

            <div 
              className="min-w-[280px] rounded-[24px] border px-5 py-4"
              style={{
                borderColor: "rgba(123,141,255,0.22)",
                background: "rgba(19,27,73,0.44)",
              }}
            >
              <div  className="text-sm text-[#AEBDFC]">Resumo do tópico</div>
              <div  className="mt-2 text-3xl font-black">{subtopicos.length}</div>
              <div  className="mt-1 text-sm text-[#D5DEFF]">
                subtópico{subtopicos.length === 1 ? "" : "s"} nesta pasta
              </div>

              <div  className="mt-4">
                <div  className="mb-2 flex items-center justify-between text-xs text-[#AEBDFC]">
                  <span>{subtopicosConcluidos} de {subtopicos.length} concluídos</span>
                  <span>{progressoTopico}%</span>
                </div>
                <div  className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progressoTopico}%`,
                      background: "linear-gradient(90deg, #22c55e, #60a5fa, #8b5cf6)",
                    }}
                  />
                </div>
              </div>
              <div  className="mt-3 text-xs text-[#97A7E3]">
                Última atividade da matéria: {formatTempoRelativo(materia.ultimaAtividade)}
              </div>
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

        <div  className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <section className="space-y-5">
            <div 
              className="rounded-[28px] border p-5"
              style={{
                borderColor: "rgba(118,137,255,0.22)",
                background: "linear-gradient(180deg, rgba(16,23,70,0.95) 0%, rgba(10,15,46,0.98) 100%)",
              }}
            >
              <div >
                <h2 className="text-2xl font-bold">Subtópicos</h2>
                <p className="mt-1 text-sm text-[#A9B9F4]">
                  O card inteiro abre o subtópico. Botões laterais não atrapalham o clique.
                </p>
              </div>

              <div  className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setFiltroSubtopicos("todos")}
                  className="rounded-full border px-4 py-2 text-xs font-semibold transition hover:bg-white/5"
                  style={{
                    borderColor: filtroSubtopicos === "todos" ? "rgba(126,157,255,0.65)" : "rgba(181,193,255,0.18)",
                    background: filtroSubtopicos === "todos" ? "rgba(74,113,255,0.22)" : "transparent",
                  }}
                >
                  Todos
                </button>

                <button
                  type="button"
                  onClick={() => setFiltroSubtopicos("pendentes")}
                  className="rounded-full border px-4 py-2 text-xs font-semibold transition hover:bg-white/5"
                  style={{
                    borderColor: filtroSubtopicos === "pendentes" ? "rgba(251,191,36,0.65)" : "rgba(181,193,255,0.18)",
                    background: filtroSubtopicos === "pendentes" ? "rgba(251,191,36,0.16)" : "transparent",
                  }}
                >
                  Pendentes
                </button>

                <button
                  type="button"
                  onClick={() => setFiltroSubtopicos("concluidos")}
                  className="rounded-full border px-4 py-2 text-xs font-semibold transition hover:bg-white/5"
                  style={{
                    borderColor: filtroSubtopicos === "concluidos" ? "rgba(34,197,94,0.65)" : "rgba(181,193,255,0.18)",
                    background: filtroSubtopicos === "concluidos" ? "rgba(34,197,94,0.16)" : "transparent",
                  }}
                >
                  Concluídos
                </button>
              </div>

              <div  className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]">
                <input
                  value={novoSubtopico}
                  onChange={(e) => setNovoSubtopico(e.target.value)}
                  placeholder="Digite o nome do novo subtópico"
                  className="w-full rounded-full border px-5 py-4 text-base text-white outline-none placeholder:text-[#95A7E9]"
                  style={{
                    borderColor: "rgba(126,140,255,0.30)",
                    background: "rgba(18,24,68,0.55)",
                  }}
                />
                <button
                  type="button"
                  onClick={criarSubtopico}
                  className="rounded-full border px-7 py-4 text-sm font-semibold text-white transition hover:-translate-y-[1px]"
                  style={{
                    borderColor: "rgba(130,167,255,0.48)",
                    background: "linear-gradient(180deg, rgba(74,113,255,0.30), rgba(41,69,172,0.34))",
                  }}
                >
                  + Criar Subtópico
                </button>
              </div>
            </div>

            

            <div  className="space-y-4">
              {subtopicosFiltrados.length ? (
                subtopicosFiltrados.map((sub, index) => {
                  const ativo = String(sub.id) === String(subtopicoSelecionadoId);
                  const concluido = !!sub.estudado;

                  return (
                    <div 
                      key={`${sub.id}-${sub.estudado}`}
                      onClick={() => {
                        setSubtopicoSelecionadoId(String(sub.id));
                        router.push("/materias/" + materia.id + "/" + topico.id + "/" + sub.id);
                      }}
                      className={`cursor-pointer rounded-[24px] border p-5 transition duration-300 hover:-translate-y-[1px] ${concluido ? "animate-[subDone_0.55s_ease-out]" : ""}`}
                      style={{
                        opacity: concluido ? 0.75 : 1,
                        animation: concluido ? "subDone 0.55s ease-out" : "none",
                        borderColor: ativo ? "rgba(126,157,255,0.55)" : "rgba(118,137,255,0.20)",
                        background: ativo
                          ? "linear-gradient(180deg, rgba(24,34,95,0.96) 0%, rgba(10,15,48,0.98) 100%)"
                          : "linear-gradient(180deg, rgba(16,23,70,0.92) 0%, rgba(10,15,46,0.96) 100%)",
                        boxShadow: ativo ? "0 0 28px rgba(83,110,255,0.18)" : "0 10px 28px rgba(5,9,27,0.20)",
                      }}
                    >
                      <div  className="flex items-start justify-between gap-4">
                        <div  className="min-w-0 flex-1">
                          <div  className="flex items-center gap-3">
                            <div 
                              className="flex h-11 w-11 items-center justify-center rounded-[14px] border text-lg"
                              style={{
                                borderColor: "rgba(132,150,255,0.22)",
                                background: "rgba(57,78,170,0.22)",
                              }}
                            >
                              {index + 1}
                            </div>

                            <div  className="min-w-0">
                              <div  className="truncate text-xl font-semibold">{sub.nome}
                          {concluido && (
                            <span style={{
                              marginLeft: 10,
                              padding: "4px 10px",
                              borderRadius: 999,
                              fontSize: 11,
                              fontWeight: 700,
                              background: "rgba(34,197,94,0.2)",
                              color: "#22c55e"
                            }}>
                              ✔ Concluído
                            </span>
                          )}</div>
                              <div  className="mt-1 flex flex-wrap gap-2 text-xs text-[#9FB0EC]">
                                <span className="rounded-full border px-2 py-1" style={{ borderColor: "rgba(122,141,255,0.18)" }}>
                                  {hasSavedContent(sub) ? "Com conteúdo" : "Sem conteúdo"}
                                </span>
                                <span className="rounded-full border px-2 py-1" style={{ borderColor: "rgba(122,141,255,0.18)" }}>
                                  {hasSavedNotes(sub) ? "Com anotações" : "Sem anotações"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div  className="flex shrink-0 items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => editarSubtopico(sub)}
                            className="rounded-full border px-3 py-1.5 text-xs"
                            style={{ borderColor: "rgba(181,193,255,0.18)" }}
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() => excluirSubtopico(sub.id)}
                            className="rounded-full border px-3 py-1.5 text-xs"
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
                  className="rounded-[24px] border p-6 text-center text-[#A9B9F4]"
                  style={{
                    borderColor: "rgba(118,137,255,0.20)",
                    background: "rgba(14,19,58,0.85)",
                  }}
                >
                  Nenhum subtópico criado ainda.
                </div>
              )}
            </div>
          </section>

          <aside
            className="rounded-[28px] border p-5"
            style={{
              borderColor: "rgba(124,143,255,0.22)",
              background: "linear-gradient(180deg, rgba(14,22,66,0.96) 0%, rgba(8,13,42,0.98) 100%)",
              boxShadow: "0 14px 50px rgba(8,12,36,0.35)",
            }}
          >
            <div  className="flex items-center gap-4">
              <div 
                className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-full border"
                style={{
                  borderColor: "rgba(133,156,255,0.38)",
                  boxShadow: "0 0 30px rgba(90,122,255,0.22)",
                }}
              >
                <Image
                  src="/ia/lyra.png"
                  alt="Lyra"
                  fill
                  className="object-cover"
                  sizes="88px"
                  priority
                />
              </div>

              <div  className="min-w-0 flex-1">
                <div  className="text-[11px] uppercase tracking-[0.28em] text-[#8EA0E5]">IA contextual</div>
                <h2 className="mt-1 text-[32px] font-black leading-none">Lyra</h2>
                <div  className="mt-2 text-sm leading-6 text-[#C9D5FF]">
                  Pergunte à Lyra e receba explicações, resumos e questões em linguagem de estudo.
                </div>
              </div>
            </div>

            <div 
              className="mt-5 rounded-[22px] border p-4"
              style={{
                borderColor: "rgba(122,141,255,0.20)",
                background: "rgba(18,25,69,0.44)",
              }}
            >
              <div  className="text-xs uppercase tracking-[0.18em] text-[#95A6E4]">Subtópico selecionado</div>
              <div  className="mt-2 text-lg font-semibold">
                {subtopicoSelecionado?.nome || "Nenhum subtópico selecionado"}
              </div>
              <div  className="mt-2 text-sm text-[#C8D3FF]">
                {subtopicoSelecionado
                  ? "A resposta deve aparecer em texto puro, sem JSON cru."
                  : "Selecione um subtópico para usar a IA."}
              </div>
            </div>

            <div  className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <button
                type="button"
                onClick={() => gerarIA("explicacao")}
                disabled={iaLoading || !subtopicoSelecionado}
                className="rounded-[18px] border px-4 py-3 text-left transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
                style={{ borderColor: "rgba(121,142,255,0.22)" }}
              >
                <div  className="text-sm font-semibold">Explicar isso</div>
                <div  className="mt-1 text-xs text-[#9AAAE8]">Didático e direto</div>
              </button>

              <button
                type="button"
                onClick={() => gerarIA("resumo")}
                disabled={iaLoading || !subtopicoSelecionado}
                className="rounded-[18px] border px-4 py-3 text-left transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
                style={{ borderColor: "rgba(121,142,255,0.22)" }}
              >
                <div  className="text-sm font-semibold">Gerar resumo</div>
                <div  className="mt-1 text-xs text-[#9AAAE8]">Foco em revisão</div>
              </button>
            </div>

            <div  className="mt-5">
              <label className="mb-2 block text-sm font-medium text-[#D8E1FF]">
                Pergunte à Lyra
              </label>
              <textarea
                value={manualPrompt}
                onChange={(e) => setManualPrompt(e.target.value)}
                placeholder="Escreva um pedido manual para a IA..."
                className="min-h-[110px] w-full rounded-[18px] border px-4 py-3 text-sm text-white outline-none placeholder:text-[#92A3E1]"
                style={{
                  borderColor: "rgba(122,141,255,0.22)",
                  background: "rgba(18,25,69,0.44)",
                }}
              />
              <button
                type="button"
                onClick={() => gerarIA("manual")}
                disabled={iaLoading || !subtopicoSelecionado}
                className="mt-3 w-full rounded-[18px] border px-4 py-3 text-sm font-semibold transition hover:-translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  borderColor: "rgba(134,174,255,0.44)",
                  background: "linear-gradient(180deg, rgba(70,111,255,0.28), rgba(40,68,170,0.30))",
                }}
              >
                {iaLoading ? "Gerando..." : "Enviar prompt manual"}
              </button>
            </div>

            {iaErro ? (
              <div 
                className="mt-5 rounded-[18px] border px-4 py-3 text-sm"
                style={{
                  borderColor: "rgba(255,109,109,0.28)",
                  background: "rgba(102,29,29,0.22)",
                }}
              >
                {iaErro}
              </div>
            ) : null}

            <div 
              className="mt-5 rounded-[22px] border p-4"
              style={{
                borderColor: "rgba(122,141,255,0.20)",
                background: "rgba(18,25,69,0.44)",
              }}
            >
              <div  className="flex items-center justify-between gap-3">
                <div  className="text-sm font-semibold">Resposta da Lyra</div>
                <div  className="text-xs text-[#93A5E5]">
                  {iaTipo ? "Tipo: " + iaTipo : "Sem resposta"}
                </div>
              </div>

              <div  className="mt-3 max-h-[240px] overflow-auto whitespace-pre-wrap text-sm leading-7 text-[#EAF0FF]">
                {iaTexto || "Ainda não há resposta gerada para este subtópico."}
              </div>

              <div  className="mt-4">
                <button
                  type="button"
                  onClick={salvarIA}
                  disabled={!iaTexto.trim()}
                  className="w-full rounded-[16px] border px-4 py-3 text-sm font-semibold transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ borderColor: "rgba(122,141,255,0.22)" }}
                >
                  Salvar IA
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}