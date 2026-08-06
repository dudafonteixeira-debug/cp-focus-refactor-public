export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">Página não encontrada</h1>
        <p className="mt-3 text-sm text-slate-600">
          A rota que você tentou abrir não existe mais ou foi movida.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="/dashboard"
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white"
          >
            Ir para dashboard
          </a>

          <a
            href="/materias"
            className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700"
          >
            Ir para matérias
          </a>
        </div>
      </div>
    </main>
  );
}

