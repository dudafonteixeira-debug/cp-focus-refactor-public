"use client";

import { useEffect, useState } from "react";

import { gerarSugestaoEstudo } from "@/lib/ai-engine";
import { loadAppData } from "@/lib/app-storage";

export function useIASuggestion() {
  const [sugestao, setSugestao] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const data = loadAppData();
    const resultado = gerarSugestaoEstudo(data?.materias || []);

    setSugestao(resultado);
    setCarregando(false);
  }, []);

  return { carregando, sugestao };
}
