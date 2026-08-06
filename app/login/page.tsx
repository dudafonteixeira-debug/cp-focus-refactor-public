"use client";

import { useState } from "react";
import { signInWithEmail, signUpWithEmail } from "@/lib/auth/auth-service";
import { hasSupabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const [modo, setModo] = useState<"login" | "cadastro">("login");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [status, setStatus] = useState("");

  async function entrarLocal() {
    window.location.href = "/dashboard";
  }

  async function enviar() {
    setStatus("Processando...");

    if (!hasSupabase()) {
      setStatus("Supabase ainda nao configurado. Usando modo local.");
      window.setTimeout(() => {
        window.location.href = "/dashboard";
      }, 700);
      return;
    }

    try {
      if (modo === "login") {
        const result = await signInWithEmail(email, senha);

        if (result.error) {
          setStatus(result.error.message);
          return;
        }

        setStatus("Login realizado com sucesso.");
        window.location.href = "/dashboard";
        return;
      }

      const result = await signUpWithEmail(email, senha);

      if (result.error) {
        setStatus(result.error.message);
        return;
      }

      setStatus("Cadastro criado. Verifique seu email se a confirmacao estiver ativa.");
    } catch (error: any) {
      setStatus(error?.message || "Erro ao autenticar.");
    }
  }

  return (
    <main className="min-h-screen bg-[#07111f] px-4 py-10 text-white">
      <section className="mx-auto flex min-h-[80vh] w-full max-w-[1120px] items-center justify-center">
        <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="rounded-[36px] border border-white/10 bg-[linear-gradient(135deg,rgba(18,26,72,.96),rgba(7,12,35,.98))] p-8 shadow-[0_28px_100px_rgba(0,0,0,.44)]">
            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-cyan-200">
              CP Focus
            </span>

            <h1 className="mt-5 text-5xl font-black tracking-tight">
              Entre no seu sistema de aprovacao
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              Sua conta vai permitir salvar progresso, sincronizar dados, usar IA com controle de plano e acessar o CP Focus em outros dispositivos.
            </p>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                <strong>Plano inteligente</strong>
                <p className="mt-2 text-sm text-slate-400">Dashboard, Planner e Lyra conectados.</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                <strong>Dados seguros</strong>
                <p className="mt-2 text-sm text-slate-400">Base pronta para nuvem e backup.</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                <strong>Produto real</strong>
                <p className="mt-2 text-sm text-slate-400">Preparado para assinatura e app.</p>
              </div>
            </div>
          </div>

          <div className="rounded-[34px] border border-white/10 bg-white/[0.06] p-6 shadow-[0_28px_100px_rgba(0,0,0,.35)]">
            <h2 className="text-3xl font-black">
              {modo === "login" ? "Entrar" : "Criar conta"}
            </h2>

            <p className="mt-2 text-sm text-slate-300">
              Use email e senha para acessar sua conta.
            </p>

            <div className="mt-6 grid gap-3">
              <input
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                placeholder="Senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />

              <button
                type="button"
                onClick={enviar}
                className="rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 transition hover:scale-[1.01]"
              >
                {modo === "login" ? "Entrar" : "Cadastrar"}
              </button>

              <button
                type="button"
                onClick={() => setModo(modo === "login" ? "cadastro" : "login")}
                className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-black text-white"
              >
                {modo === "login" ? "Criar nova conta" : "Ja tenho conta"}
              </button>

              <button
                type="button"
                onClick={entrarLocal}
                className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-5 py-3 text-sm font-black text-cyan-100"
              >
                Continuar em modo local
              </button>

              {status ? (
                <p className="rounded-2xl border border-white/10 bg-black/20 p-3 text-sm text-slate-200">
                  {status}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}