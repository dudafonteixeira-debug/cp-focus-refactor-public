import { NextRequest, NextResponse } from "next/server";

function deepExtractString(value: any): string {
  if (!value) return "";

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "";

    try {
      const parsed = JSON.parse(trimmed);
      const nested = deepExtractString(parsed);
      return nested || trimmed;
    } catch {
      return trimmed;
    }
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => deepExtractString(item))
      .filter(Boolean)
      .join("\n")
      .trim();
  }

  if (typeof value === "object") {
    const priorityKeys = [
      "text",
      "response",
      "message",
      "output",
      "content",
      "answer",
      "resultado",
      "resposta",
      "finalText",
      "final_text",
      "generatedText",
      "generated_text",
    ];

    for (const key of priorityKeys) {
      if (key in value) {
        const extracted = deepExtractString(value[key]);
        if (extracted) return extracted;
      }
    }

    if (Array.isArray(value?.parts)) {
      const joined = value.parts
        .map((item: any) => deepExtractString(item))
        .filter(Boolean)
        .join("\n")
        .trim();

      if (joined) return joined;
    }

    if (Array.isArray(value?.candidates)) {
      const joined = value.candidates
        .map((candidate: any) => deepExtractString(candidate))
        .filter(Boolean)
        .join("\n")
        .trim();

      if (joined) return joined;
    }

    for (const key of Object.keys(value)) {
      const extracted = deepExtractString(value[key]);
      if (extracted) return extracted;
    }
  }

  return "";
}

function cleanAiText(raw: any): string {
  const extracted = deepExtractString(raw).trim();
  if (!extracted) return "";

  const sanitized = extracted
    .replace(/^\s*```json\s*/i, "")
    .replace(/^\s*```/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  if (
    (sanitized.startsWith("{") && sanitized.endsWith("}")) ||
    (sanitized.startsWith("[") && sanitized.endsWith("]"))
  ) {
    try {
      const parsed = JSON.parse(sanitized);
      const nested = deepExtractString(parsed).trim();
      if (nested) return nested;
    } catch {
    }
  }

  return sanitized;
}

function buildContextPrompt(body: any) {
  const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
  const userInput = typeof body?.userInput === "string" ? body.userInput.trim() : "";
  const action = typeof body?.action === "string" ? body.action.trim() : "";
  const snapshot = body?.snapshot || {};

  const materiaNome = snapshot?.materiaNome || "";
  const topicoNome = snapshot?.topicoNome || "";
  const subtopicoNome = snapshot?.subtopicoNome || "";

  const conteudos = Array.isArray(snapshot?.conteudos) ? snapshot.conteudos : [];
  const anotacoes = Array.isArray(snapshot?.anotacoes) ? snapshot.anotacoes : [];
  const erros = Array.isArray(snapshot?.erros) ? snapshot.erros : [];

  const blocos = [
    "Você é uma IA de estudo do app CP Focus.",
    "Responda sempre em TEXTO PURO.",
    "Nunca devolva JSON, markdown de sistema, objeto, schema ou campos técnicos.",
    "Seja útil para estudo, clara, organizada e contextual.",
    action ? "Ação pedida: " + action : "",
    materiaNome ? "Matéria: " + materiaNome : "",
    topicoNome ? "Tópico: " + topicoNome : "",
    subtopicoNome ? "Subtópico: " + subtopicoNome : "",
    conteudos.length ? "Conteúdos já salvos:\n" + conteudos.map((c: any) => c?.texto || "").filter(Boolean).join("\n\n") : "",
    anotacoes.length ? "Anotações já salvas:\n" + anotacoes.map((a: any) => a?.texto || "").filter(Boolean).join("\n\n") : "",
    erros.length ? "Erros relacionados:\n" + erros.map((e: any) => e?.texto || e?.enunciado || "").filter(Boolean).join("\n\n") : "",
    prompt ? "Instrução principal:\n" + prompt : "",
    userInput ? "Pedido do usuário:\n" + userInput : "",
  ].filter(Boolean);

  return blocos.join("\n\n");
}

async function tryInternalGemini(request: NextRequest, body: any) {
  const geminiUrl = new URL("/api/gemini", request.url);

  const response = await fetch(geminiUrl.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const raw = await response.text();

  let parsed: any = raw;
  try {
    parsed = JSON.parse(raw);
  } catch {
  }

  return {
    ok: response.ok,
    status: response.status,
    text: cleanAiText(parsed) || cleanAiText(raw),
    raw: parsed,
  };
}

async function tryDirectGemini(prompt: string) {
  const apiKey =
    process.env.GOOGLE_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_API_KEY ||
    "";

  if (!apiKey) {
    throw new Error("Chave da IA não encontrada.");
  }

  const model =
    process.env.GEMINI_MODEL ||
    process.env.GOOGLE_GEMINI_MODEL ||
    "gemini-2.5-flash";

  const endpoint =
    "https://generativelanguage.googleapis.com/v1beta/models/" +
    model +
    ":generateContent?key=" +
    apiKey;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
      },
    }),
    cache: "no-store",
  });

  const raw = await response.text();

  let parsed: any = raw;
  try {
    parsed = JSON.parse(raw);
  } catch {
  }

  const text = cleanAiText(parsed) || cleanAiText(raw);

  if (!response.ok) {
    throw new Error(text || "Falha ao gerar resposta da IA.");
  }

  if (!text) {
    throw new Error("A IA respondeu sem texto útil.");
  }

  return text;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    const hasPrompt = typeof body?.prompt === "string" && body.prompt.trim();
    const hasUserInput = typeof body?.userInput === "string" && body.userInput.trim();
    const hasAction = typeof body?.action === "string" && body.action.trim();

    if (!hasPrompt && !hasUserInput && !hasAction) {
      return NextResponse.json(
        { error: "Nenhum conteúdo foi enviado para a IA." },
        { status: 400 }
      );
    }

    try {
      const internal = await tryInternalGemini(request, body);

      if (internal.ok && internal.text) {
        return NextResponse.json(
          { text: internal.text },
          { status: 200 }
        );
      }
    } catch {
    }

    const prompt = buildContextPrompt(body);
    const text = await tryDirectGemini(prompt);

    return NextResponse.json(
      { text },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error?.message || "Erro interno ao gerar resposta da IA.",
      },
      { status: 500 }
    );
  }
}