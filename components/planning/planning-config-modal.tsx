import type { BrainMateria, PlanningBrain, Prioridade } from "@/lib/planning/types";

type Props = {
  brain: PlanningBrain;
  dias: string[];
  novaMateria: string;
  fechar: () => void;
  setNovaMateria: (value: string) => void;
  updateBrain: (next: PlanningBrain) => Promise<void>;
  updateMateria: (id: string, patch: Partial<BrainMateria>) => void;
  toggleDia: (dia: string) => void;
  adicionarMateriaManual: () => Promise<void>;
};

export function PlanningConfigModal(props: Props) {
  const { brain } = props;
  return (
    <div className="cp-os-modal-backdrop">
      <section className="cp-os-modal">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><h2 className="text-2xl font-black text-white">Configurar cerebro do planejamento</h2><p className="mt-2 text-sm leading-7 text-slate-300">Estes dados definem como o plano diario sera calculado.</p></div>
          <button type="button" onClick={props.fechar} className="cp-os-btn-soft">Fechar</button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label><span className="mb-2 block text-sm font-black text-slate-300">Concurso foco</span><input className="cp-os-input" value={brain.concurso} onChange={(e) => void props.updateBrain({ ...brain, concurso: e.target.value })} /></label>
          <label><span className="mb-2 block text-sm font-black text-slate-300">Horas por dia</span><input className="cp-os-input" value={brain.horasDia} onChange={(e) => void props.updateBrain({ ...brain, horasDia: e.target.value })} /></label>
          <label><span className="mb-2 block text-sm font-black text-slate-300">Periodo preferido</span><select className="cp-os-select" value={brain.periodo} onChange={(e) => void props.updateBrain({ ...brain, periodo: e.target.value })}>{["Manha", "Tarde", "Noite", "Madrugada", "Variavel"].map((item) => <option key={item}>{item}</option>)}</select></label>
          <div><span className="mb-2 block text-sm font-black text-slate-300">Dias disponiveis</span><div className="flex flex-wrap gap-2">{props.dias.map((dia) => <button key={dia} type="button" onClick={() => props.toggleDia(dia)} className={brain.diasSemana.includes(dia) ? "cp-os-btn-primary" : "cp-os-btn-soft"}>{dia}</button>)}</div></div>
        </div>

        <div className="mt-6 rounded-[26px] border border-white/10 bg-white/[0.045] p-4">
          <h3 className="text-lg font-black text-white">Adicionar materia ao concurso</h3>
          <div className="mt-3 flex flex-wrap gap-3"><input className="cp-os-input max-w-md" value={props.novaMateria} onChange={(e) => props.setNovaMateria(e.target.value)} placeholder="Nome da materia" /><button type="button" onClick={() => void props.adicionarMateriaManual()} className="cp-os-btn-primary">Adicionar</button></div>
        </div>

        <div className="mt-6 space-y-3">
          <h3 className="text-lg font-black text-white">Materias, peso e prioridade</h3>
          {brain.materias.map((materia) => (
            <div key={materia.materiaId} className="rounded-[24px] border border-white/10 bg-white/[0.045] p-4">
              <div className="grid gap-3 lg:grid-cols-[1fr_90px_90px_140px_110px]">
                <div><p className="font-black text-white">{materia.nome}</p><p className="text-xs text-slate-400">ID: {materia.materiaId}</p></div>
                <label><span className="mb-1 block text-xs font-bold text-slate-400">Peso</span><input className="cp-os-input" type="number" min={1} max={5} value={materia.peso} onChange={(e) => props.updateMateria(materia.materiaId, { peso: Number(e.target.value) })} /></label>
                <label><span className="mb-1 block text-xs font-bold text-slate-400">Ordem</span><input className="cp-os-input" type="number" min={1} value={materia.ordem} onChange={(e) => props.updateMateria(materia.materiaId, { ordem: Number(e.target.value) })} /></label>
                <label><span className="mb-1 block text-xs font-bold text-slate-400">Prioridade</span><select className="cp-os-select" value={materia.prioridade} onChange={(e) => props.updateMateria(materia.materiaId, { prioridade: e.target.value as Prioridade })}>{["Alta", "Media", "Baixa"].map((item) => <option key={item}>{item}</option>)}</select></label>
                <button type="button" onClick={() => props.updateMateria(materia.materiaId, { ativa: !materia.ativa })} className={materia.ativa ? "cp-os-btn-focus" : "cp-os-btn-soft"}>{materia.ativa ? "Ativa" : "Inativa"}</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
