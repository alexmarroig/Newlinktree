import { z } from "zod";

// ---- Formulário de interesse em psicoterapia ----

export const interestFormSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo")
    .trim(),

  whatsapp: z
    .string()
    .min(10, "WhatsApp inválido")
    .max(20, "WhatsApp inválido")
    .regex(
      /^[\d\s\(\)\-\+]+$/,
      "WhatsApp deve conter apenas números e caracteres válidos",
    )
    .transform((val) => val.replace(/\D/g, "")),

  email: z
    .string()
    .email("E-mail inválido")
    .max(254, "E-mail muito longo")
    .optional()
    .or(z.literal("")),

  contactPreference: z.enum(["whatsapp", "email", "either"], {
    required_error: "Selecione uma preferência de contato",
  }),

  preferredModality: z.enum(["online", "presencial", "either"], {
    required_error: "Selecione uma modalidade preferida",
  }),

  message: z
    .string()
    .max(1000, "Mensagem muito longa")
    .optional()
    .or(z.literal("")),

  bestTime: z.enum(["manha", "tarde", "noite", "qualquer"], {
    required_error: "Selecione o melhor horário",
  }),

  consent: z.literal(true, {
    errorMap: () => ({
      message: "Você precisa concordar com a política de privacidade",
    }),
  }),

  // Campo honeypot — deve estar sempre vazio
  honeypot: z.string().max(0, "Bot detectado").optional(),
});

export type InterestFormSchema = z.infer<typeof interestFormSchema>;

// ---- Link/CTA ----

export const linkSchema = z.object({
  label: z
    .string()
    .min(1, "Label é obrigatório")
    .max(100, "Label muito longo"),
  sublabel: z.string().max(200, "Sublabel muito longo").optional(),
  type: z.enum(
    ["whatsapp", "url", "instagram", "download", "form", "scroll", "modal", "internal"],
    { required_error: "Tipo é obrigatório" },
  ),
  icon: z.string().optional(),
  url: z.string().url("URL inválida").optional().or(z.literal("")),
  whatsappMessage: z
    .string()
    .max(500, "Mensagem muito longa")
    .optional(),
  openInNewTab: z.boolean().default(true),
  variant: z
    .enum(["primary", "secondary", "ghost", "outline", "soft"])
    .default("primary"),
  isEnabled: z.boolean().default(true),
  trackingEnabled: z.boolean().default(true),
  thumbnailUrl: z
    .string()
    .url("URL da thumbnail inválida")
    .optional()
    .or(z.literal("")),
});

export type LinkSchema = z.infer<typeof linkSchema>;

// ---- FAQ Item ----

export const faqItemSchema = z.object({
  question: z
    .string()
    .min(5, "Pergunta muito curta")
    .max(300, "Pergunta muito longa"),
  answer: z
    .string()
    .min(10, "Resposta muito curta")
    .max(2000, "Resposta muito longa"),
  isEnabled: z.boolean().default(true),
});

export type FaqItemSchema = z.infer<typeof faqItemSchema>;

// ---- Profile ----

export const profileSchema = z.object({
  name: z.string().min(2, "Nome muito curto").max(100, "Nome muito longo"),
  professionalTitle: z
    .string()
    .min(2, "Título muito curto")
    .max(100, "Título muito longo"),
  crp: z.string().max(50, "CRP muito longo").optional().or(z.literal("")),
  bio: z.string().max(500, "Bio muito longa").optional().or(z.literal("")),
  subtitle: z
    .string()
    .max(200, "Subtítulo muito longo")
    .optional()
    .or(z.literal("")),
  whatsappNumber: z
    .string()
    .regex(/^\d{10,15}$/, "WhatsApp inválido (use apenas números com DDD)")
    .optional()
    .or(z.literal("")),
  instagramUrl: z
    .string()
    .url("URL do Instagram inválida")
    .optional()
    .or(z.literal("")),
  websiteUrl: z
    .string()
    .url("URL do site inválida")
    .optional()
    .or(z.literal("")),
  linkedinUrl: z
    .string()
    .url("URL do LinkedIn inválida")
    .optional()
    .or(z.literal("")),
  youtubeUrl: z
    .string()
    .url("URL do YouTube inválida")
    .optional()
    .or(z.literal("")),
});

export type ProfileSchema = z.infer<typeof profileSchema>;

// ---- Theme ----

export const themeSchema = z.object({
  // Legacy HSL palette (kept for compat)
  primaryColor: z.string().min(1, "Cor primária é obrigatória"),
  secondaryColor: z.string().min(1, "Cor secundária é obrigatória"),
  backgroundColor: z.string().min(1, "Cor de fundo é obrigatória"),
  textColor: z.string().min(1, "Cor do texto é obrigatória"),
  accentColor: z.string().min(1, "Cor de destaque é obrigatória"),
  fontHeading: z.string().default("Playfair Display"),
  fontBody: z.string().default("Inter"),
  borderRadius: z.enum(["sm", "md", "lg", "xl"]).default("lg"),
  shadowIntensity: z.enum(["none", "soft", "medium", "strong"]).default("soft"),
  layoutWidth: z.enum(["narrow", "medium", "wide"]).default("narrow"),
  cardStyle: z.enum(["flat", "elevated", "bordered"]).default("elevated"),
  // Wallpaper
  backgroundImageUrl: z.string().url().optional().or(z.literal("")),
  backgroundType: z.enum(["color", "image"]).default("color"),
  wallpaperEffect: z.enum(["none", "mono", "blur", "halftone"]).default("none"),
  wallpaperTint: z.number().min(0).max(100).default(20),
  wallpaperNoise: z.boolean().default(false),
  // Text
  pageFont: z.string().default("Inter"),
  pageFontColor: z.string().optional().or(z.literal("")),
  titleFontColor: z.string().optional().or(z.literal("")),
  titleSize: z.enum(["small", "large"]).default("small"),
  // Avatar / Header
  avatarLayout: z.enum(["classic", "hero"]).default("classic"),
  // Buttons
  buttonStyle: z.enum(["solid", "glass", "outline"]).default("solid"),
  buttonColor: z.string().optional().or(z.literal("")),
  buttonTextColor: z.string().optional().or(z.literal("")),
  buttonShadow: z.enum(["none", "soft", "strong", "hard"]).default("soft"),
  buttonRoundness: z.enum(["square", "round", "rounder", "full"]).default("full"),
});

export type ThemeSchema = z.infer<typeof themeSchema>;

// ---- SEO ----

export const seoSchema = z.object({
  seoTitle: z
    .string()
    .max(70, "Título SEO muito longo (máx 70 caracteres)")
    .optional()
    .or(z.literal("")),
  seoDescription: z
    .string()
    .max(160, "Meta description muito longa (máx 160 caracteres)")
    .optional()
    .or(z.literal("")),
  ogImageUrl: z
    .string()
    .url("URL da imagem OG inválida")
    .optional()
    .or(z.literal("")),
  canonicalUrl: z
    .string()
    .url("URL canônica inválida")
    .optional()
    .or(z.literal("")),
  robots: z.string().default("index,follow"),
});

export type SeoSchema = z.infer<typeof seoSchema>;

// ---- Settings ----

export const settingsSchema = z.object({
  privacyPolicy: z.string().optional(),
  consentText: z.string().min(10, "Texto de consentimento muito curto"),
  timezone: z.string().default("America/Sao_Paulo"),
  locale: z.string().default("pt-BR"),
  siteUrl: z
    .string()
    .url("URL do site inválida")
    .optional()
    .or(z.literal("")),
  contactEmail: z
    .string()
    .email("E-mail inválido")
    .optional()
    .or(z.literal("")),
  whatsappDefaultMessage: z
    .string()
    .max(500, "Mensagem muito longa")
    .optional(),
});

export type SettingsSchema = z.infer<typeof settingsSchema>;

// ---- Upload ----

export const uploadSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(255, "Nome muito longo"),
  fileType: z.enum(["image", "pdf"], {
    required_error: "Tipo de arquivo é obrigatório",
  }),
  altText: z.string().max(300, "Alt text muito longo").optional(),
});

export type UploadSchema = z.infer<typeof uploadSchema>;

// ---- Lead status update ----

export const leadStatusSchema = z.object({
  status: z.enum(["new", "contacted", "in_progress", "archived"]),
});

export type LeadStatusSchema = z.infer<typeof leadStatusSchema>;

// ---- Lead note ----

export const leadNoteSchema = z.object({
  note: z
    .string()
    .min(1, "Nota não pode ser vazia")
    .max(1000, "Nota muito longa"),
});

export type LeadNoteSchema = z.infer<typeof leadNoteSchema>;
