"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { DATA_KEYS } from "@/lib/data-access/keys";
import { loadAppData, updateAppData } from "@/lib/app-storage";
import { salvarNaRevisaoInteligente } from "@/lib/revisao-inteligente-adapter";
import {
  arr,
  collectErros,
  deepText,
  delayIA,
  parseCaderno,
  prioridadeLabel,
  prioridadePeso,
  safeString,
  uid,
  uniqueStrings,
} from "@/lib/banco-erros/core";
import type {
  CadernoIA,
  DificuldadeIA,
  ErroItem,
  ModoIA,
  PrioridadeErro,
} from "@/lib/banco-erros/types";

export function BancoErrosFeature() {
  const [mounted, setMounted] = useState(false);
  const [app, setApp] = useState<any>({});

  const [busca, setBusca] = useState("");
  const [materiaFiltro, setMateriaFiltro] = useState("todas");
  const [topicoFiltro, setTopicoFiltro] = useState("todos");
  const [subtopicoFiltro, setSubtopicoFiltro] = useState("todos");
  const [prioridadeFiltro, setPrioridadeFiltro] = useState("todas");
  const [ordem, setOrdem] = useState<"recentes" | "antigos" | "prioridade">("recentes");

  const [materiaForm, setMateriaForm] = useState("");
  const [topicoForm, setTopicoForm] = useState("");
  const [subtopicoForm, setSubtopicoForm] = useState("");
  const [enunciadoForm, setEnunciadoForm] = useState("");
  const [respostaUsuarioForm, setRespostaUsuarioForm] = useState("");
  const [respostaCorretaForm, setRespostaCorretaForm] = useState("");
  const [comentarioForm, setComentarioForm] = useState("");
  const [prioridadeForm, setPrioridadeForm] = useState<PrioridadeErro>("medio");
  const [editando, setEditando] = useState<ErroItem | null>(null);

  const [erroAtualIndex, setErroAtualIndex] = useState(0);
  const [respostaTentativaAtual, setRespostaTentativaAtual] = useState("");
  const [mostrarCorrecaoAtual, setMostrarCorrecaoAtual] = useState(false);
  const [animacaoConclusao, setAnimacaoConclusao] = useState(false);

  const [iaMateriaFiltro, setIaMateriaFiltro] = useState("todas");
  const [iaTopicoFiltro, setIaTopicoFiltro] = useState("todos");
  const [iaSubtopicoFiltro, setIaSubtopicoFiltro] = useState("todos");
  const [quantidadeQuestoesIA, setQuantidadeQuestoesIA] = useState(5);
  const [dificuldadeIA, setDificuldadeIA] = useState<DificuldadeIA>("medio");
  const [modoIA, setModoIA] = useState<ModoIA>("objetiva");
  const [iaLoading, setIaLoading] = useState(false);
  const [iaErro, setIaErro] = useState("");
  const [iaCooldownAte, setIaCooldownAte] = useState(0);
  const [cadernoIA, setCadernoIA] = useState<CadernoIA | null>(null);
  const [questaoAtualIA, setQuestaoAtualIA] = useState(0);
  const [respostaMarcadaIA, setRespostaMarcadaIA] = useState<number | null>(null);
  const [questaoRespondidaIA, setQuestaoRespondidaIA] = useState(false);
  const [feedbackQuestaoIA, setFeedbackQuestaoIA] = useState<"certo" | "errado" | "">("");
  const [iaTreinoConcluido, setIaTreinoConcluido] = useState(false);
  const iaRequestLockRef = useRef(false);

  const [materiasAbertas, setMateriasAbertas] = useState<Record<string, boolean>>({});
  const [topicosAbertos, setTopicosAbertos] = useState<Record<string, boolean>>({});
  const [subtopicosAbertos, setSubtopicosAbertos] = useState<Record<string, boolean>>({});

  const [status, setStatus] = useState("");

  useEffect(() => {
    setApp(loadAppData() || {});
    setMounted(true);
  }, []);

  function reloadApp() {
    setApp(loadAppData() || {});
  }

  const materiasRaw = useMemo(() => arr<any>(app?.materias), [app]);
  const erros = useMemo(() => collectErros(app), [app]);

  const stats = useMemo(() => {
    const saved = app?.bancoErrosStats || {};
    return {
      revisoesSequenciaisFeitas: Number(saved.revisoesSequenciaisFeitas || 0),
      treinosIaFeitos: Number(saved.simuladosIaFeitos || saved.treinosIaFeitos || 0),
      questoesIaRespondidas: Number(saved.questoesIaRespondidas || 0),
      acertosIa: Number(saved.acertosIa || 0),
      errosIa: Number(saved.errosIa || 0),
    };
  }, [app]);

  const materiasDisponiveis = useMemo(() => {
    return materiasRaw.map((m) => ({ id: safeString(m.id), nome: safeString(m.nome) }));
  }, [materiasRaw]);

  const topicosFormDisponiveis = useMemo(() => {
    const materia = materiasRaw.find((m: any) => safeString(m.id) === materiaForm);
    return arr<any>(materia?.topicos).map((t) => ({ id: safeString(t.id), nome: safeString(t.nome) }));
  }, [materiasRaw, materiaForm]);

  const subtopicosFormDisponiveis = useMemo(() => {
    const materia = materiasRaw.find((m: any) => safeString(m.id) === materiaForm);
    const topico = arr<any>(materia?.topicos).find((t) => safeString(t.id) === topicoForm);
    return arr<any>(topico?.subtopicos).map((s) => ({ id: safeString(s.id), nome: safeString(s.nome) }));
  }, [materiasRaw, materiaForm, topicoForm]);

  const materiasFiltroDisponiveis = useMemo(() => uniqueStrings(erros.map((e) => e.materiaNome)), [erros]);

  const topicosFiltroDisponiveis = useMemo(() => {
    return uniqueStrings(
      erros
        .filter((e) => materiaFiltro === "todas" || e.materiaNome === materiaFiltro)
        .map((e) => e.topicoNome)
    );
  }, [erros, materiaFiltro]);

  const subtopicosFiltroDisponiveis = useMemo(() => {
    return uniqueStrings(
      erros
        .filter((e) => materiaFiltro === "todas" || e.materiaNome === materiaFiltro)
        .filter((e) => topicoFiltro === "todos" || e.topicoNome === topicoFiltro)
        .map((e) => e.subtopicoNome)
    );
  }, [erros, materiaFiltro, topicoFiltro]);

  const iaTopicosDisponiveis = useMemo(() => {
    return uniqueStrings(
      erros
        .filter((e) => iaMateriaFiltro === "todas" || e.materiaNome === iaMateriaFiltro)
        .map((e) => e.topicoNome)
    );
  }, [erros, iaMateriaFiltro]);

  const iaSubtopicosDisponiveis = useMemo(() => {
    return uniqueStrings(
      erros
        .filter((e) => iaMateriaFiltro === "todas" || e.materiaNome === iaMateriaFiltro)
        .filter((e) => iaTopicoFiltro === "todos" || e.topicoNome === iaTopicoFiltro)
        .map((e) => e.subtopicoNome)
    );
  }, [erros, iaMateriaFiltro, iaTopicoFiltro]);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    const base = erros.filter((e) => {
      const passouMateria = materiaFiltro === "todas" || e.materiaNome === materiaFiltro;
      const passouTopico = topicoFiltro === "todos" || e.topicoNome === topicoFiltro;
      const passouSubtopico = subtopicoFiltro === "todos" || e.subtopicoNome === subtopicoFiltro;
      const passouPrioridade = prioridadeFiltro === "todas" || e.prioridade === prioridadeFiltro;
      const texto = [e.materiaNome, e.topicoNome, e.subtopicoNome, e.enunciado, e.respostaUsuario, e.respostaCorreta, e.comentario]
        .join(" ")
        .toLowerCase();

      return passouMateria && passouTopico && passouSubtopico && passouPrioridade && (!termo || texto.includes(termo));
    });

    return base.sort((a, b) => {
      if (ordem === "prioridade") return prioridadePeso(b.prioridade) - prioridadePeso(a.prioridade);
      const ta = new Date(a.criadoEm).getTime();
      const tb = new Date(b.criadoEm).getTime();
      return ordem === "antigos" ? ta - tb : tb - ta;
    });
  }, [erros, busca, materiaFiltro, topicoFiltro, subtopicoFiltro, prioridadeFiltro, ordem]);

  const errosAdaptativos = useMemo(() => {
    return [...filtrados].sort((a, b) => prioridadePeso(b.prioridade) - prioridadePeso(a.prioridade));
  }, [filtrados]);

  const agrupados = useMemo(() => {
    const mapa = new Map<string, any>();

    filtrados.forEach((item) => {
      const materiaKey = item.materiaNome;
      if (!mapa.has(materiaKey)) mapa.set(materiaKey, { materiaNome: materiaKey, topicos: new Map<string, any>() });

      const materia = mapa.get(materiaKey);
      if (!materia.topicos.has(item.topicoNome)) materia.topicos.set(item.topicoNome, { topicoNome: item.topicoNome, subtopicos: new Map<string, any>() });

      const topico = materia.topicos.get(item.topicoNome);
      if (!topico.subtopicos.has(item.subtopicoNome)) topico.subtopicos.set(item.subtopicoNome, { subtopicoNome: item.subtopicoNome, itens: [] });

      topico.subtopicos.get(item.subtopicoNome).itens.push(item);
    });

    return Array.from(mapa.values()).map((m) => ({
      materiaNome: m.materiaNome,
      topicos: Array.from(m.topicos.values()).map((t: any) => ({
        topicoNome: t.topicoNome,
        subtopicos: Array.from(t.subtopicos.values()),
      })),
    }));
  }, [filtrados]);

  const erroAtual = filtrados[erroAtualIndex] || null;
  const questaoIAAtual = cadernoIA?.questoes?.[questaoAtualIA] || null;
  const iaEmCooldown = iaCooldownAte > Date.now();
  const segundosCooldown = iaEmCooldown ? Math.ceil((iaCooldownAte - Date.now()) / 1000) : 0;
  const taxaAcertoIa = stats.questoesIaRespondidas > 0 ? Math.round((stats.acertosIa / stats.questoesIaRespondidas) * 100) : 0;

  function registrarMetricas(parcial: any) {
    updateAppData((current: any) => {
      const atual = current?.bancoErrosStats || {};
      const novo = {
        revisoesSequenciaisFeitas: Number(atual.revisoesSequenciaisFeitas || 0),
        simuladosIaFeitos: Number(atual.simuladosIaFeitos || atual.treinosIaFeitos || 0),
        questoesIaRespondidas: Number(atual.questoesIaRespondidas || 0),
        acertosIa: Number(atual.acertosIa || 0),
        errosIa: Number(atual.errosIa || 0),
        ...parcial,
        ultimoTreinoEm: new Date().toISOString(),
      };

      return {
        ...current,
        bancoErrosStats: novo,
        dashboardMetrics: {
          ...(current?.dashboardMetrics || {}),
          bancoDeErros: novo,
        },
      };
    });

    reloadApp();
  }

  function limparFormulario() {
    setEditando(null);
    setMateriaForm("");
    setTopicoForm("");
    setSubtopicoForm("");
    setEnunciadoForm("");
    setRespostaUsuarioForm("");
    setRespostaCorretaForm("");
    setComentarioForm("");
    setPrioridadeForm("medio");
  }

  function salvarErro() {
    if (!materiaForm || !topicoForm || !subtopicoForm || !enunciadoForm.trim()) {
      setStatus("Preencha matéria, tópico, subtópico e enunciado.");
      return;
    }

    updateAppData((current: any) => {
      const materias = arr<any>(current?.materias).map((materia) => {
        if (safeString(materia.id) !== materiaForm) return materia;

        return {
          ...materia,
          topicos: arr<any>(materia.topicos).map((topico) => {
            if (safeString(topico.id) !== topicoForm) return topico;

            return {
              ...topico,
              subtopicos: arr<any>(topico.subtopicos).map((sub) => {
                if (safeString(sub.id) !== subtopicoForm) return sub;

                const chave = editando?.origem === "questoesErradas" ? "questoesErradas" : "erros";
                const lista = arr<any>(sub[chave]);

                const novo = {
                  id: editando?.id || uid("erro"),
                  enunciado: enunciadoForm.trim(),
                  respostaUsuario: respostaUsuarioForm.trim(),
                  respostaCorreta: respostaCorretaForm.trim(),
                  comentario: comentarioForm.trim(),
                  prioridade: prioridadeForm,
                  criadoEm: editando?.criadoEm || new Date().toISOString(),
                };

                return {
                  ...sub,
                  [chave]: editando ? lista.map((item) => safeString(item.id) === editando.id ? { ...item, ...novo } : item) : [...lista, novo],
                };
              }),
            };
          }),
        };
      });

      return { ...current, materias };
    });

    setStatus(editando ? "Erro editado." : "Erro adicionado.");
    limparFormulario();
    reloadApp();
  }

  function editarErro(item: ErroItem) {
    setEditando(item);
    setMateriaForm(item.materiaId);
    setTopicoForm(item.topicoId);
    setSubtopicoForm(item.subtopicoId);
    setEnunciadoForm(item.enunciado);
    setRespostaUsuarioForm(item.respostaUsuario);
    setRespostaCorretaForm(item.respostaCorreta);
    setComentarioForm(item.comentario);
    setPrioridadeForm(item.prioridade);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function excluirErro(item: ErroItem) {
    if (!window.confirm("Deseja excluir este erro?")) return;

    updateAppData((current: any) => {
      const materias = arr<any>(current?.materias).map((materia) => {
        if (safeString(materia.id) !== item.materiaId) return materia;

        return {
          ...materia,
          topicos: arr<any>(materia.topicos).map((topico) => {
            if (safeString(topico.id) !== item.topicoId) return topico;

            return {
              ...topico,
              subtopicos: arr<any>(topico.subtopicos).map((sub) => {
                if (safeString(sub.id) !== item.subtopicoId) return sub;

                const chave = item.origem === "questoesErradas" ? "questoesErradas" : "erros";
                return {
                  ...sub,
                  [chave]: arr<any>(sub[chave]).filter((erro) => safeString(erro.id) !== item.id),
                };
              }),
            };
          }),
        };
      });

      return { ...current, materias };
    });

    setStatus("Erro excluído.");
    reloadApp();
  }

  function corrigirRespostaAtual() {
    if (!erroAtual) return;

    setMostrarCorrecaoAtual(true);
    registrarMetricas({
      revisoesSequenciaisFeitas: stats.revisoesSequenciaisFeitas + 1,
    });
  }

  function avancarErro() {
    if (!filtrados.length) return;

    if (erroAtualIndex >= filtrados.length - 1) {
      setAnimacaoConclusao(true);
      setMostrarCorrecaoAtual(false);
      setRespostaTentativaAtual("");
      return;
    }

    setErroAtualIndex((prev) => prev + 1);
    setMostrarCorrecaoAtual(false);
    setRespostaTentativaAtual("");
  }

  function revisarAgora(item: ErroItem) {
    const index = filtrados.findIndex((erro) => erro.id === item.id);
    if (index >= 0) {
      setErroAtualIndex(index);
      setMostrarCorrecaoAtual(false);
      setAnimacaoConclusao(false);
      setRespostaTentativaAtual("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function enviarErroParaRevisao(item: ErroItem) {
    updateAppData((current: any) => {
      const payload = {
        id: uid("rev"),
        origem: "banco-de-erros",
        texto: item.enunciado,
        respostaCorreta: item.respostaCorreta,
        comentario: item.comentario,
        materiaNome: item.materiaNome,
        topicoNome: item.topicoNome,
        subtopicoNome: item.subtopicoNome,
        prioridade: item.prioridade,
        criadoEm: new Date().toISOString(),
      };

      return {
        ...current,
        revisoes: [...arr<any>(current?.revisoes), payload],
        revisaoInteligente: [...arr<any>(current?.revisaoInteligente), payload],
      };
    });

    setStatus("Enviado para revisão inteligente.");
    reloadApp();
  }

  async function gerarCadernoIA() {
    if (iaRequestLockRef.current || iaEmCooldown) return;

    iaRequestLockRef.current = true;
    setIaLoading(true);
    setIaErro("");
    setIaTreinoConcluido(false);
    setCadernoIA(null);
    setQuestaoAtualIA(0);
    setRespostaMarcadaIA(null);
    setQuestaoRespondidaIA(false);
    setFeedbackQuestaoIA("");

    const baseIA = errosAdaptativos
      .filter((e) => iaMateriaFiltro === "todas" || e.materiaNome === iaMateriaFiltro)
      .filter((e) => iaTopicoFiltro === "todos" || e.topicoNome === iaTopicoFiltro)
      .filter((e) => iaSubtopicoFiltro === "todos" || e.subtopicoNome === iaSubtopicoFiltro);

    const foco = baseIA.slice(0, Math.max(2, quantidadeQuestoesIA * 2));

    if (!foco.length) {
      setIaErro("Escolha matéria, tópico ou subtópico com erros cadastrados.");
      setIaLoading(false);
      iaRequestLockRef.current = false;
      return;
    }

    const prompt = [
      "Você é a IA do CP Focus, especialista em criar questões inéditas para concursos.",
      "Crie questões NOVAS e INÉDITAS baseadas nos erros do usuário, como uma banca de concurso criaria outra questão sobre o mesmo assunto.",
      "É proibido copiar ou reaproveitar o enunciado original. Se copiar, a resposta será inválida.",
      "É proibido copiar alternativas, resposta do usuário ou resposta correta crua. Crie alternativas novas, plausíveis e completas.",
      "Use o erro apenas para entender assunto, pegadinha e ponto fraco.",
      "Crie novo contexto, nova redação e alternativas reais.",
      "Modo: " + modoIA,
      "Dificuldade: " + dificuldadeIA,
      "Quantidade: " + quantidadeQuestoesIA,
      "Se modo cespe, use alternativas Certo e Errado.",
      "Se objetiva, use quatro alternativas.",
      "Retorne SOMENTE um objeto JSON válido. Não escreva introdução, markdown, comentário, explicação fora do JSON, nem texto antes/depois.",
      'Formato: {"titulo":"Treino adaptativo do banco de erros","questoes":[{"id":"1","enunciado":"...","alternativas":["...","...","...","..."],"correta":0,"explicacao":"...","modo":"objetiva"}]}'
    ].join("\n");

    const payload = {
      action: "banco_erros_criar_questoes_ineditas",
      prompt,
      userInput: prompt,
      snapshot: {
        materiaSelecionada: iaMateriaFiltro,
        topicoSelecionado: iaTopicoFiltro,
        subtopicoSelecionado: iaSubtopicoFiltro,
        quantidade: quantidadeQuestoesIA,
        dificuldade: dificuldadeIA,
        modo: modoIA as ModoIA,
        errosBase: foco.map((item, index) => ({
          numero: index + 1,
          materia: item.materiaNome,
          topico: item.topicoNome,
          subtopico: item.subtopicoNome,
          erroOriginal: item.enunciado,
          respostaUsuario: item.respostaUsuario,
          respostaCorreta: item.respostaCorreta,
          comentario: item.comentario,
        })),
      },
    };

    try {
      let response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        await delayIA(30000);
        response = await fetch("/api/gemini", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, action: "banco_erros_retry" }),
        });
      }

      const raw = await response.text();
      let parsed: any = raw;
      try {
        parsed = JSON.parse(raw);
      } catch {}

      if (!response.ok) throw new Error(deepText(parsed) || raw || "Erro na IA.");

      const caderno = parseCaderno(parsed) || parseCaderno(raw);
      if (!caderno) throw new Error("A IA respondeu fora do formato JSON. Tente gerar novamente; se persistir, o problema está na rota /api/gemini não repassando o texto bruto corretamente.");

      setCadernoIA(caderno);
      setStatus("Treino adaptativo gerado pela IA.");
      registrarMetricas({ simuladosIaFeitos: stats.treinosIaFeitos + 1 });
    } catch (error: any) {
      const mensagem = safeString(error?.message);
      if (mensagem.toLowerCase().includes("quota") || mensagem.toLowerCase().includes("exceeded") || mensagem.toLowerCase().includes("rate")) {
        setIaCooldownAte(Date.now() + 60000);
        setIaErro("A IA atingiu o limite temporário. Aguarde cerca de 1 minuto.");
      } else {
        setIaErro(mensagem || "Erro ao gerar questões.");
      }
    } finally {
      setIaLoading(false);
      iaRequestLockRef.current = false;
    }
  }

  function marcarAlternativa(index: number) {
    if (!questaoIAAtual || questaoRespondidaIA) return;

    const acertou = index === questaoIAAtual.correta;
    setRespostaMarcadaIA(index);
    setQuestaoRespondidaIA(true);
    setFeedbackQuestaoIA(acertou ? "certo" : "errado");

    registrarMetricas({
      questoesIaRespondidas: stats.questoesIaRespondidas + 1,
      acertosIa: stats.acertosIa + (acertou ? 1 : 0),
      errosIa: stats.errosIa + (acertou ? 0 : 1),
    });
  }

  function proximaQuestaoIA() {
    if (!cadernoIA) return;

    if (questaoAtualIA >= cadernoIA.questoes.length - 1) {
      setIaTreinoConcluido(true);
      setRespostaMarcadaIA(null);
      setQuestaoRespondidaIA(false);
      setFeedbackQuestaoIA("");
      return;
    }

    setQuestaoAtualIA((prev) => prev + 1);
    setRespostaMarcadaIA(null);
    setQuestaoRespondidaIA(false);
    setFeedbackQuestaoIA("");
  }

  function reiniciarTreinoIA() {
    setQuestaoAtualIA(0);
    setRespostaMarcadaIA(null);
    setQuestaoRespondidaIA(false);
    setFeedbackQuestaoIA("");
    setIaTreinoConcluido(false);
  }

  function salvarQuestaoIAComoErro() {
    if (!questaoIAAtual) return;
    setEnunciadoForm(questaoIAAtual.enunciado);
    setRespostaUsuarioForm(respostaMarcadaIA != null ? questaoIAAtual.alternativas[respostaMarcadaIA] : "");
    setRespostaCorretaForm(questaoIAAtual.alternativas[questaoIAAtual.correta] || "");
    setComentarioForm(questaoIAAtual.explicacao);
    setStatus("Questão da IA carregada no formulário. Escolha matéria, tópico e subtópico para salvar.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function enviarQuestaoIAParaRevisao() {
    if (!questaoIAAtual) return;

    updateAppData((current: any) => {
      const payload = {
        id: uid("revIA"),
        origem: "banco-de-erros-ia",
        texto: questaoIAAtual.enunciado,
        respostaCorreta: questaoIAAtual.alternativas[questaoIAAtual.correta],
        comentario: questaoIAAtual.explicacao,
        criadoEm: new Date().toISOString(),
      };

      return {
        ...current,
        revisoes: [...arr<any>(current?.revisoes), payload],
        revisaoInteligente: [...arr<any>(current?.revisaoInteligente), payload],
      };
    });

    setStatus("Questão da IA enviada para revisão inteligente.");
    reloadApp();
  }

  if (!mounted) {
    return <div className="min-h-screen bg-[#061029] p-6 text-white">Carregando Banco de Erros...</div>;
  }

  return (
<div className="cp-banco-premium min-h-screen text-white" style={{ background: "radial-gradient(circle at 18% 0%, rgba(108,123,255,0.22), transparent 26%), radial-gradient(circle at 82% 8%, rgba(0,224,255,0.16), transparent 24%), linear-gradient(180deg,#061029,#09122F 45%,#060D24)" }}>
      <style>{`
        /* CP_BANCO_PREMIUM_STYLE */
        .cp-banco-premium {
          background:
            radial-gradient(circle at 18% 0%, rgba(108,123,255,.26), transparent 28%),
            radial-gradient(circle at 82% 8%, rgba(0,224,255,.18), transparent 26%),
            linear-gradient(180deg,#050B22 0%,#091437 48%,#050B21 100%) !important;
        }

        .cp-banco-premium section,
        .cp-banco-premium aside > div {
          border-radius: 32px !important;
          border: 1px solid rgba(126,140,255,.24) !important;
          background: linear-gradient(180deg, rgba(18,24,77,.86), rgba(8,13,42,.92)) !important;
          box-shadow: 0 24px 80px rgba(0,0,0,.34) !important;
          backdrop-filter: blur(14px);
          transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease;
        }

        .cp-banco-premium section:hover,
        .cp-banco-premium aside > div:hover {
          transform: translateY(-3px);
          border-color: rgba(108,123,255,.46) !important;
          box-shadow: 0 30px 95px rgba(80,95,255,.18) !important;
        }

        .cp-banco-premium input,
        .cp-banco-premium textarea,
        .cp-banco-premium select {
          border-radius: 18px !important;
          border: 1px solid rgba(108,123,255,.28) !important;
          background: rgba(7,13,47,.92) !important;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.04) !important;
          transition: border-color .2s ease, box-shadow .2s ease, transform .2s ease;
        }

        .cp-banco-premium input:focus,
        .cp-banco-premium textarea:focus,
        .cp-banco-premium select:focus {
          border-color: rgba(108,123,255,.8) !important;
          box-shadow: 0 0 0 3px rgba(108,123,255,.18) !important;
        }

        .cp-banco-premium button {
          transition: transform .18s ease, box-shadow .18s ease, background .18s ease, border-color .18s ease;
        }

        .cp-banco-premium button:hover {
          transform: translateY(-1px) scale(1.02);
          box-shadow: 0 12px 30px rgba(108,123,255,.16);
          border-color: rgba(108,123,255,.55) !important;
        }

        .cp-banco-premium button:active {
          transform: scale(.98);
        }
      `}</style>

      <div className="mx-auto max-w-[1520px] px-4 py-6">
        <div className="rounded-[34px] border p-7 backdrop-blur-xl shadow-[0_30px_100px_rgba(0,0,0,0.42)] transition-all duration-300 animate-[fadeIn_0.35s_ease-out] transition-all duration-300" style={{ borderColor: "rgba(119,133,255,0.22)", background: "rgba(8,12,38,0.96)" }}>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-light tracking-tight tracking-tight">Banco de <span className="font-black">Erros</span></h1>
              <p className="mt-2 text-[#9FB0EC]">Organize, revise e transforme erros em treino inteligente.</p>
            </div>

            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar erro, matéria, tópico..."
              className="w-full max-w-[520px] rounded-full border px-6 py-4 bg-[#0B1240] focus:ring-2 focus:ring-[#6C7BFF]/40 transition-all outline-none"
              style={{ borderColor: "rgba(126,140,255,0.34)" }}
            />
          </div>

          {status ? <div className="mt-4 rounded-[18px] border border-emerald-400/20 bg-gradient-to-r from-[#5DFFB2] to-[#00E0FF]/10 px-4 py-3 text-sm">{status}</div> : null}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="text-2xl font-semibold">{filtrados.length} Erros Registrados</div>

            <select value={materiaFiltro} onChange={(e) => setMateriaFiltro(e.target.value)} className="rounded-xl bg-[#111843] px-3 py-2">
              <option value="todas">Matéria: Todas</option>
              {materiasFiltroDisponiveis.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>

            <select value={topicoFiltro} onChange={(e) => setTopicoFiltro(e.target.value)} className="rounded-xl bg-[#111843] px-3 py-2">
              <option value="todos">Tópico: Todos</option>
              {topicosFiltroDisponiveis.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>

            <select value={subtopicoFiltro} onChange={(e) => setSubtopicoFiltro(e.target.value)} className="rounded-xl bg-[#111843] px-3 py-2">
              <option value="todos">Subtópico: Todos</option>
              {subtopicosFiltroDisponiveis.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>

            <select value={prioridadeFiltro} onChange={(e) => setPrioridadeFiltro(e.target.value)} className="rounded-xl bg-[#111843] px-3 py-2">
              <option value="todas">Prioridade: Todas</option>
              <option value="leve">Leve</option>
              <option value="medio">Médio</option>
              <option value="critico">Crítico</option>
            </select>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            <main className="space-y-6">
              <section className="rounded-[32px] border p-6 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(80,95,255,0.18)]" style={{ borderColor: "rgba(126,140,255,0.20)", background: "rgba(18,24,77,0.75)" }}>
                <h2 className="text-2xl font-black tracking-tight">Revisão sequencial</h2>

                {animacaoConclusao ? (
                  <div className="mt-4 rounded-2xl bg-gradient-to-r from-[#5DFFB2] to-[#00E0FF]/10 p-6 text-center">
                    <div className="text-3xl font-black text-emerald-200">Concluído ✨</div>
                    <button onClick={() => { setAnimacaoConclusao(false); setErroAtualIndex(0); }} className="mt-4 rounded-[16px] px-4 py-2 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] border border-[#6C7BFF]/30 bg-[#141B55] hover:bg-[#1B236A] hover:scale-[1.03] active:scale-[0.98] transition-all">Recomeçar</button>
                  </div>
                ) : erroAtual ? (
                  <div className="mt-4 rounded-[24px] border p-5 bg-gradient-to-br from-[#0E1650] to-[#0A113A] shadow-[0_10px_40px_rgba(0,0,0,0.4)]" style={{ borderColor: "rgba(126,140,255,0.16)" }}>
                    <div className="text-sm text-[#9FB0EC]">{erroAtual.materiaNome} • {erroAtual.topicoNome} • {erroAtual.subtopicoNome}</div>
                    <div className="mt-3 text-xl font-semibold">{erroAtual.enunciado}</div>

                    <textarea value={respostaTentativaAtual} onChange={(e) => setRespostaTentativaAtual(e.target.value)} placeholder="Tente responder antes de ver a correção..." className="mt-4 min-h-[120px] w-full rounded-[20px] bg-[#0B1240] p-4 border border-[#2A3570] focus:ring-2 focus:ring-[#6C7BFF]/40 transition-all outline-none" />

                    <div className="mt-4 flex flex-wrap gap-3">
                      <button onClick={corrigirRespostaAtual} className="rounded-[16px] px-4 py-2 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] border border-[#6C7BFF]/30 bg-[#141B55] hover:bg-[#1B236A] hover:scale-[1.03] active:scale-[0.98] transition-all">Corrigir</button>
                      <button onClick={() => enviarErroParaRevisao(erroAtual)} className="rounded-[16px] px-4 py-2 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] border border-[#6C7BFF]/30 bg-[#141B55] hover:bg-[#1B236A] hover:scale-[1.03] active:scale-[0.98] transition-all">Enviar para revisão</button>
                      <button onClick={avancarErro} className="rounded-[16px] px-4 py-2 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] border border-[#6C7BFF]/30 bg-[#141B55] hover:bg-[#1B236A] hover:scale-[1.03] active:scale-[0.98] transition-all">Próximo</button>
                    </div>

                    {mostrarCorrecaoAtual ? (
                      <div className="mt-4 grid gap-3 md:grid-cols-3">
                        <div className="rounded-xl bg-red-400/10 p-3"><b>Sua resposta:</b><br />{erroAtual.respostaUsuario || "-"}</div>
                        <div className="rounded-xl bg-gradient-to-r from-[#5DFFB2] to-[#00E0FF]/10 p-3"><b>Correta:</b><br />{erroAtual.respostaCorreta || "-"}</div>
                        <div className="rounded-xl bg-white/5 p-3"><b>Explicação:</b><br />{erroAtual.comentario || "-"}</div>
                      </div>
                    ) : null}
                  </div>
                ) : <div className="mt-4 text-[#AAB8F0]">Nenhum erro encontrado.</div>}
              </section>

              <section className="rounded-[32px] border p-6 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(80,95,255,0.18)]" style={{ borderColor: "rgba(126,140,255,0.20)", background: "rgba(18,24,77,0.75)" }}>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black tracking-tight">Adicionar ou editar erro</h2>
                  {editando ? <button onClick={limparFormulario} className="rounded-xl border px-3 py-2">Cancelar edição</button> : null}
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-4">
                  <select value={materiaForm} onChange={(e) => { setMateriaForm(e.target.value); setTopicoForm(""); setSubtopicoForm(""); }} className="rounded-[16px] bg-[#0B1240] px-4 py-3 border border-[#2A3570] hover:border-[#6C7BFF]/40 transition">
                    <option value="">Selecione a matéria</option>
                    {materiasDisponiveis.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}
                  </select>

                  <select value={topicoForm} onChange={(e) => { setTopicoForm(e.target.value); setSubtopicoForm(""); }} className="rounded-[16px] bg-[#0B1240] px-4 py-3 border border-[#2A3570] hover:border-[#6C7BFF]/40 transition">
                    <option value="">Selecione o tópico</option>
                    {topicosFormDisponiveis.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}
                  </select>

                  <select value={subtopicoForm} onChange={(e) => setSubtopicoForm(e.target.value)} className="rounded-[16px] bg-[#0B1240] px-4 py-3 border border-[#2A3570] hover:border-[#6C7BFF]/40 transition">
                    <option value="">Selecione o subtópico</option>
                    {subtopicosFormDisponiveis.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}
                  </select>

                  <select value={prioridadeForm} onChange={(e) => setPrioridadeForm(e.target.value as PrioridadeErro)} className="rounded-[16px] bg-[#0B1240] px-4 py-3 border border-[#2A3570] hover:border-[#6C7BFF]/40 transition">
                    <option value="leve">Leve</option>
                    <option value="medio">Médio</option>
                    <option value="critico">Crítico</option>
                  </select>
                </div>

                <textarea value={enunciadoForm} onChange={(e) => setEnunciadoForm(e.target.value)} placeholder="Enunciado do erro" className="mt-3 min-h-[100px] w-full rounded-[20px] bg-[#0B1240] p-4 border border-[#2A3570] focus:ring-2 focus:ring-[#6C7BFF]/40 transition-all outline-none" />
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <textarea value={respostaUsuarioForm} onChange={(e) => setRespostaUsuarioForm(e.target.value)} placeholder="Resposta do usuário" className="min-h-[90px] rounded-[20px] bg-[#0B1240] p-4 border border-[#2A3570] focus:ring-2 focus:ring-[#6C7BFF]/40 transition-all outline-none" />
                  <textarea value={respostaCorretaForm} onChange={(e) => setRespostaCorretaForm(e.target.value)} placeholder="Resposta correta" className="min-h-[90px] rounded-[20px] bg-[#0B1240] p-4 border border-[#2A3570] focus:ring-2 focus:ring-[#6C7BFF]/40 transition-all outline-none" />
                </div>
                <textarea value={comentarioForm} onChange={(e) => setComentarioForm(e.target.value)} placeholder="Comentário / explicação" className="mt-3 min-h-[90px] w-full rounded-[20px] bg-[#0B1240] p-4 border border-[#2A3570] focus:ring-2 focus:ring-[#6C7BFF]/40 transition-all outline-none" />

                <button onClick={salvarErro} className="mt-4 rounded-[20px] px-6 py-3 font-semibold bg-gradient-to-r from-[#6C7BFF] to-[#8F9BFF] text-white shadow-[0_10px_30px_rgba(108,123,255,0.35)] hover:scale-[1.03] transition-all">{editando ? "Salvar edição" : "Adicionar erro"}</button>
              </section>

              <section className="rounded-[32px] border p-6 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(80,95,255,0.18)]" style={{ borderColor: "rgba(126,140,255,0.20)", background: "rgba(18,24,77,0.75)" }}>
                <h2 className="text-2xl font-black tracking-tight">IA do Banco de Erros</h2>
                <p className="mt-1 text-sm text-[#AAB8F0]">Gera treino adaptativo por matéria, tópico e subtópico.</p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <select value={iaMateriaFiltro} onChange={(e) => { setIaMateriaFiltro(e.target.value); setIaTopicoFiltro("todos"); setIaSubtopicoFiltro("todos"); }} className="rounded-[16px] bg-[#0B1240] px-4 py-3 border border-[#2A3570] hover:border-[#6C7BFF]/40 transition">
                    <option value="todas">IA: todas as matérias</option>
                    {materiasFiltroDisponiveis.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>

                  <select value={iaTopicoFiltro} onChange={(e) => { setIaTopicoFiltro(e.target.value); setIaSubtopicoFiltro("todos"); }} className="rounded-[16px] bg-[#0B1240] px-4 py-3 border border-[#2A3570] hover:border-[#6C7BFF]/40 transition">
                    <option value="todos">IA: todos os tópicos</option>
                    {iaTopicosDisponiveis.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>

                  <select value={iaSubtopicoFiltro} onChange={(e) => setIaSubtopicoFiltro(e.target.value)} className="rounded-[16px] bg-[#0B1240] px-4 py-3 border border-[#2A3570] hover:border-[#6C7BFF]/40 transition">
                    <option value="todos">IA: todos os subtópicos</option>
                    {iaSubtopicosDisponiveis.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>

                  <select value={quantidadeQuestoesIA} onChange={(e) => setQuantidadeQuestoesIA(Number(e.target.value))} className="rounded-[16px] bg-[#0B1240] px-4 py-3 border border-[#2A3570] hover:border-[#6C7BFF]/40 transition">
                    <option value={5}>5 questões</option>
                    <option value={8}>8 questões</option>
                    <option value={10}>10 questões</option>
                  </select>

                  <select value={dificuldadeIA} onChange={(e) => setDificuldadeIA(e.target.value as DificuldadeIA)} className="rounded-[16px] bg-[#0B1240] px-4 py-3 border border-[#2A3570] hover:border-[#6C7BFF]/40 transition">
                    <option value="facil">Fácil</option>
                    <option value="medio">Médio</option>
                    <option value="dificil">Difícil</option>
                  </select>

                  <select value={modoIA} onChange={(e) => setModoIA(e.target.value as ModoIA)} className="rounded-[16px] bg-[#0B1240] px-4 py-3 border border-[#2A3570] hover:border-[#6C7BFF]/40 transition">
                    <option value="objetiva">Objetiva</option>
                    <option value="cespe">CESPE</option>
                  </select>

                  <button onClick={gerarCadernoIA} disabled={iaLoading || iaEmCooldown} className="rounded-xl border px-4 py-3 disabled:opacity-60">
                    {iaLoading ? "✨ Gerando treino..." : iaEmCooldown ? "Aguarde " + segundosCooldown + "s" : "Gerar treino"}
                  </button>
                </div>

                {iaErro ? <div className="mt-4 rounded-xl bg-red-400/10 p-3 text-red-100">{iaErro}</div> : null}

                {iaTreinoConcluido && cadernoIA ? (
                  <div className="mt-5 rounded-2xl bg-gradient-to-r from-[#5DFFB2] to-[#00E0FF]/10 p-6 text-center">
                    <div className="text-3xl font-black text-emerald-200">Treino concluído ✨</div>
                    <button onClick={reiniciarTreinoIA} className="mt-4 rounded-[16px] px-4 py-2 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] border border-[#6C7BFF]/30 bg-[#141B55] hover:bg-[#1B236A] hover:scale-[1.03] active:scale-[0.98] transition-all">Refazer treino</button>
                  </div>
                ) : null}

                {cadernoIA && questaoIAAtual && !iaTreinoConcluido ? (
                  <div className="mt-5 rounded-[24px] border p-5 bg-gradient-to-br from-[#0E1650] to-[#0A113A] shadow-[0_10px_40px_rgba(0,0,0,0.4)] animate-[slideUp_0.28s_ease-out] transition-all duration-300" style={{ borderColor: "rgba(126,140,255,0.16)" }}>
                    <div className="text-sm text-[#9FB0EC]">{cadernoIA.titulo}</div>
                    <div className="mt-2 font-bold">Questão {questaoAtualIA + 1} de {cadernoIA.questoes.length}</div>
                    <div className="mt-4 text-lg font-semibold">{questaoIAAtual.enunciado}</div>

                    <div className="mt-4 space-y-3">
                      {questaoIAAtual.alternativas.map((alt, index) => {
                        const correta = index === questaoIAAtual.correta;
                        const marcada = respostaMarcadaIA === index;
                        const bg = questaoRespondidaIA && correta ? "rgba(72,190,118,0.18)" : questaoRespondidaIA && marcada ? "rgba(190,72,72,0.18)" : "rgba(17,24,67,0.74)";

                        return (
                          <button key={index} onClick={() => marcarAlternativa(index)} disabled={questaoRespondidaIA} className="block w-full rounded-[18px] border p-4 text-left transition-all duration-300 hover:scale-[1.012] hover:border-[#6C7BFF]/60 hover:shadow-[0_10px_30px_rgba(108,123,255,0.14)] active:scale-[0.99] transition-all duration-200 hover:scale-[1.01] hover:border-[#6C7BFF]/50 transition-all duration-300 hover:scale-[1.01] hover:border-[#6C7BFF]/50 active:scale-[0.99]" style={{ background: bg, borderColor: "rgba(126,140,255,0.18)" }}>
                            {modoIA === "cespe" ? "" : String.fromCharCode(65 + index) + ". "} {alt}
                          </button>
                        );
                      })}
                    </div>

                    {questaoRespondidaIA ? (
                      <div className="mt-4 rounded-[20px] bg-white/5 p-4 border border-white/10 shadow-[0_14px_42px_rgba(0,0,0,0.28)] transition-all duration-300 animate-pulse transition-all duration-300 animate-pulse animate-[slideUp_0.25s_ease-out] border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.22)]">
                        <div className="font-bold">{feedbackQuestaoIA === "certo" ? "✅ Você acertou" : "❌ Você errou"}</div>
                        <div className="mt-2">{questaoIAAtual.explicacao}</div>
                        <div className="mt-4 flex flex-wrap gap-3">
                          <button onClick={proximaQuestaoIA} className="rounded-[16px] px-4 py-2 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] border border-[#6C7BFF]/30 bg-[#141B55] hover:bg-[#1B236A] hover:scale-[1.03] active:scale-[0.98] transition-all">{questaoAtualIA >= cadernoIA.questoes.length - 1 ? "Concluir treino" : "Próxima questão"}</button>
                          <button onClick={salvarQuestaoIAComoErro} className="rounded-[16px] px-4 py-2 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] border border-[#6C7BFF]/30 bg-[#141B55] hover:bg-[#1B236A] hover:scale-[1.03] active:scale-[0.98] transition-all">Salvar como erro</button>
                          <button onClick={enviarQuestaoIAParaRevisao} className="rounded-[16px] px-4 py-2 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] border border-[#6C7BFF]/30 bg-[#141B55] hover:bg-[#1B236A] hover:scale-[1.03] active:scale-[0.98] transition-all">Enviar para revisão</button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </section>

              <section className="rounded-[32px] border p-6 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(80,95,255,0.18)]" style={{ borderColor: "rgba(126,140,255,0.20)", background: "rgba(18,24,77,0.75)" }}>
                <h2 className="text-2xl font-black tracking-tight">Desempenho do treino</h2>
                <div className="mt-4 rounded-2xl bg-white/5 p-4">
                  <div className="flex justify-between text-sm">
                    <span>Acertos: {stats.acertosIa}</span>
                    <span>Erros: {stats.errosIa}</span>
                    <span>{taxaAcertoIa}%</span>
                  </div>
                  <div className="mt-3 h-5 overflow-hidden rounded-full bg-[#111843]">
                    <div className="h-full bg-gradient-to-r from-[#5DFFB2] to-[#00E0FF]" style={{ width: taxaAcertoIa + "%" }} />
                  </div>
                </div>

                <h3 className="mt-5 font-bold">Ranking adaptativo dos erros</h3>
                <div className="mt-3 space-y-2">
                  {errosAdaptativos.slice(0, 5).map((erro) => (
                    <div key={erro.id} className="rounded-xl bg-white/5 p-3">
                      <div className="truncate font-semibold">{erro.enunciado}</div>
                      <div className="text-xs text-[#AAB8F0]">{erro.materiaNome} • {prioridadeLabel(erro.prioridade)}</div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[32px] border p-6 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(80,95,255,0.18)]" style={{ borderColor: "rgba(126,140,255,0.20)", background: "rgba(18,24,77,0.75)" }}>
                <h2 className="text-2xl font-black tracking-tight">Erros organizados</h2>

                <div className="mt-4 space-y-3">
                  {agrupados.map((materia: any) => (
                    <div key={materia.materiaNome} className="rounded-2xl border" style={{ borderColor: "rgba(126,140,255,0.16)" }}>
                      <button onClick={() => setMateriasAbertas((p) => ({ ...p, [materia.materiaNome]: !p[materia.materiaNome] }))} className="flex w-full justify-between p-4 text-left font-bold">
                        {materia.materiaNome}
                        <span>{materiasAbertas[materia.materiaNome] ? "−" : "+"}</span>
                      </button>

                      {materiasAbertas[materia.materiaNome] ? (
                        <div className="space-y-3 border-t p-3" style={{ borderColor: "rgba(126,140,255,0.10)" }}>
                          {materia.topicos.map((topico: any) => {
                            const topicoKey = materia.materiaNome + "||" + topico.topicoNome;
                            return (
                              <div key={topicoKey} className="rounded-xl bg-white/5">
                                <button onClick={() => setTopicosAbertos((p) => ({ ...p, [topicoKey]: !p[topicoKey] }))} className="flex w-full justify-between p-3 text-left">
                                  {topico.topicoNome}
                                  <span>{topicosAbertos[topicoKey] ? "−" : "+"}</span>
                                </button>

                                {topicosAbertos[topicoKey] ? (
                                  <div className="space-y-2 p-3">
                                    {topico.subtopicos.map((sub: any) => {
                                      const subKey = topicoKey + "||" + sub.subtopicoNome;
                                      return (
                                        <div key={subKey} className="rounded-xl bg-[#111843]">
                                          <button onClick={() => setSubtopicosAbertos((p) => ({ ...p, [subKey]: !p[subKey] }))} className="flex w-full justify-between p-3 text-left">
                                            {sub.subtopicoNome}
                                            <span>{subtopicosAbertos[subKey] ? "−" : "+"}</span>
                                          </button>

                                          {subtopicosAbertos[subKey] ? (
                                            <div className="space-y-2 p-3">
                                              {sub.itens.map((item: ErroItem) => (
                                                <div key={item.id} className="rounded-[18px] p-4 bg-gradient-to-br from-[#0F174A] to-[#0A1138] border border-[#2A3570] hover:border-[#6C7BFF]/40 transition-all duration-300 hover:translate-x-1 hover:shadow-[0_12px_35px_rgba(80,95,255,0.14)]">
                                                  <div className="font-semibold">{item.enunciado}</div>
                                                  <div className="mt-2 text-sm text-[#AAB8F0]">Prioridade: {prioridadeLabel(item.prioridade)}</div>
                                                  <div className="mt-3 flex flex-wrap gap-2">
                                                    <button onClick={() => revisarAgora(item)} className="rounded-lg border px-3 py-1 text-xs">Revisar</button>
                                                    <button onClick={() => enviarErroParaRevisao(item)} className="rounded-lg border px-3 py-1 text-xs">Revisão</button>
                                                    <button onClick={() => editarErro(item)} className="rounded-lg border px-3 py-1 text-xs">Editar</button>
                                                    <button onClick={() => excluirErro(item)} className="rounded-lg border px-3 py-1 text-xs">Excluir</button>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          ) : null}
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>
            </main>

            <aside className="space-y-6">
              <div className="rounded-[32px] border p-6 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(80,95,255,0.18)]" style={{ borderColor: "rgba(126,140,255,0.22)", background: "rgba(13,20,62,0.95)" }}>
                <div className="text-sm font-bold">Resumo rápido</div>
                <div className="mt-4 space-y-3">
                  <div className="rounded-xl bg-white/5 p-3">Total filtrado: <b>{filtrados.length}</b></div>
                  <div className="rounded-xl bg-white/5 p-3">Matérias com erro: <b>{materiasFiltroDisponiveis.length}</b></div>
                  <div className="rounded-xl bg-white/5 p-3">Taxa de acerto IA: <b>{taxaAcertoIa}%</b></div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
