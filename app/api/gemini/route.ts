import { NextResponse } from "next/server";

function getApiKey() {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    ""
  );
}

function safeString(value: unknown) {
  if (typeof value === "string") return value;
  if (value == null) return "";
  return String(value);
}

function montarPrompt(body: any) {
  const action = safeString(body?.action);
  const prompt = safeString(body?.prompt);
  const userInput = safeString(body?.userInput);
  const snapshot = body?.snapshot ?? null;

  return [
    action ? `AÇÃO: ${action}` : "",
    prompt ? `PROMPT:\n${prompt}` : "",
    userInput && userInput !== prompt ? `ENTRADA DO USUÁRIO:\n${userInput}` : "",
    snapshot ? `CONTEXTO DO APP:\n${JSON.stringify(snapshot, null, 2)}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export async function POST(request: Request) {
  try {
    const apiKey = getApiKey();

    if (!apiKey) {
      return NextResponse.json(
        { error: "Chave Gemini não configurada." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const action = safeString(body?.action);
    const finalPrompt = montarPrompt(body);

    if (!finalPrompt.trim()) {
      return NextResponse.json(
        { error: "Nenhum conteúdo foi enviado para a IA." },
        { status: 400 }
      );
    }

    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: finalPrompt }],
            },
          ],
          generationConfig: {
            temperature: action === "simulado_prova_gerar" ? 0.35 : 0.7,
            topP: 0.9,
            maxOutputTokens: action === "simulado_prova_gerar" ? 8192 : 4096,
            ...(action === "simulado_prova_gerar"
              ? { responseMimeType: "application/json" }
              : {}),
          },
        }),
      }
    );

    const raw = await response.text();

    let json: any = null;
    try {
      json = JSON.parse(raw);
    } catch {}

    if (!response.ok) {
      const message =
        json?.error?.message ||
        raw ||
        "Erro ao chamar Gemini.";

      return NextResponse.json(
        {
          error: message,
          text: message,
          raw,
        },
        { status: response.status }
      );
    }

    const text =
      json?.candidates?.[0]?.content?.parts
        ?.map((part: any) => safeString(part?.text))
        .filter(Boolean)
        .join("\n")
        .trim() || "";

    return NextResponse.json({
      text,
      response: text,
      raw: json,
    });
  } catch (error: any) {
    const message = error?.message || "Erro interno na rota Gemini.";

    return NextResponse.json(
      {
        error: message,
        text: message,
      },
      { status: 500 }
    );
  }
}
