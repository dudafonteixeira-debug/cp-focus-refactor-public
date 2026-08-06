"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro global do app:", error);
  }, [error]);

  return (
    <html>
      <body className="min-h-screen bg-slate-100">
        <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center p-6">
          <div className="w-full rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <h1 className="text-2xl font-bold text-slate-900">
              O app encontrou um erro
            </h1>
            <p className="mt-3 text-sm text-slate-600">
              A estrutura principal continua protegida. Clique abaixo para tentar novamente.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => reset()}
                className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white"
              >
                Tentar novamente
              </button>

              <a
                href="/dashboard"
                className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700"
              >
                Ir para dashboard
              </a>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-xs text-slate-500">
              {error.message}
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}

