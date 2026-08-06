"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{
        background:
          "radial-gradient(circle at top, rgba(14,165,233,0.16), transparent 28%), linear-gradient(180deg, #020617 0%, #0f172a 100%)",
      }}
    >
      <div
        className="w-full max-w-2xl rounded-[34px] p-8 md:p-10 text-center"
        style={{
          background: "rgba(255,255,255,0.98)",
          border: "1px solid rgba(226,232,240,1)",
          boxShadow: "0 40px 100px rgba(2,6,23,0.25)",
        }}
      >
        <div
          className="mx-auto inline-flex rounded-full px-4 py-1 text-xs font-extrabold uppercase tracking-[0.25em]"
          style={{ background: "#eff6ff", color: "#2563eb" }}
        >
          CP Focus
        </div>

        <h1 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight" style={{ color: "#0f172a" }}>
          Seu sistema de aprovação começa aqui
        </h1>

        <p className="mt-4 text-base md:text-lg" style={{ color: "#475569" }}>
          Monte sua base inicial, organize sua semana e transforme sua rotina em um plano que faça sentido de verdade.
        </p>

        <div className="mt-8 grid gap-3">
          <button
            onClick={() => router.push("/onboarding")}
            className="w-full rounded-2xl px-6 py-4 text-base font-semibold"
            style={{
              background: "linear-gradient(90deg, #0ea5e9 0%, #2563eb 100%)",
              color: "#ffffff",
              boxShadow: "0 10px 30px rgba(37,99,235,0.22)",
            }}
          >
            Começar introdução
          </button>

          <button
            onClick={() => router.push("/planejamento-inteligente")}
            className="w-full rounded-2xl px-6 py-4 text-base font-semibold"
            style={{
              background: "#ffffff",
              color: "#0f172a",
              border: "1px solid #cbd5e1",
            }}
          >
            Entrar direto no app
          </button>
        </div>
      </div>
    </div>
  );
}

