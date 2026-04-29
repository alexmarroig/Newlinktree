"use server";

import { createClient } from "@/lib/supabase/server";
import { BiohubAccessService } from "@/server/services/biohub-access-service";
import {
  STORAGE_BUCKET_IMAGES,
  MAX_AVATAR_SIZE_BYTES,
  ALLOWED_IMAGE_TYPES,
} from "@/lib/constants";
import type { ApiResponse } from "@/types";

/**
 * Uploads a background image to the `images` Supabase bucket.
 * Returns the public URL.
 */
export async function uploadBackgroundImage(
  profileId: string,
  formData: FormData,
): Promise<ApiResponse<{ url: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Não autorizado", code: "UNAUTHORIZED" };
  }

  await BiohubAccessService.assertAccess({ userId: user.id, action: "write" });

  const file = formData.get("file") as File | null;
  if (!file) {
    return { success: false, error: "Nenhum arquivo enviado" };
  }

  if (file.size > MAX_AVATAR_SIZE_BYTES) {
    return { success: false, error: "Arquivo muito grande (máx 5 MB)" };
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { success: false, error: "Formato não suportado (use JPG, PNG, WebP ou AVIF)" };
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${profileId}/background.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET_IMAGES)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    return { success: false, error: "Erro ao fazer upload da imagem" };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(STORAGE_BUCKET_IMAGES).getPublicUrl(path);

  const urlWithBust = `${publicUrl}?t=${Date.now()}`;

  return { success: true, data: { url: urlWithBust } };
}
