import { NextResponse } from "next/server";
import { hasSupabase } from "@/lib/supabase/client";
import { DATA_KEYS } from "@/lib/data-access/keys";
import { getDataProviderMode } from "@/lib/data-access/provider";

export async function GET() {
  return NextResponse.json({
    ok: true,
    dataProvider: getDataProviderMode(),
    supabaseConfigured: hasSupabase(),
    keys: Object.keys(DATA_KEYS),
  });
}