"use client";

import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark";

function applyTheme(theme: ThemeMode) {
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(theme);
  localStorage.setItem("cp-focus-theme", theme);
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = (localStorage.getItem("cp-focus-theme") as ThemeMode | null) ?? "light";
      setTheme(saved);
      applyTheme(saved);
    } catch {
      setTheme("light");
    } finally {
      setMounted(true);
    }
  }, []);

  function toggleTheme() {
    const next: ThemeMode = theme === "light" ? "dark" : "light";
    setTheme(next);
    applyTheme(next);
  }

  if (!mounted) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="rounded-2xl px-4 py-2 text-sm font-semibold transition"
      style={{
        background:
          theme === "dark"
            ? "linear-gradient(90deg, #0f172a 0%, #1e293b 100%)"
            : "linear-gradient(90deg, #38bdf8 0%, #2563eb 100%)",
        color: "#ffffff",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 10px 24px rgba(15,23,42,0.16)",
      }}
      title={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
    >
      {theme === "dark" ? "🌙 Escuro" : "☀️ Claro"}
    </button>
  );
}

