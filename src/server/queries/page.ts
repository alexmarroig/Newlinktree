import { unstable_cache } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { PAGE_CACHE_TAG_PREFIX } from "@/lib/constants";
import type { PageData } from "@/types";

/**
 * Carrega todos os dados necessários para renderizar a página pública.
 * Cacheado por slug com revalidação por tag.
 */
export async function getPublicPageData(
  slug: string,
): Promise<PageData | null> {
  return unstable_cache(
    async () => {
      const supabase = await createClient();

      // Carrega a página
      const { data: page, error: pageError } = await supabase
        .from("pages")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single();

      if (pageError || !page) return null;

      // Carrega perfil, tema, blocos, links, FAQ e settings em paralelo
      const [
        { data: profile },
        { data: theme },
        { data: blocks },
        { data: links },
        { data: faqItems },
        { data: settings },
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .eq("id", page.profile_id)
          .single(),

        supabase
          .from("themes")
          .select("*")
          .eq("profile_id", page.profile_id)
          .single(),

        supabase
          .from("blocks")
          .select("*")
          .eq("page_id", page.id)
          .eq("is_enabled", true)
          .order("position", { ascending: true }),

        supabase
          .from("links")
          .select("*")
          .eq("page_id", page.id)
          .eq("is_enabled", true)
          .order("position", { ascending: true }),

        supabase
          .from("faq_items")
          .select("*")
          .eq("page_id", page.id)
          .eq("is_enabled", true)
          .order("position", { ascending: true }),

        supabase
          .from("settings")
          .select("*")
          .eq("profile_id", page.profile_id)
          .single(),
      ]);

      if (!profile || !theme || !settings) return null;

      return {
        profile,
        theme,
        page,
        blocks: blocks ?? [],
        links: links ?? [],
        faqItems: faqItems ?? [],
        settings,
      } as PageData;
    },
    [`${PAGE_CACHE_TAG_PREFIX}${slug}`],
    {
      tags: [`${PAGE_CACHE_TAG_PREFIX}${slug}`],
      revalidate: 60,
    },
  )();
}

/**
 * Carrega dados da página para o admin (sem filtro de status published).
 */
export async function getAdminPageData(pageId: string) {
  const supabase = await createClient();

  const [
    { data: page },
    { data: blocks },
    { data: links },
    { data: faqItems },
  ] = await Promise.all([
    supabase.from("pages").select("*").eq("id", pageId).single(),
    supabase
      .from("blocks")
      .select("*")
      .eq("page_id", pageId)
      .order("position", { ascending: true }),
    supabase
      .from("links")
      .select("*")
      .eq("page_id", pageId)
      .order("position", { ascending: true }),
    supabase
      .from("faq_items")
      .select("*")
      .eq("page_id", pageId)
      .order("position", { ascending: true }),
  ]);

  return { page, blocks: blocks ?? [], links: links ?? [], faqItems: faqItems ?? [] };
}

/**
 * Carrega lista de todas as páginas do perfil.
 */
export async function getProfilePages(profileId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pages")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

/**
 * Carrega o perfil do usuário autenticado.
 */
export async function getCurrentProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return profile;
}

/**
 * Carrega tema do perfil.
 */
export async function getProfileTheme(profileId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("themes")
    .select("*")
    .eq("profile_id", profileId)
    .single();
  return data;
}

/**
 * Carrega settings do perfil.
 */
export async function getProfileSettings(profileId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("settings")
    .select("*")
    .eq("profile_id", profileId)
    .single();
  return data;
}
