import { NextResponse } from "next/server";
import { APP_PLANS, type AppPlan } from "@/lib/plans";

export async function POST(request: Request) {
  let body: { planoId?: AppPlan } = {};

  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const planoId = body.planoId;

  if (!planoId || !APP_PLANS[planoId]) {
    return NextResponse.json(
      {
        ok: false,
        error: "Plano invalido.",
      },
      { status: 400 }
    );
  }

  const plano = APP_PLANS[planoId];

  if (plano.preco <= 0) {
    return NextResponse.json({
      ok: true,
      mode: "free",
      message: "Plano gratuito selecionado.",
    });
  }

  const stripeSecret = process.env.STRIPE_SECRET_KEY || "";

  if (!stripeSecret) {
    return NextResponse.json(
      {
        ok: false,
        mode: "checkout_not_configured",
        planoId,
        plano: plano.nome,
        error:
          "Checkout ainda nao esta ativo. O plano foi reconhecido, mas o Stripe sera conectado na proxima fase.",
      },
      { status: 200 }
    );
  }

  return NextResponse.json(
    {
      ok: false,
      mode: "stripe_pending",
      planoId,
      plano: plano.nome,
      error: "Stripe encontrado, mas a sessao de checkout ainda nao foi ativada.",
    },
    { status: 200 }
  );
}