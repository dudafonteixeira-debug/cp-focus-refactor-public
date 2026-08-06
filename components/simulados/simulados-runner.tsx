import type { SimuladoProva } from "@/lib/simulados-prova/engine";

type SimuladosRunnerProps = {
  finalizar: () => void;
  formatTime: (seconds: number) => string;
  progresso: number;
  questaoAtual: SimuladoProva["questoes"][number] | null;
  questaoEntrouEm: number;
  questaoIndex: number;
  responder: (altIndex: number) => void;
  respondidas: number;
  secondsLeft: number;
  simulado: SimuladoProva;
  trocarQuestao: (nextIndex: number) => void;
};

export function SimuladosRunner({
  finalizar,
  formatTime,
  progresso,
  questaoAtual,
  questaoEntrouEm,
  questaoIndex,
  responder,
  respondidas,
  secondsLeft,
  simulado,
  trocarQuestao,
}: SimuladosRunnerProps) {
  return (
    <section className="flex flex-col gap-5">
      <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-[22px] border border-cyan-300/20 bg-cyan-400/10 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200">Tempo</p>
            <strong className="mt-1 block text-2xl text-white">{formatTime(secondsLeft)}</strong>
          </div>

          <div className="rounded-[22px] border border-emerald-300/20 bg-emerald-400/10 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-200">Respondidas</p>
            <strong className="mt-1 block text-2xl text-white">{respondidas}/{simulado.questoes.length}</strong>
          </div>

          <div className="rounded-[22px] border border-violet-300/20 bg-violet-400/10 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-200">Progresso</p>
            <strong className="mt-1 block text-2xl text-white">{progresso}%</strong>
          </div>

          <div className="rounded-[22px] border border-rose-300/20 bg-rose-400/10 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-200">Tempo nesta</p>
            <strong className="mt-1 block text-xl text-white">
              {questaoAtual && questaoEntrouEm
                ? formatTime(
                    Number(simulado.temposPorQuestao?.[questaoAtual.id] || 0) +
                      Math.round((Date.now() - questaoEntrouEm) / 1000)
                  )
                : "00:00"}
            </strong>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {simulado.questoes.map((questao, index) => (
            <button
              key={questao.id}
              type="button"
              onClick={() => trocarQuestao(index)}
              className={
                questaoIndex === index
                  ? "h-9 w-9 rounded-xl bg-cyan-400 text-sm font-black text-slate-950"
                  : simulado.respostas[questao.id] !== undefined
                    ? "h-9 w-9 rounded-xl bg-emerald-500/70 text-sm font-black text-white"
                    : "h-9 w-9 rounded-xl bg-white/10 text-sm font-black text-white"
              }
            >
              {index + 1}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-[34px] border border-white/10 bg-white/[0.045] p-6">
        {questaoAtual ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="cp-os-badge-purple">{questaoAtual.materia}</span>
              <strong className="text-sm text-slate-300">Questao {questaoIndex + 1}</strong>
            </div>

            <h2 className="mt-6 text-2xl font-black leading-tight text-white">
              {questaoAtual.enunciado}
            </h2>

            <div className="mt-6 grid gap-3">
              {questaoAtual.alternativas.map((alternativa, altIndex) => {
                const marcada = simulado.respostas[questaoAtual.id] === altIndex;

                return (
                  <button
                    key={altIndex}
                    type="button"
                    onClick={() => responder(altIndex)}
                    className={
                      marcada
                        ? "rounded-[22px] border border-cyan-300/30 bg-cyan-500/15 p-4 text-left font-black text-cyan-100"
                        : "rounded-[22px] border border-white/10 bg-black/15 p-4 text-left font-bold text-slate-200 transition hover:bg-white/[0.06]"
                    }
                  >
                    {alternativa}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => trocarQuestao(Math.max(0, questaoIndex - 1))}
                className="cp-os-btn-soft"
              >
                Anterior
              </button>

              <button
                type="button"
                onClick={() =>
                  trocarQuestao(Math.min(simulado.questoes.length - 1, questaoIndex + 1))
                }
                className="cp-os-btn-primary"
              >
                Proxima
              </button>

              <button
                type="button"
                onClick={finalizar}
                className="cp-os-btn-soft"
              >
                Finalizar simulado
              </button>
            </div>
          </>
        ) : null}
      </section>
    </section>
  );
}
