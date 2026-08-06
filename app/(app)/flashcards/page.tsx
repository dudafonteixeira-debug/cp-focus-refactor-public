"use client";

import { todayKey as getTodayKey, toLocalDateKey } from "@/lib/date-utils";
import { useEffect, useMemo, useState } from "react";
import { listarFlashcards, salvarFlashcards } from "@/lib/flashcards-core";
import { saveFlashcardsLegacy } from "@/lib/data-access/app-repository";

type Nota = "dificil" | "regular" | "bom" | "excelente";

function arr(value: any): any[] {
  return Array.isArray(value) ? value : [];
}

function todayKey() {
  return getTodayKey();
}

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toLocalDateKey(date);
}

function proximaPorNota(nota: Nota) {
  if (nota === "dificil") return addDays(1);
  if (nota === "regular") return addDays(3);
  if (nota === "bom") return addDays(7);
  return addDays(15);
}

function labelNota(nota: Nota) {
  if (nota === "dificil") return "Dificil";
  if (nota === "regular") return "Regular";
  if (nota === "bom") return "Bom";
  return "Excelente";
}

export default function FlashcardsPage() {
  const [cards, setCards] = useState<any[]>([]);
  const [frente, setFrente] = useState("");
  const [verso, setVerso] = useState("");
  const [materia, setMateria] = useState("");
  const [deck, setDeck] = useState("");
  const [deckSelecionado, setDeckSelecionado] = useState<string | null>(null);
  const [modoRevisao, setModoRevisao] = useState(false);
  const [index, setIndex] = useState(0);
  const [virado, setVirado] = useState(false);
  const [status, setStatus] = useState("");

  async function carregar() {
    setCards(arr(await listarFlashcards()));
  }

  useEffect(() => {
    void carregar();
  }, []);

  const decks = useMemo(() => {
    const grupos: Record<string, any[]> = {};

    cards.forEach((card) => {
      const materiaNome = card.materia || "Geral";
      const deckNome = card.deck || "Principal";
      const chave = `${materiaNome}___${deckNome}`;

      if (!grupos[chave]) grupos[chave] = [];
      grupos[chave].push(card);
    });

    return Object.entries(grupos).map(([id, value]) => {
      const [materiaNome, deckNome] = id.split("___");
      const pendentes = value.filter(
        (card) => String(card.proximaRevisao || todayKey()) <= todayKey()
      );

      return {
        id,
        materia: materiaNome,
        deck: deckNome,
        cards: value,
        total: value.length,
        pendentes: pendentes.length,
      };
    });
  }, [cards]);

  const cardsFiltrados = deckSelecionado
    ? cards.filter((card) => `${card.materia || "Geral"}___${card.deck || "Principal"}` === deckSelecionado)
    : cards;

  const pendentes = cardsFiltrados.filter(
    (card) => String(card.proximaRevisao || todayKey()) <= todayKey()
  );

  const fila = modoRevisao ? pendentes : cardsFiltrados;
  const atual = fila[index] || null;

  const stats = {
    total: cards.length,
    decks: decks.length,
    pendentes: pendentes.length,
    revisados: cards.filter((card) => card.ultimaRevisao).length,
  };

  async function persistir(next: any[]) {
    await saveFlashcardsLegacy(next);
    setCards(next);
  }

  async function criarFlashcard() {
    if (!frente.trim() || !verso.trim()) {
      setStatus("Preencha frente e verso.");
      return;
    }

    const next = await salvarFlashcards([
      {
        pergunta: frente.trim(),
        resposta: verso.trim(),
        materia: materia.trim() || "Geral",
        deck: deck.trim() || "Principal",
      },
    ]);

    setCards(next);

    setFrente("");
    setVerso("");
    setMateria("");
    setDeck("");
    setStatus("Flashcard criado.");
    void carregar();
  }

  async function excluirCard(id: string) {
    await persistir(cards.filter((card) => String(card.id) !== String(id)));
    setStatus("Flashcard excluido.");
  }

  function iniciarRevisao(deckId?: string) {
    if (deckId) setDeckSelecionado(deckId);
    setModoRevisao(true);
    setIndex(0);
    setVirado(false);
    setStatus("");
  }

  async function avaliar(nota: Nota) {
    if (!atual) return;

    const next = cards.map((card) => {
      if (card.id !== atual.id) return card;

      const acertos = Number(card.acertos || 0) + (nota === "bom" || nota === "excelente" ? 1 : 0);
      const erros = Number(card.erros || 0) + (nota === "dificil" ? 1 : 0);

      return {
        ...card,
        ultimaNota: nota,
        ultimaRevisao: new Date().toISOString(),
        proximaRevisao: proximaPorNota(nota),
        acertos,
        erros,
        intervalo: nota === "dificil" ? 1 : nota === "regular" ? 3 : nota === "bom" ? 7 : 15,
      };
    });

    await persistir(next);

    if (index < fila.length - 1) {
      setIndex(index + 1);
      setVirado(false);
    } else {
      setModoRevisao(false);
      setIndex(0);
      setVirado(false);
      setStatus("Revisao finalizada.");
    }
  }

  return (
    <main className="cp-os-page">
      <section className="mx-auto flex w-full max-w-[1280px] flex-col gap-5 px-4 py-5 md:px-6">
        <header className="rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,rgba(18,26,72,.96),rgba(7,12,35,.98))] p-6 shadow-[0_28px_100px_rgba(0,0,0,.44)]">
          <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-violet-200">
            Memoria ativa
          </span>

          <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-5xl">
            Flashcards Anki
          </h1>

          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
            Biblioteca de decks por materia, revisao espacada e avaliacao de memoria.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                if (!pendentes.length) {
                  setStatus("Nenhum flashcard pendente para revisar hoje.");
                  return;
                }

                iniciarRevisao();
              }}
              className="cp-os-btn-primary"
            >
              Revisar pendentes
            </button>

            <button type="button" onClick={() => setDeckSelecionado(null)} className="cp-os-btn-soft">
              Ver todos
            </button>
          </div>
        </header>

        {status ? (
          <div className="rounded-[22px] border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm font-bold text-emerald-100">
            {status}
          </div>
        ) : null}

        <section className="grid gap-3 md:grid-cols-4">
          <div className="rounded-[22px] border border-cyan-300/20 bg-cyan-400/10 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200">Cards</p>
            <strong className="mt-1 block text-2xl text-white">{stats.total}</strong>
          </div>

          <div className="rounded-[22px] border border-violet-300/20 bg-violet-400/10 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-200">Decks</p>
            <strong className="mt-1 block text-2xl text-white">{stats.decks}</strong>
          </div>

          <div className="rounded-[22px] border border-amber-300/20 bg-amber-400/10 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-200">Pendentes</p>
            <strong className="mt-1 block text-2xl text-white">{stats.pendentes}</strong>
          </div>

          <div className="rounded-[22px] border border-emerald-300/20 bg-emerald-400/10 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-200">Revisados</p>
            <strong className="mt-1 block text-2xl text-white">{stats.revisados}</strong>
          </div>
        </section>

        {modoRevisao && atual ? (
          <section className="rounded-[34px] border border-cyan-300/20 bg-cyan-400/10 p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="cp-os-badge-blue">Sessao Anki</span>
                <h2 className="mt-3 text-2xl font-black text-white">
                  Card {index + 1} de {fila.length}
                </h2>

                <p className="mt-2 text-sm text-slate-300">
                  {atual.materia || "Geral"} - {atual.deck || "Principal"}
                </p>
              </div>

              <button type="button" onClick={() => setModoRevisao(false)} className="cp-os-btn-soft">
                Sair
              </button>
            </div>

            <button
              type="button"
              onClick={() => setVirado((v) => !v)}
              className="mx-auto block w-full max-w-[760px] rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,.98),rgba(30,41,59,.9))] p-8 text-left shadow-[0_30px_100px_rgba(0,0,0,.45)] transition hover:-translate-y-1"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">
                  {virado ? "Verso" : "Frente"}
                </p>

                <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-black text-slate-200">
                  {Math.round(((index + 1) / Math.max(1, fila.length)) * 100)}%
                </span>
              </div>

              <div className="mt-6 min-h-[220px] rounded-[28px] border border-white/10 bg-black/20 p-6">
                <h3 className="text-3xl font-black leading-tight text-white">
                  {virado ? atual.resposta || atual.verso : atual.pergunta || atual.frente}
                </h3>
              </div>

              <div className="mt-5">
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                    style={{ width: `${Math.round(((index + 1) / Math.max(1, fila.length)) * 100)}%` }}
                  />
                </div>

                <p className="mt-3 text-center text-sm font-bold text-slate-400">
                  Clique no card para virar
                </p>
              </div>
            </button>

            {virado ? (
              <div className="mt-6 grid gap-3 md:grid-cols-4">
                <button type="button" onClick={() => avaliar("dificil")} className="rounded-2xl bg-rose-600 px-5 py-4 font-black text-white">Dificil<span className="block text-xs opacity-80">amanha</span></button>
                <button type="button" onClick={() => avaliar("regular")} className="rounded-2xl bg-orange-500 px-5 py-4 font-black text-white">Regular<span className="block text-xs opacity-80">3 dias</span></button>
                <button type="button" onClick={() => avaliar("bom")} className="rounded-2xl bg-blue-600 px-5 py-4 font-black text-white">Bom<span className="block text-xs opacity-80">7 dias</span></button>
                <button type="button" onClick={() => avaliar("excelente")} className="rounded-2xl bg-emerald-600 px-5 py-4 font-black text-white">Excelente<span className="block text-xs opacity-80">15 dias</span></button>
              </div>
            ) : (
              <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.045] p-4 text-center text-sm text-slate-300">
                Tente responder mentalmente antes de virar.
              </div>
            )}
          </section>
        ) : (
          <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5">
              <span className="cp-os-badge-blue">Biblioteca</span>
              <h2 className="mt-3 text-2xl font-black text-white">Decks por materia</h2>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {decks.length ? (
                  decks.map((deckItem) => (
                    <article
                      key={deckItem.id}
                      className={deckSelecionado === deckItem.id ? "rounded-[28px] border border-cyan-300/30 bg-cyan-400/10 p-5" : "rounded-[28px] border border-white/10 bg-black/15 p-5"}
                    >
                      <div className="flex flex-wrap gap-2">
                        <span className="cp-os-badge-blue">{deckItem.materia}</span>
                        <span className="cp-os-badge-purple">{deckItem.deck}</span>
                      </div>

                      <h3 className="mt-4 text-2xl font-black text-white">{deckItem.total} cards</h3>
                      <p className="mt-2 text-sm text-slate-300">{deckItem.pendentes} pendentes hoje</p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button type="button" onClick={() => setDeckSelecionado(deckItem.id)} className="cp-os-btn-soft">
                          Abrir deck
                        </button>

                        <button type="button" onClick={() => iniciarRevisao(deckItem.id)} className="cp-os-btn-primary" disabled={!deckItem.pendentes}>
                          Revisar
                        </button>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="cp-os-empty">
                    <strong>Nenhum deck ainda</strong>
                    Crie o primeiro flashcard com materia e deck.
                  </div>
                )}
              </div>

              {deckSelecionado ? (
                <div className="mt-8">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <span className="cp-os-badge-purple">Deck selecionado</span>
                      <h3 className="mt-3 text-2xl font-black text-white">
                        {cardsFiltrados[0]?.materia || "Materia"} - {cardsFiltrados[0]?.deck || "Deck"}
                      </h3>
                    </div>

                    <button type="button" onClick={() => setDeckSelecionado(null)} className="cp-os-btn-soft">
                      Fechar
                    </button>
                  </div>

                  <div className="space-y-3">
                    {cardsFiltrados.map((card) => (
                      <article key={card.id} className="rounded-[24px] border border-white/10 bg-black/15 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <h3 className="text-lg font-black text-white">{card.pergunta || card.frente}</h3>
                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-300">{card.resposta || card.verso}</p>
                            <p className="mt-2 text-xs text-slate-500">
                              {card.proximaRevisao ? `Proxima revisao: ${card.proximaRevisao}` : "Novo card"}
                              {card.ultimaNota ? ` - ${labelNota(card.ultimaNota)}` : ""}
                            </p>
                          </div>

                          <button type="button" onClick={() => excluirCard(card.id)} className="cp-os-btn-soft">
                            Excluir
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <aside className="rounded-[30px] border border-violet-300/20 bg-violet-400/10 p-5">
              <span className="cp-os-badge-purple">Novo flashcard</span>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label>
                  <span className="mb-2 block text-sm font-black text-slate-300">Materia</span>
                  <input value={materia} onChange={(e) => setMateria(e.target.value)} className="h-12 w-full rounded-2xl border border-white/10 bg-[#07111f] px-4 text-sm text-white outline-none" placeholder="Ex: Constitucional" />
                </label>

                <label>
                  <span className="mb-2 block text-sm font-black text-slate-300">Deck</span>
                  <input value={deck} onChange={(e) => setDeck(e.target.value)} className="h-12 w-full rounded-2xl border border-white/10 bg-[#07111f] px-4 text-sm text-white outline-none" placeholder="Ex: Direitos fundamentais" />
                </label>
              </div>

              <label className="mt-4 block">
                <span className="mb-2 block text-sm font-black text-slate-300">Frente</span>
                <textarea value={frente} onChange={(e) => setFrente(e.target.value)} className="min-h-[100px] w-full rounded-2xl border border-white/10 bg-[#07111f] p-4 text-sm text-white outline-none" placeholder="Pergunta ou conceito..." />
              </label>

              <label className="mt-4 block">
                <span className="mb-2 block text-sm font-black text-slate-300">Verso</span>
                <textarea value={verso} onChange={(e) => setVerso(e.target.value)} className="min-h-[140px] w-full rounded-2xl border border-white/10 bg-[#07111f] p-4 text-sm text-white outline-none" placeholder="Resposta..." />
              </label>

              <button type="button" onClick={criarFlashcard} className="cp-os-btn-primary mt-5 w-full">
                Criar flashcard
              </button>
            </aside>
          </section>
        )}
      </section>
    </main>
  );
}

