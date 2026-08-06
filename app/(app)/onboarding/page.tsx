"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CONCURSOS_PRESET, getConcursoPreset } from "@/lib/concursos";
import { instalarPresetConcurso } from "@/lib/concursos/service";
import {
  getOnboardingOs,
  saveOnboardingOs,
} from "@/lib/data-access/app-repository";
import { persistPlanningBrain } from "@/lib/planning-state";


type OnboardingData = {
  nome: string;
  concursoId: string;
  concurso: string;
  horasDia: string;
  diasSemana: string[];
  horarioPreferido: string;
  dificuldade: string;
};

const dias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"];

const initialData: OnboardingData = {
  nome: "",
  concursoId: "prf",
  concurso: "PRF",
  horasDia: "2",
  diasSemana: ["Seg", "Ter", "Qua", "Qui", "Sex"],
  horarioPreferido: "Noite",
  dificuldade: "",
};

export default function OnboardingPage() {
  const [data, setData] = useState<OnboardingData>(initialData);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void (async () => {
      const saved = await getOnboardingOs<Partial<OnboardingData> | null>(null);

      if (saved) {
        setData({ ...initialData, ...saved });
      }
    })();
  }, []);

  function update<K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) {
    setData((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  function selecionarConcurso(id: string) {
    const preset = getConcursoPreset(id);

    setData((current) => ({
      ...current,
      concursoId: id,
      concurso: preset?.nome || current.concurso,
    }));

    setSaved(false);
  }

  function toggleDia(dia: string) {
    const atual = data.diasSemana.includes(dia)
      ? data.diasSemana.filter((item) => item !== dia)
      : [...data.diasSemana, dia];

    update("diasSemana", atual);
  }

  async function montarSistema() {
    const preset = getConcursoPreset(data.concursoId);

    if (preset) {
      instalarPresetConcurso(preset);

      const brain = {
        concurso: preset.nome,
        horasDia: data.horasDia,
        diasSemana: data.diasSemana,
        periodo: data.horarioPreferido,
        materias: preset.materias.map((materia: any, index: number) => ({
          materiaId: `preset-mat-pending-${index}`,
          nome: materia.nome,
          ativa: true,
          peso: materia.peso,
          ordem: materia.ordem,
          prioridade: materia.prioridade,
        })),
      };

      await persistPlanningBrain(brain);
    }

    await saveOnboardingOs({
      ...data,
      concluido: true,
      updatedAt: new Date().toISOString(),
    });

    setSaved(true);
  }

  return (
    <main className="cp-os-page">
      <section className="cp-os-container space-y-6">
        <div className="cp-os-hero">
          <div className="cp-os-hero-inner">
            <span className="cp-os-eyebrow">Configuracao inicial</span>
            <h1 className="cp-os-title">Monte seu sistema em poucos minutos.</h1>
            <p className="cp-os-subtitle">
              Escolha o concurso, informe sua rotina e o CP Focus cria materias, pesos, prioridades e base do planejamento.
            </p>
          </div>
        </div>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="cp-os-panel space-y-6">
            <div>
              <span className="mb-3 block text-sm font-black text-slate-300">
                Concurso alvo
              </span>

              <div className="grid gap-3 md:grid-cols-2">
                {CONCURSOS_PRESET.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => selecionarConcurso(preset.id)}
                    className={
                      data.concursoId === preset.id
                        ? "rounded-[26px] border border-cyan-300/40 bg-cyan-400/10 p-5 text-left shadow-[0_18px_60px_rgba(56,189,248,.16)]"
                        : "rounded-[26px] border border-white/10 bg-white/[0.045] p-5 text-left transition hover:bg-white/[0.07]"
                    }
                  >
                    <p className="text-xl font-black text-white">{preset.nome}</p>
                    <p className="mt-1 text-sm text-slate-400">Banca: {preset.banca}</p>
                    <p className="mt-3 text-xs text-cyan-100">
                      {preset.materias.length} materias iniciais
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <span className="mb-2 block text-sm font-black text-slate-300">Nome</span>
                <input
                  className="cp-os-input"
                  value={data.nome}
                  onChange={(e) => update("nome", e.target.value)}
                  placeholder="Seu nome"
                />
              </label>

              <label>
                <span className="mb-2 block text-sm font-black text-slate-300">Horas por dia</span>
                <input
                  className="cp-os-input"
                  value={data.horasDia}
                  onChange={(e) => update("horasDia", e.target.value)}
                  placeholder="Ex: 2"
                />
              </label>

              <label>
                <span className="mb-2 block text-sm font-black text-slate-300">Melhor periodo</span>
                <select
                  className="cp-os-select"
                  value={data.horarioPreferido}
                  onChange={(e) => update("horarioPreferido", e.target.value)}
                >
                  <option>Manha</option>
                  <option>Tarde</option>
                  <option>Noite</option>
                  <option>Madrugada</option>
                  <option>Variavel</option>
                </select>
              </label>

              <div>
                <span className="mb-2 block text-sm font-black text-slate-300">Dias disponiveis</span>
                <div className="flex flex-wrap gap-2">
                  {dias.map((dia) => (
                    <button
                      key={dia}
                      type="button"
                      onClick={() => toggleDia(dia)}
                      className={data.diasSemana.includes(dia) ? "cp-os-btn-primary" : "cp-os-btn-soft"}
                    >
                      {dia}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <label>
              <span className="mb-2 block text-sm font-black text-slate-300">
                Maior dificuldade hoje
              </span>
              <textarea
                className="cp-os-textarea"
                value={data.dificuldade}
                onChange={(e) => update("dificuldade", e.target.value)}
                placeholder="Ex: constancia, revisao, resolver questoes, organizar rotina..."
              />
            </label>

            <div className="flex flex-wrap gap-3">
              <button onClick={montarSistema} className="cp-os-btn-primary">
                Montar meu sistema
              </button>

              <Link href="/dashboard" className="cp-os-btn-soft">
                Voltar ao Dashboard
              </Link>
            </div>

            {saved ? (
              <div className="cp-os-card-flat p-4 text-sm font-bold text-emerald-200">
                Sistema criado. Agora abra o Planejamento para gerar o primeiro plano do dia.
              </div>
            ) : null}
          </div>

          <aside className="cp-os-ai-card p-6">
            <div className="cp-os-ai-orb">*</div>
            <h2 className="mt-4 text-2xl font-black text-white">O que sera criado?</h2>
            <div className="mt-5 space-y-3 text-sm text-slate-300">
              <div className="cp-os-row">Materias iniciais do concurso</div>
              <div className="cp-os-row">Topicos e subtopicos base</div>
              <div className="cp-os-row">Pesos e prioridades</div>
              <div className="cp-os-row">Configuracao do planejamento</div>
              <div className="cp-os-row">Base para comecar o dia</div>
            </div>
          </aside>
        </section>
      </section>
    </main>
  );
}
