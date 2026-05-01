// ---- App ----
export const APP_NAME = "Therapy Bio Hub";
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
export const ETHOS_SITE_URL =
  process.env.NEXT_PUBLIC_ETHOS_SITE_URL ?? "https://ethos-clinic.com";

// ---- SaaS / Billing ----
export const TRIAL_DAYS = 7;
export const BILLING_PROVIDER = "mercado_pago";
export const ACTIVE_SUBSCRIPTION_STATUSES = ["trialing", "active"] as const;
export const BLOCKED_SUBSCRIPTION_STATUSES = [
  "pending",
  "past_due",
  "paused",
  "canceled",
  "expired",
] as const;

export const SAAS_PLANS = {
  professional: {
    code: "professional",
    name: "Profissional",
    monthlyPriceCents: 4900,
    annualPriceCents: 49000,
    linkLimit: 20,
    assetLimit: 50,
  },
  premium: {
    code: "premium",
    name: "Premium",
    monthlyPriceCents: 7900,
    annualPriceCents: 79000,
    linkLimit: 60,
    assetLimit: 200,
  },
} as const;

// ---- Upgrade ----
export const ETHOS_UPGRADE_URL =
  process.env.NEXT_PUBLIC_ETHOS_UPGRADE_URL ?? "https://ethos.example.com/upgrade";

// ---- Supabase Storage Buckets ----
export const STORAGE_BUCKET_AVATARS = "avatars";
export const STORAGE_BUCKET_PDFS = "pdfs";
export const STORAGE_BUCKET_IMAGES = "images";

// ---- Limites de upload ----
export const MAX_UPLOAD_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
export const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
];
export const ALLOWED_PDF_TYPES = ["application/pdf"];

// ---- Rate Limiting ----
export const FORM_RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minuto
export const FORM_RATE_LIMIT_MAX = 3; // máx 3 envios por minuto por IP

// ---- Paginação ----
export const DEFAULT_PAGE_SIZE = 20;
export const LEADS_PAGE_SIZE = 25;

// ---- Revalidação ----
export const PAGE_REVALIDATE_SECONDS = 60;
export const PAGE_CACHE_TAG_PREFIX = "page-";

// ---- Bloco defaults ----
export const BLOCK_TYPES = [
  { type: "hero", label: "Hero Principal", icon: "Sparkles" },
  { type: "credentials", label: "Credenciais", icon: "BadgeCheck" },
  { type: "start_here", label: "Comece por Aqui", icon: "Compass" },
  { type: "ctas", label: "Links & CTAs", icon: "MousePointerClick" },
  { type: "about", label: "Sobre o Trabalho", icon: "Heart" },
  { type: "resources", label: "Recursos", icon: "BookOpen" },
  { type: "faq", label: "Perguntas Frequentes", icon: "HelpCircle" },
  { type: "footer", label: "Rodapé", icon: "LayoutBottom" },
] as const;

// ---- Lead status labels ----
export const LEAD_STATUS_LABELS: Record<string, string> = {
  new: "Novo",
  contacted: "Contatado",
  in_progress: "Em andamento",
  archived: "Arquivado",
};

export const LEAD_STATUS_COLORS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  new: "default",
  contacted: "secondary",
  in_progress: "outline",
  archived: "destructive",
};

// ---- WhatsApp ----
export const WHATSAPP_BASE_URL = "https://wa.me/";
export const DEFAULT_WHATSAPP_MESSAGE =
  "Olá! Vim pelo seu perfil e gostaria de saber mais sobre o processo terapêutico.";

// ---- Design tokens defaults ----
export const DEFAULT_THEME = {
  primary_color: "28 18% 42%", // HSL warm stone 600
  secondary_color: "35 20% 72%", // HSL warm stone 300
  background_color: "45 30% 97%", // HSL warm stone 50
  text_color: "20 12% 11%", // HSL warm stone 950
  accent_color: "38 22% 85%", // HSL warm stone 200
  font_heading: "Playfair Display",
  font_body: "Inter",
  border_radius: "lg",
  shadow_intensity: "soft",
  layout_width: "narrow",
  card_style: "elevated",
} as const;

// ---- Analytics events ----
export const ANALYTICS_EVENTS = {
  PAGE_VIEW: "page_view",
  HERO_CTA_CLICK: "hero_cta_click",
  CTA_CLICK: "cta_click",
  WHATSAPP_CLICK: "whatsapp_click",
  EXTERNAL_LINK_CLICK: "external_link_click",
  INSTAGRAM_CLICK: "instagram_click",
  FORM_OPEN: "form_open",
  FORM_START: "form_start",
  FORM_SUBMIT: "form_submit",
  FORM_ERROR: "form_error",
  FILE_DOWNLOAD: "file_download",
  FAQ_EXPAND: "faq_expand",
  SCROLL_DEPTH_25: "scroll_depth_25",
  SCROLL_DEPTH_50: "scroll_depth_50",
  SCROLL_DEPTH_75: "scroll_depth_75",
  SCROLL_DEPTH_100: "scroll_depth_100",
  BLOCK_VIEW: "block_view",
} as const;
