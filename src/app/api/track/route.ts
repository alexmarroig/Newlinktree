import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * Route Handler para tracking server-side de cliques em links.
 * Incrementa click_count de forma atômica no banco.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { linkId?: string };
    const { linkId } = body;

    if (!linkId || typeof linkId !== "string") {
      return NextResponse.json(
        { error: "linkId é obrigatório" },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    await supabase.rpc("increment_link_click", { link_id: linkId });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
