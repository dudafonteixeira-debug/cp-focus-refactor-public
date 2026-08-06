export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-5xl rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-56 rounded bg-slate-200" />
          <div className="h-4 w-80 rounded bg-slate-200" />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="h-28 rounded-3xl bg-slate-200" />
            <div className="h-28 rounded-3xl bg-slate-200" />
            <div className="h-28 rounded-3xl bg-slate-200" />
          </div>
        </div>
      </div>
    </main>
  );
}

