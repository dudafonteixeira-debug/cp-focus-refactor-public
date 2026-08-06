"use client";

import { gerarSugestaoEstudo } from "@/lib/ai-engine";
import { loadAppData } from "@/lib/app-storage";

export default function IAPage() {
  const data = loadAppData();
  const sugestao = gerarSugestaoEstudo(data?.materias || []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Planejador IA</h1>

      <div style={{ marginTop: 20 }}>
        {sugestao}
      </div>
    </div>
  );
}