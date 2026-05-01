import { addDays } from "date-fns";

import {
  ACTIVE_SUBSCRIPTION_STATUSES,
  BILLING_PROVIDER,
  DEFAULT_THEME,
  TRIAL_DAYS,
} from "@/lib/constants";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import type { Database, Page, Profile, Subscription } from "@/types/database";

type SupabaseServer = Awaited<ReturnType<typeof createClient>>;
type TemplateBlock = {
  type: Database["public"]["Tables"]["blocks"]["Insert"]["type"];
  title?: string | null;
  subtitle?: string | null;
  content_json?: Database["public"]["Tables"]["blocks"]["Insert"]["content_json"];
  position?: number;
  is_enabled?: boolean;
};
type TemplateLink = Omit<
  Database["public"]["Tables"]["links"]["Insert"],
  "page_id"
>;
type TemplateFaqItem = Omit<
  Database["public"]["Tables"]["faq_items"]["Insert"],
  "page_id"
>;

interface WorkspaceInput {
  name: string;
  professionalTitle?: string;
  crp?: string;
  slug?: string;
}

const DEFAULT_TEMPLATE_CODE = "psicologa_classica";

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function hasActiveAccess(subscription?: Subscription | null) {
  if (!subscription) return false;
  return ACTIVE_SUBSCRIPTION_STATUSES.includes(
    subscription.status as (typeof ACTIVE_SUBSCRIPTION_STATUSES)[number],
  );
}

export async function canUserWrite(userId: string) {
  const admin = await createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (!profile) return false;

  const { data: subscription } = await admin
    .from("subscriptions")
    .select("*")
    .eq("profile_id", profile.id)
    .single();

  return hasActiveAccess(subscription as Subscription | null);
}

export async function getCurrentAccount(supabase?: SupabaseServer) {
  const client = supabase ?? (await createClient());
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return { user: null, profile: null, page: null, subscription: null };
  }

  const { data: profile } = await client
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return { user, profile: null, page: null, subscription: null };
  }

  const [{ data: page }, { data: subscription }] = await Promise.all([
    client
      .from("pages")
      .select("*")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .single(),
    client
      .from("subscriptions")
      .select("*")
      .eq("profile_id", profile.id)
      .single(),
  ]);

  return {
    user,
    profile: profile as Profile,
    page: page as Page | null,
    subscription: subscription as Subscription | null,
  };
}

export async function getCurrentAccountOrCreate(input?: WorkspaceInput) {
  const supabase = await createClient();
  const account = await getCurrentAccount(supabase);

  if (!account.user) return account;
  if (account.profile && account.page && account.subscription) return account;

  return createWorkspaceForUser(account.user.id, {
    name:
      input?.name ??
      account.user.user_metadata?.name ??
      account.user.email?.split("@")[0] ??
      "Psicóloga",
    professionalTitle:
      input?.professionalTitle ??
      account.user.user_metadata?.professional_title ??
      "Psicóloga Clínica",
    crp: input?.crp ?? account.user.user_metadata?.crp ?? undefined,
    slug: input?.slug,
  });
}

export async function createWorkspaceForUser(
  userId: string,
  input: WorkspaceInput,
) {
  const admin = await createAdminClient();

  const { data: existingProfile } = await admin
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  const profile =
    existingProfile ??
    (
      await admin
        .from("profiles")
        .insert({
          user_id: userId,
          name: input.name,
          professional_title: input.professionalTitle ?? "Psicóloga Clínica",
          crp: input.crp || null,
          subtitle: "Psicoterapia online com acolhimento e ética.",
          bio: "Edite este texto para apresentar sua abordagem, experiência e forma de atendimento.",
        })
        .select()
        .single()
    ).data;

  if (!profile) {
    throw new Error("Não foi possível criar o perfil.");
  }

  await Promise.all([
    admin.from("themes").upsert(
      {
        profile_id: profile.id,
        ...DEFAULT_THEME,
      },
      { onConflict: "profile_id" },
    ),
    admin.from("settings").upsert(
      {
        profile_id: profile.id,
        consent_text:
          "Concordo com a política de privacidade e autorizo o contato para fins relacionados à psicoterapia.",
        timezone: "America/Sao_Paulo",
        locale: "pt-BR",
      },
      { onConflict: "profile_id" },
    ),
    admin.from("subscriptions").upsert(
      {
        profile_id: profile.id,
        plan_code: "professional",
        status: "trialing",
        provider: BILLING_PROVIDER,
        trial_ends_at: addDays(new Date(), TRIAL_DAYS).toISOString(),
      },
      { onConflict: "profile_id" },
    ),
  ]);

  const { data: existingPage } = await admin
    .from("pages")
    .select("*")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  const page =
    existingPage ??
    (
      await admin
        .from("pages")
        .insert({
          profile_id: profile.id,
          slug: await createUniqueSlug(admin, input.slug ?? input.name),
          title: `${profile.name} | BioHub`,
          status: "draft",
          seo_title: `${profile.name} | Psicóloga`,
          seo_description:
            "Conheça meu trabalho, tire dúvidas e agende uma conversa inicial.",
        })
        .select()
        .single()
    ).data;

  if (!page) {
    throw new Error("Não foi possível criar a página.");
  }

  await seedPageTemplate(admin, page.id);

  const { data: subscription } = await admin
    .from("subscriptions")
    .select("*")
    .eq("profile_id", profile.id)
    .single();

  return {
    user: { id: userId },
    profile: profile as Profile,
    page: page as Page,
    subscription: subscription as Subscription | null,
  };
}

async function createUniqueSlug(
  admin: Awaited<ReturnType<typeof createAdminClient>>,
  source: string,
) {
  const base = slugify(source) || "psicologa";
  let candidate = base;
  let suffix = 2;

  while (true) {
    const { data } = await admin
      .from("pages")
      .select("id")
      .eq("slug", candidate)
      .single();

    if (!data) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

async function seedPageTemplate(
  admin: Awaited<ReturnType<typeof createAdminClient>>,
  pageId: string,
) {
  const [{ count: blockCount }, { data: template }] = await Promise.all([
    admin
      .from("blocks")
      .select("id", { count: "exact", head: true })
      .eq("page_id", pageId),
    admin
      .from("page_templates")
      .select("*")
      .eq("code", DEFAULT_TEMPLATE_CODE)
      .single(),
  ]);

  if ((blockCount ?? 0) > 0 || !template) return;

  const blocks = (Array.isArray(template.blocks_json)
    ? template.blocks_json
    : []) as TemplateBlock[];
  const links = (Array.isArray(template.links_json)
    ? template.links_json
    : []) as TemplateLink[];
  const faqItems = (Array.isArray(template.faq_json)
    ? template.faq_json
    : []) as TemplateFaqItem[];

  await Promise.all([
    admin.from("blocks").insert(
      blocks.map((block) => ({
        ...block,
        page_id: pageId,
      })),
    ),
    admin.from("links").insert(
      links.map((link) => ({
        ...link,
        page_id: pageId,
      })),
    ),
    admin.from("faq_items").insert(
      faqItems.map((item) => ({
        ...item,
        page_id: pageId,
      })),
    ),
  ]);
}

export type CurrentAccount = Awaited<ReturnType<typeof getCurrentAccount>>;
