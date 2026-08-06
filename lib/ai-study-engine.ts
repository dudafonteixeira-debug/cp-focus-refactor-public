import { gerarTextoIAFake, iaLigada } from "@/lib/ai-helpers";
import type { GeneratedStudyPack } from "@/lib/fase2-types";

function createId() {
  return `pack_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function generateStudyPack(assunto: string, origem = "manual"): GeneratedStudyPack {
  const base = assunto.trim() || "assunto não informado";
  const ia = gerarTextoIAFake("fase2-pack", base) as any;

  return {
    id: createId(),
    origem,
    assunto: base,
    criadoEm: new Date().toISOString(),
    blocos: [
      {
        titulo: "Explicação simples",
        texto: `Explicação objetiva sobre ${base}. ${ia?.texto ?? ""}`.trim(),
        tipo: "explicacao",
      },
      {
        titulo: "Resumo estruturado",
        texto: `1. Conceito central de ${base}\n2. Pontos-chave\n3. Pegadinhas comuns\n4. Como revisar depois`,
        tipo: "resumo",
      },
      {
        titulo: "Analogia",
        texto: `Pense em ${base} como um mecanismo com partes conectadas. Ao mudar uma parte, o restante do sistema reage.`,
        tipo: "analogia",
      },
      {
        titulo: "Mapa mental textual",
        texto: `${base}\n+- conceito\n+- classifica??o\n+- aplica??o pr?tica\n+- erros frequentes`,
        tipo: "mapa",
      },
    ],
  };
}

export function aiStatusLabel() {
  return iaLigada() ? "IA ativada" : "IA interna do app";
}
