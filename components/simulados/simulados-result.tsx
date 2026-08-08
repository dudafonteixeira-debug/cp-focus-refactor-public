import { corrigirSimuladoProva, type SimuladoProva } from "@/lib/simulados-prova/engine";

type ResultadoSimulado = ReturnType<typeof corrigirSimuladoProva>;

type DiagnosticoPosSimulado = {
  piorMateria: ResultadoSimulado["porMateria"][number] | undefined;
  melhorMateria: ResultadoSimulado["porMateria"][number] | undefined;
  tempoMedio: number;
  mensagem: string;
};

type SimuladosResultProps = {
  diagnostico: DiagnosticoPosSimulado | null;
  formatTime: (seconds: number) => string;
  novoSimulado: () => void;
  continuarFluxo?: () => void;
  resultado: ResultadoSimulado;
  simulado: SimuladoProva;
};

export function SimuladosResult({
  diagnostico,
  formatTime,
  novoSimulado,
  continuarFluxo,
  resultado,
  simulado,
}: SimuladosResultProps) {
  const questoesIA = simulado.questoes.filter(
    (questao) => !String(questao.id || "").includes("procedural")
  ).length;

  const questoesProcedurais = simulado.questoes.filter(
    (questao) => String(questao.id || "").includes("procedural")
  ).length;

  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
      <div className="rounded-[34px] border border-white/10 bg-white/[0.045] p-6">
        <span className="cp-os-badge-blue">Resultado</span>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="cp-os-badge-purple">IA: {questoesIA}</span>
          <span className="cp-os-badge-blue">
            Procedural: {questoesProcedurais}
          </span>
        </div>

        <h2 className="mt-3 text-3xl font-black text-white">
          {resultado.taxa}% de aproveitamento
        </h2>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-[22px] border border-emerald-300/20 bg-emerald-400/10 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-200">
              Acertos
            </p>
            <strong className="mt-1 block text-2xl text-white">
              {resultado.acertos}
            </strong>
          </div>

          <div className="rounded-[22px] border border-rose-300/20 bg-rose-400/10 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-200">
              Erros
            </p>
            <strong className="mt-1 block text-2xl text-white">
              {resultado.erros}
            </strong>
          </div>

          <div className="rounded-[22px] border border-cyan-300/20 bg-cyan-400/10 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">
              Total
            </p>
            <strong className="mt-1 block text-2xl text-white">
              {resultado.total}
            </strong>
          </div>
        </div>

        {diagnostico ? (
          <div className="mt-6 rounded-[26px] border border-cyan-300/20 bg-cyan-400/10 p-5">
            <span className="cp-os-badge-blue">Diagnostico Lyra</span>

            <p className="mt-3 text-sm leading-7 text-slate-300">
              {diagnostico.mensagem}
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-[22px] border border-rose-300/20 bg-rose-400/10 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-rose-200">
                  Mais critica
                </p>
                <strong className="mt-1 block text-lg text-white">
                  {diagnostico.piorMateria?.materia || "Sem dados"}
                </strong>
              </div>

              <div className="rounded-[22px] border border-emerald-300/20 bg-emerald-400/10 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-200">
                  Mais forte
                </p>
                <strong className="mt-1 block text-lg text-white">
                  {diagnostico.melhorMateria?.materia || "Sem dados"}
                </strong>
              </div>

              <div className="rounded-[22px] border border-violet-300/20 bg-violet-400/10 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-200">
                  Tempo medio
                </p>
                <strong className="mt-1 block text-lg text-white">
                  {formatTime(diagnostico.tempoMedio)}
                </strong>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-6 space-y-3">
          {resultado.porMateria.map((item) => (
            <article
              key={item.materia}
              className="rounded-[24px] border border-white/10 bg-black/15 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black text-white">
                    {item.materia}
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {item.acertos}/{item.total} acertos
                  </p>
                </div>

                <strong className="text-xl text-white">
                  {item.taxa}%
                </strong>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                  style={{ width: `${item.taxa}%` }}
                />
              </div>
            </article>
          ))}
        </div>
      </div>

      <aside className="rounded-[30px] border border-cyan-300/20 bg-cyan-400/10 p-5">
        <span className="cp-os-badge-blue">Lyra</span>

        <h2 className="mt-3 text-2xl font-black text-white">
          Diagnostico do simulado
        </h2>

        <p className="mt-3 text-sm leading-7 text-slate-300">
          Use este resultado como mapa de partida. Materias com menor taxa devem subir no planejamento, revisao e flashcards.
        </p>

        {continuarFluxo ? (
          <button
            type="button"
            onClick={continuarFluxo}
            className="cp-os-btn-primary mt-5 w-full"
          >
            Continuar fluxo
          </button>
        ) : null}

        <button
          type="button"
          onClick={novoSimulado}
          className="cp-os-btn-primary mt-5 w-full"
        >
          Fazer novo simulado
        </button>
      </aside>
    </section>
  );
}


