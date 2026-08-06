"use client";

import { useState } from "react";
import { APP_PLANS } from "@/lib/plans";

export default function PlanosPage() {
  const [status, setStatus] = useState("");
  const planos = [
    APP_PLANS.free,
    APP_PLANS.premium_sem_ia,
    APP_PLANS.premium_com_ia,
  ];

  async function escolherPlano(planoId: string) {
    if (planoId === "free") {
      setStatus("Voce ja esta no plano gratuito.");
      return;
    }

    setStatus("Preparando checkout...");

    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planoId }),
      });

      const data = await response.json();

      if (data?.url) {
        window.location.href = data.url;
        return;
      }

      if (data?.plano) {
        setStatus(`${data.plano}: ${data?.error || "Checkout ainda nao esta ativo."}`);
        return;
      }

      setStatus(data?.error || "Checkout ainda nao esta ativo.");
    } catch {
      setStatus("Nao foi possivel iniciar o checkout agora.");
    }
  }

  return (
    <main className="cp-os-page">
      <section className="cp-os-container">
        <div className="cp-os-hero">
          <div className="cp-os-hero-inner">
            <span className="cp-os-eyebrow">Assinatura</span>
            <h1 className="cp-os-title">Planos CP Focus</h1>
            <p className="cp-os-subtitle">
              Escolha entre usar o CP Focus manualmente, liberar a plataforma completa sem IA ou ativar a Lyra com recursos inteligentes.
            </p>
          </div>
        </div>

        {status ? (
          <div className="mt-5 rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-4 text-sm font-bold text-cyan-100">
            {status}
          </div>
        ) : null}

        <div className="mt-6 grid gap-5 xl:grid-cols-3">
          {planos.map((plano) => (
            <section
              key={plano.id}
              className={
                plano.usaIA
                  ? "rounded-[32px] border border-cyan-300/25 bg-cyan-400/10 p-6 shadow-2xl shadow-cyan-950/20"
                  : "rounded-[32px] border border-white/10 bg-white/[0.05] p-6"
              }
            >
              <span className={plano.usaIA ? "cp-os-badge-blue" : "cp-os-badge-purple"}>
                {plano.usaIA ? "Com IA" : plano.preco > 0 ? "Premium" : "Entrada"}
              </span>

              <h2 className="mt-4 text-3xl font-black text-white">
                {plano.nome}
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-300">
                {plano.descricao}
              </p>

              <div className="mt-5">
                <span className="text-sm font-bold text-slate-400">R$</span>
                <strong className="ml-2 text-4xl font-black text-white">
                  {plano.preco.toFixed(2).replace(".", ",")}
                </strong>
                <span className="ml-2 text-sm text-slate-400">/mes</span>
              </div>

              <div className="mt-5 space-y-3">
                {plano.recursos.map((recurso) => (
                  <div
                    key={recurso}
                    className="rounded-2xl bg-white/[0.05] p-3 text-sm text-slate-200"
                  >
                    {recurso}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => escolherPlano(plano.id)}
                className={
                  plano.preco > 0
                    ? "cp-os-btn-primary mt-6 w-full"
                    : "cp-os-btn-soft mt-6 w-full"
                }
              >
                {plano.preco > 0 ? "Escolher plano" : "Plano gratuito"}
              </button>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}