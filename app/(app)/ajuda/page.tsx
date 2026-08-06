import Link from "next/link";

const guias = [
  {
    titulo: "Comece pelo Dashboard",
    texto: "O Dashboard mostra a tarefa certa do momento, revisoes pendentes, alertas da Lyra e o caminho mais rapido para estudar.",
    href: "/dashboard",
  },
  {
    titulo: "Use o Planejamento Inteligente",
    texto: "O planejamento decide o que estudar, revisar ou corrigir com base no seu perfil, erros, simulados e progresso.",
    href: "/planejamento-inteligente",
  },
  {
    titulo: "Estude no Centro de Estudos",
    texto: "Use materias, topicos e subtopicos para guardar conteudo, anotacoes, IA, erros e revisoes.",
    href: "/materias",
  },
  {
    titulo: "Treine com Questoes",
    texto: "Resolva questoes, corrija respostas e deixe o sistema alimentar seu Banco de Erros automaticamente.",
    href: "/questoes",
  },
  {
    titulo: "Faca Simulados",
    texto: "Use simulados reais, adaptativos e com IA para medir seu nivel e ajustar o plano de estudos.",
    href: "/simulados",
  },
  {
    titulo: "Revise antes de esquecer",
    texto: "A Revisao Inteligente organiza o que precisa voltar para sua memoria no momento certo.",
    href: "/revisao-inteligente",
  },
];

const perguntas = [
  {
    pergunta: "O que e o CP Focus?",
    resposta: "E um sistema de estudo inteligente que organiza conteudo, revisao, questoes, simulados, erros e planejamento em um fluxo unico.",
  },
  {
    pergunta: "Por onde devo comecar?",
    resposta: "Comece pelo Perfil e pelo Planejamento. Depois use o Dashboard para seguir a tarefa certa do dia.",
  },
  {
    pergunta: "O que a Lyra faz?",
    resposta: "A Lyra interpreta seu desempenho, detecta materias fracas, ajusta carga, sugere revisoes e ajuda o sistema a decidir o proximo passo.",
  },
  {
    pergunta: "Preciso decidir quando revisar?",
    resposta: "Nao. A Revisao Inteligente e o Planejamento indicam o que revisar com base no seu historico.",
  },
  {
    pergunta: "O simulado muda meu plano?",
    resposta: "Sim. Erros e desempenho em simulados alimentam o radar adaptativo, Banco de Erros, revisoes e flashcards.",
  },
];

export default function AjudaPage() {
  return (
    <main className="cp-os-page">
      <section className="cp-os-container">
        <div className="cp-os-hero cp-os-fade-up">
          <div className="cp-os-hero-inner">
            <span className="cp-os-eyebrow">Central de suporte</span>

            <h1 className="cp-os-title">Ajuda</h1>

            <p className="cp-os-subtitle">
              Entenda como usar o CP Focus como um sistema completo de estudo, nao apenas como um planner.
            </p>

            <div className="cp-os-toolbar">
              <div className="cp-os-actions">
                <Link href="/dashboard" className="cp-os-btn-primary">
                  Ir para o Dashboard
                </Link>

                <Link href="/perfil" className="cp-os-btn-soft">
                  Ajustar perfil
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-4">
          <div className="cp-os-metric">
            <p className="cp-os-metric-label">Metodo</p>
            <p className="cp-os-metric-value">CP</p>
            <p className="cp-os-metric-hint">Estudo guiado por desempenho.</p>
          </div>

          <div className="cp-os-metric">
            <p className="cp-os-metric-label">Fluxo</p>
            <p className="cp-os-metric-value">Unico</p>
            <p className="cp-os-metric-hint">Estudo, revisao, erros e simulados conectados.</p>
          </div>

          <div className="cp-os-metric">
            <p className="cp-os-metric-label">IA</p>
            <p className="cp-os-metric-value">Lyra</p>
            <p className="cp-os-metric-hint">Ajusta o caminho conforme seu perfil.</p>
          </div>

          <div className="cp-os-metric">
            <p className="cp-os-metric-label">Objetivo</p>
            <p className="cp-os-metric-value">Aprovar</p>
            <p className="cp-os-metric-hint">Menos decisao manual, mais execucao.</p>
          </div>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="cp-os-panel">
            <div>
              <span className="cp-os-badge-blue">Primeiros passos</span>

              <h2 className="mt-3 text-2xl font-black tracking-tight text-white">
                Como usar o CP Focus do jeito certo
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-300">
                O ideal e seguir o fluxo: preencher perfil, gerar plano, executar tarefas, revisar, corrigir erros e fazer simulados periodicos.
              </p>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {guias.map((guia) => (
                <Link
                  key={guia.titulo}
                  href={guia.href}
                  className="rounded-[26px] border border-white/10 bg-black/15 p-5 transition hover:border-cyan-300/25 hover:bg-white/[0.06]"
                >
                  <strong className="text-lg text-white">{guia.titulo}</strong>
                  <p className="mt-2 text-sm leading-7 text-slate-400">{guia.texto}</p>
                </Link>
              ))}
            </div>

            <div className="mt-6 rounded-[28px] border border-cyan-300/20 bg-cyan-400/10 p-5">
              <span className="cp-os-badge-blue">Metodo CP</span>

              <h3 className="mt-3 text-2xl font-black text-white">
                O ciclo correto
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-300">
                Estudo gera desempenho. Desempenho gera diagnostico. Diagnostico gera planejamento. Planejamento gera nova execucao. Esse ciclo e o diferencial do CP Focus.
              </p>
            </div>
          </section>

          <aside className="cp-os-ai-card p-6">
            <div className="cp-os-ai-orb">Lyra</div>

            <h2 className="mt-4 text-2xl font-black text-white">
              Perguntas frequentes
            </h2>

            <div className="mt-5 space-y-3">
              {perguntas.map((item) => (
                <details
                  key={item.pergunta}
                  className="rounded-2xl border border-white/10 bg-white/[0.05] p-4"
                >
                  <summary className="cursor-pointer text-sm font-black text-white">
                    {item.pergunta}
                  </summary>

                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    {item.resposta}
                  </p>
                </details>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}