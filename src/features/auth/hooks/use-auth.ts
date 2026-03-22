"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";

export function useAuth() {
  const router = useRouter();
  const supabase = createClient();

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erro ao sair. Tente novamente.");
      return;
    }
    router.push("/auth/login");
    router.refresh();
  }, [supabase, router]);

  return { signOut };
}
