"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import GuidedFlowWidget from "@/components/guided-flow-widget";
import { getSidebarState, setSidebarState } from "@/lib/sidebar";
import { loadGamificacao } from "@/lib/gamificacao";

const itens = [
  { href: "/dashboard", label: "Dashboard", icon: "D", group: "NUCLEO" },
  { href: "/planejamento-inteligente", label: "Planejamento", icon: "P", group: "NUCLEO" },
  { href: "/modo-foco", label: "Modo Foco", icon: "F", group: "NUCLEO" },
  { href: "/materias", label: "Centro de Estudos", icon: "E", group: "NUCLEO" },
  { href: "/revisao-inteligente", label: "Revisao Inteligente", icon: "R", group: "NUCLEO" },
  { href: "/banco-de-erros", label: "Banco de Erros", icon: "B", group: "NUCLEO" },

  { href: "/inteligencia", label: "Adaptive AI", icon: "AI", group: "INTELIGENCIA" },
  { href: "/evolucao", label: "Evolucao", icon: "EV", group: "INTELIGENCIA" },
  { href: "/recuperacao", label: "Recuperacao", icon: "RC", group: "INTELIGENCIA" },

  { href: "/simulados", label: "Simulados", icon: "S", group: "FERRAMENTAS" },
  { href: "/flashcards", label: "Flashcards", icon: "FC", group: "FERRAMENTAS" },
  { href: "/questoes", label: "Questoes", icon: "Q", group: "FERRAMENTAS" },
  { href: "/perfil", label: "Perfil", icon: "PF", group: "FERRAMENTAS" },
  { href: "/ajuda", label: "Ajuda", icon: "?", group: "FERRAMENTAS" },
  { href: "/planos", label: "Planos", icon: "$", group: "FERRAMENTAS" },
];

const ordemGrupos = ["NUCLEO", "INTELIGENCIA", "FERRAMENTAS"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [game, setGame] = useState({ xp: 0, nivel: 1, streak: 0 });

  useEffect(() => {
    async function refreshGame() {
      setGame(await loadGamificacao());
    }

    setOpen(getSidebarState());
    refreshGame();

    window.addEventListener("focus", refreshGame);
    window.addEventListener("cp-focus-gamificacao-updated", refreshGame as EventListener);

    return () => {
      window.removeEventListener("focus", refreshGame);
      window.removeEventListener("cp-focus-gamificacao-updated", refreshGame as EventListener);
    };
  }, []);

  function toggle() {
    const next = !open;
    setOpen(next);
    setSidebarState(next);
  }

  const grupos = useMemo(() => {
    return itens.reduce<Record<string, typeof itens>>((acc, item) => {
      acc[item.group] = acc[item.group] || [];
      acc[item.group].push(item);
      return acc;
    }, {});
  }, []);

  return (
    <div className="min-h-screen overflow-hidden bg-[#050816] text-white">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_15%_0%,rgba(79,140,255,0.22),transparent_30%),radial-gradient(circle_at_88%_8%,rgba(139,92,246,0.18),transparent_28%),linear-gradient(180deg,#050816_0%,#071028_52%,#030615_100%)]" />

      <div className="relative z-10 flex min-h-screen w-full overflow-x-hidden">
        <aside className={open ? "relative w-[292px] shrink-0 border-r border-white/10 bg-[#07111f]/88 backdrop-blur-2xl transition-all duration-300" : "relative w-[86px] shrink-0 border-r border-white/10 bg-[#07111f]/88 backdrop-blur-2xl transition-all duration-300"}>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-cyan-300/35 to-transparent" />

          <div className="flex h-full flex-col p-3">
            <div className="mb-4 rounded-[26px] border border-white/10 bg-white/[0.055] p-3 shadow-2xl shadow-black/25">
              <div className="flex items-center gap-3">
                <button type="button" onClick={toggle} className="grid h-12 w-12 shrink-0 place-items-center rounded-[20px] border border-blue-300/20 bg-gradient-to-br from-blue-600/70 to-violet-700/70 text-xl text-white shadow-lg shadow-blue-950/30 transition hover:-translate-y-0.5" aria-label="Alternar menu">
                  =
                </button>

                {open ? (
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-200">CP Focus OS</p>
                    <h1 className="truncate text-lg font-black tracking-tight">Sistema de Estudos</h1>
                  </div>
                ) : null}
              </div>

              {open ? (
                <div className="mt-4 rounded-[22px] border border-white/10 bg-black/15 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Progresso diario</span>
                    <strong className="text-xs text-cyan-200">Ativo</strong>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-2xl bg-white/[0.055] px-3 py-2">
                      <p className="text-slate-400">Sequencia</p>
                      <strong>ST {game.streak} dia(s)</strong>
                    </div>

                    <div className="rounded-2xl bg-white/[0.055] px-3 py-2">
                      <p className="text-slate-400">Nivel</p>
                      <strong>LV {game.nivel}</strong>
                    </div>
                  </div>

                  <div className="mt-2 rounded-2xl bg-white/[0.055] px-3 py-2 text-xs">
                    <p className="text-slate-400">XP total</p>
                    <strong>XP {game.xp} XP</strong>
                  </div>
                </div>
              ) : null}
            </div>

            <nav className="min-h-0 flex-1 overflow-y-auto pr-1">
              {ordemGrupos.map((grupo) => {
                const links = grupos[grupo] || [];

                return (
                  <div key={grupo} className="mb-5">
                    {open ? (
                      <div className="mb-2 flex items-center gap-2 px-3">
                        <span className="h-px flex-1 bg-white/10" />
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
                          {grupo}
                        </p>
                        <span className="h-px flex-1 bg-white/10" />
                      </div>
                    ) : null}

                    <div className="space-y-1.5">
                      {links.map((item) => {
                        const ativo = pathname === item.href || pathname?.startsWith(item.href + "/");

                        return (
                          <Link key={item.href} href={item.href} title={item.label} className={ativo ? "group relative flex items-center gap-3 overflow-hidden rounded-[22px] border border-blue-300/25 bg-gradient-to-r from-blue-600/90 to-violet-700/90 px-3 py-3 font-black text-white shadow-lg shadow-blue-950/30" : "group relative flex items-center gap-3 rounded-[22px] border border-transparent px-3 py-3 font-bold text-slate-300 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/[0.065] hover:text-white"}>
                            {ativo ? <span className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-cyan-200 shadow-[0_0_18px_rgba(103,232,249,0.9)]" /> : null}

                            <span className={ativo ? "grid h-10 w-10 shrink-0 place-items-center rounded-[18px] bg-white/15 text-lg shadow-inner" : "grid h-10 w-10 shrink-0 place-items-center rounded-[18px] bg-white/[0.055] text-lg transition group-hover:bg-white/10"}>
                              {item.icon}
                            </span>

                            {open ? <span className="min-w-0 flex-1 truncate text-sm">{item.label}</span> : null}
                            {open && ativo ? <span className="h-2 w-2 rounded-full bg-cyan-200 shadow-[0_0_14px_rgba(103,232,249,0.9)]" /> : null}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </nav>

            <div className="mt-3 rounded-[26px] border border-fuchsia-300/20 bg-gradient-to-br from-violet-950/50 via-[#10183d]/70 to-blue-950/50 p-3 shadow-2xl shadow-fuchsia-950/20">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[18px] bg-gradient-to-br from-fuchsia-500 to-blue-600 shadow-lg shadow-fuchsia-950/30">AI</div>

                {open ? (
                  <div className="min-w-0">
                    <p className="text-xs font-black text-fuchsia-100">Lyra IA</p>
                    <p className="truncate text-[11px] text-slate-300">Mentor inteligente do CP Focus</p>
                  </div>
                ) : null}
              </div>

              {open ? <Link href="/ia" className="mt-3 flex h-10 items-center justify-center rounded-2xl bg-white/10 text-xs font-black text-white transition hover:bg-white/15">Abrir central IA</Link> : null}
            </div>
          </div>
        </aside>

        <main className="relative min-w-0 flex-1 overflow-x-hidden p-4 md:p-6">
          <div className="mx-auto w-full max-w-[1600px]">{children}</div>
        </main>

        <GuidedFlowWidget />
      </div>
    </div>
  );
}
