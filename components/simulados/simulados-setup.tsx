import { MODELOS_SIMULADO_PROVA, type SimuladoProva } from "@/lib/simulados-prova/engine";

type Modo = "certo_errado" | "multipla_escolha";

type DistribuicaoItem = {
  materia: string;
  quantidade: number;
};

type SimuladosSetupProps = {
  adaptativoAtivo: boolean;
  distribuicaoPreview: DistribuicaoItem[];
  gerando: boolean;
  historicoSimulados: SimuladoProva[];
  idiomaSelecionado: "Ingles" | "Espanhol";
  iniciarSimulado: () => void;
  modeloId: string;
  modoSelecionado: Modo;
  setAdaptativoAtivo: (valor: boolean) => void;
  setIdiomaSelecionado: (valor: "Ingles" | "Espanhol") => void;
  setModeloId: (valor: string) => void;
  setModoSelecionado: (valor: Modo) => void;
  statusIA: string;
};

export function SimuladosSetup({
  adaptativoAtivo,
  distribuicaoPreview,
  gerando,
  historicoSimulados,
  idiomaSelecionado,
  iniciarSimulado,
  modeloId,
  modoSelecionado,
  setAdaptativoAtivo,
  setIdiomaSelecionado,
  setModeloId,
  setModoSelecionado,
  statusIA,
}: SimuladosSetupProps) {
  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5">
        <span className="cp-os-badge-blue">Modelo de prova</span>
        <h2 className="mt-3 text-2xl font-black text-white">Escolha o simulado</h2>

        <div className="mt-5 grid gap-3">
          {MODELOS_SIMULADO_PROVA.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setModeloId(item.id)}
              className={
                modeloId === item.id
                  ? "rounded-[26px] border border-cyan-300/30 bg-cyan-400/10 p-5 text-left"
                  : "rounded-[26px] border border-white/10 bg-black/15 p-5 text-left transition hover:border-cyan-300/20"
              }
            >
              <h3 className="text-xl font-black text-white">{item.nome}</h3>
              <p className="mt-2 text-sm text-slate-300">{item.banca} - {item.cargo}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="cp-os-badge-blue">{item.totalQuestoes} questoes</span>
                <span className="cp-os-badge-purple">{item.duracaoMinutos}min</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <aside className="rounded-[30px] border border-rose-300/20 bg-rose-400/10 p-5">
        <span className="cp-os-badge-red">Gerador IA</span>
        <h2 className="mt-3 text-2xl font-black text-white">Nova prova inedita</h2>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          Escolha o modo. A IA deve gerar questoes novas a cada simulado, respeitando a distribuicao por materia.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2">
          {(["certo_errado", "multipla_escolha"] as const).map((modo) => (
            <button
              key={modo}
              type="button"
              onClick={() => setModoSelecionado(modo)}
              className={
                modoSelecionado === modo
                  ? "rounded-2xl border border-cyan-300/30 bg-cyan-400/10 px-4 py-3 text-sm font-black text-cyan-100"
                  : "rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-sm font-black text-slate-300"
              }
            >
              {modo === "certo_errado" ? "Certo/Errado" : "Multipla escolha"}
            </button>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          {(["Ingles", "Espanhol"] as const).map((idioma) => (
            <button
              key={idioma}
              type="button"
              onClick={() => setIdiomaSelecionado(idioma)}
              className={
                idiomaSelecionado === idioma
                  ? "rounded-2xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-3 text-sm font-black text-emerald-100"
                  : "rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-sm font-black text-slate-300"
              }
            >
              {idioma}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setAdaptativoAtivo(!adaptativoAtivo)}
          className={
            adaptativoAtivo
              ? "mt-5 w-full rounded-2xl border border-cyan-300/30 bg-cyan-400/10 px-4 py-3 text-sm font-black text-cyan-100"
              : "mt-5 w-full rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-sm font-black text-slate-300"
          }
        >
          {adaptativoAtivo ? "Modo adaptativo Lyra ligado" : "Ativar modo adaptativo Lyra"}
        </button>

        <div className="mt-5 rounded-[24px] border border-white/10 bg-black/15 p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-200">
            {adaptativoAtivo ? "Distribuicao adaptativa Lyra" : "Distribuicao padrao da prova"}
          </p>
          <div className="mt-3 space-y-2">
            {distribuicaoPreview.map((item) => (
              <div key={item.materia} className="flex items-center justify-between text-sm">
                <span className="text-slate-300">{item.materia}</span>
                <strong className="text-white">{item.quantidade}</strong>
              </div>
            ))}
          </div>
        </div>

        {historicoSimulados.length ? (
          <div className="mt-5 rounded-[24px] border border-white/10 bg-black/15 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-200">Historico recente</p>
            <div className="mt-3 space-y-2">
              {historicoSimulados.map((item) => {
                const total = item.questoes?.length || 0;
                const acertos = item.questoes?.filter((questao) =>
                  item.respostas?.[questao.id] === questao.correta
                ).length || 0;
                const taxa = total ? Math.round((acertos / total) * 100) : 0;

                return (
                  <div key={item.id} className="flex items-center justify-between rounded-2xl bg-white/[0.04] px-3 py-2 text-sm">
                    <span className="text-slate-300">
                      {String(item.finalizadoEm || item.iniciadoEm || "").slice(0, 10)}
                    </span>
                    <strong className="text-white">{taxa}%</strong>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={iniciarSimulado}
          disabled={gerando}
          className="cp-os-btn-primary mt-5 w-full"
        >
          {gerando ? "Gerando prova..." : "Gerar nova prova"}
        </button>

        {statusIA ? (
          <p className="mt-3 text-center text-xs font-bold text-slate-300">{statusIA}</p>
        ) : null}
      </aside>
    </section>
  );
}
