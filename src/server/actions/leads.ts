"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { leadStatusSchema } from "@/lib/validations";
import type { ApiResponse, LeadStatus } from "@/types";

export async function updateLeadStatus(
  submissionId: string,
  status: LeadStatus,
): Promise<ApiResponse> {
  const validation = leadStatusSchema.safeParse({ status });
  if (!validation.success) {
    return { success: false, error: "Status inválido" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Não autorizado", code: "UNAUTHORIZED" };
  }

  const { error } = await supabase
    .from("form_submissions")
    .update({ status })
    .eq("id", submissionId);

  if (error) {
    return { success: false, error: "Erro ao atualizar status" };
  }

  revalidatePath("/admin/leads");
  return { success: true, data: undefined };
}

export async function deleteLeadSubmission(
  submissionId: string,
): Promise<ApiResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Não autorizado", code: "UNAUTHORIZED" };
  }

  const { error } = await supabase
    .from("form_submissions")
    .delete()
    .eq("id", submissionId);

  if (error) {
    return { success: false, error: "Erro ao deletar lead" };
  }

  revalidatePath("/admin/leads");
  return { success: true, data: undefined };
}

export async function addLeadNote(
  submissionId: string,
  note: string,
): Promise<ApiResponse<{ id: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Não autorizado", code: "UNAUTHORIZED" };
  }

  const { data, error } = await supabase
    .from("lead_notes")
    .insert({
      submission_id: submissionId,
      note,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) {
    return { success: false, error: "Erro ao salvar nota" };
  }

  return { success: true, data: { id: data.id } };
}
