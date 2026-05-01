"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { createWorkspaceForUser, getCurrentAccountOrCreate } from "@/server/account";
import type { ApiResponse } from "@/types";

interface CompleteOnboardingParams {
  name: string;
  professionalTitle?: string;
  crp?: string;
  slug?: string;
}

export async function completeOnboarding(
  params: CompleteOnboardingParams,
): Promise<ApiResponse<{ slug: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Faça login para criar seu BioHub." };
  }

  try {
    const account = await createWorkspaceForUser(user.id, {
      name: params.name,
      professionalTitle: params.professionalTitle,
      crp: params.crp,
      slug: params.slug,
    });

    if (!account.page) {
      return { success: false, error: "Não foi possível criar a página." };
    }

    return { success: true, data: { slug: account.page.slug } };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Não foi possível concluir o cadastro.",
    };
  }
}

export async function ensureWorkspaceAndRedirect() {
  const account = await getCurrentAccountOrCreate();

  if (!account.user) redirect("/auth/login");
  redirect("/admin");
}
