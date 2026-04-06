import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();

  // Atualiza todos os perfis que não têm avatar_url
  const { data, error } = await supabase
    .from("profiles")
    .update({
      avatar_url:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face",
    })
    .is("avatar_url", null)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, updated: data?.length ?? 0 });
}
