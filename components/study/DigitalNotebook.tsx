"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

const penColors = [
  "#ffffff",
  "#38bdf8",
  "#f472b6",
  "#a78bfa",
  "#34d399",
  "#facc15",
  "#fb7185",
];

const highlightColors = [
  "#fde68a",
  "#bbf7d0",
  "#bfdbfe",
  "#fbcfe8",
  "#ddd6fe",
  "#fed7aa",
];

export default function DigitalNotebook({ value, onChange, placeholder }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [pen, setPen] = useState("#38bdf8");
  const [highlight, setHighlight] = useState("#fde68a");
  const [openPalette, setOpenPalette] = useState<"pen" | "highlight" | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || "";
    }
  }, [value]);

  function emit() {
    onChange(ref.current?.innerHTML || "");
  }

  function command(cmd: string, arg?: string) {
    ref.current?.focus();
    document.execCommand(cmd, false, arg);
    emit();
  }

  function applyPen(color: string) {
    setPen(color);
    command("foreColor", color);
    setOpenPalette(null);
  }

  function applyHighlight(color: string) {
    setHighlight(color);
    command("backColor", color);
    setOpenPalette(null);
  }

  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.045] p-3">
      <div className="mb-3 rounded-[22px] border border-white/10 bg-black/20 p-2">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => command("bold")} className="grid h-10 min-w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-sm font-black text-white transition hover:bg-white/[0.1]">
            B
          </button>

          <button type="button" onClick={() => command("italic")} className="grid h-10 min-w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-sm font-black italic text-white transition hover:bg-white/[0.1]">
            I
          </button>

          <button type="button" onClick={() => command("underline")} className="grid h-10 min-w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-sm font-black underline text-white transition hover:bg-white/[0.1]">
            U
          </button>

          <button type="button" onClick={() => command("formatBlock", "h2")} className="h-10 rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-sm font-black text-white transition hover:bg-white/[0.1]">
            Titulo
          </button>

          <button type="button" onClick={() => command("insertUnorderedList")} className="h-10 rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-sm font-black text-white transition hover:bg-white/[0.1]">
            Lista
          </button>

          <button
            type="button"
            onClick={() => setOpenPalette(openPalette === "pen" ? null : "pen")}
            className="inline-flex h-10 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-sm font-black text-white transition hover:bg-white/[0.1]"
          >
            <span className="h-4 w-4 rounded-full ring-1 ring-white/30" style={{ backgroundColor: pen }} />
            Caneta
          </button>

          <button
            type="button"
            onClick={() => setOpenPalette(openPalette === "highlight" ? null : "highlight")}
            className="inline-flex h-10 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-sm font-black text-white transition hover:bg-white/[0.1]"
          >
            <span className="h-4 w-4 rounded-full ring-1 ring-white/30" style={{ backgroundColor: highlight }} />
            Marca
          </button>

          <button type="button" onClick={() => command("removeFormat")} className="h-10 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm font-black text-slate-300 transition hover:bg-white/[0.1] hover:text-white">
            Limpar
          </button>
        </div>

        {openPalette ? (
          <div className="mt-3 flex w-fit flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-[#07111f]/95 px-3 py-2 shadow-2xl">
            <span className="mr-1 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
              {openPalette === "pen" ? "Caneta" : "Marca-texto"}
            </span>

            {(openPalette === "pen" ? penColors : highlightColors).map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => openPalette === "pen" ? applyPen(color) : applyHighlight(color)}
                className="h-7 w-7 rounded-full ring-2 ring-white/20 transition hover:scale-110 hover:ring-cyan-300"
                style={{ backgroundColor: color }}
                aria-label={color}
              />
            ))}
          </div>
        ) : null}
      </div>

      <div className="relative">
        {!value ? (
          <p className="pointer-events-none absolute left-5 top-5 text-sm text-slate-500">
            {placeholder || "Escreva aqui..."}
          </p>
        ) : null}

        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          onInput={emit}
          className="min-h-[310px] rounded-[22px] border border-white/10 bg-[#07111f]/80 p-5 text-base leading-8 text-white outline-none transition focus:border-cyan-300/50 focus:shadow-[0_0_0_3px_rgba(103,232,249,.12)]"
        />
      </div>
    </div>
  );
}