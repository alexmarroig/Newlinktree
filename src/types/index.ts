// Re-exporta todos os tipos de database
export * from "./database";
export * from "./access";

// ---- Tipos de UI e domínio ----

export interface PageData {
  profile: import("./database").Profile;
  theme: import("./database").Theme;
  page: import("./database").Page;
  blocks: import("./database").Block[];
  links: import("./database").Link[];
  faqItems: import("./database").FaqItem[];
  settings: import("./database").Settings;
}

export interface BlockContent {
  hero?: HeroContent;
  credentials?: CredentialsContent;
  start_here?: StartHereContent;
  ctas?: CTAsContent;
  about?: AboutContent;
  resources?: ResourcesContent;
  faq?: FaqContent;
  footer?: FooterContent;
}

export interface HeroContent {
  tagline?: string;
  highlightText?: string;
  ctaPrimary?: {
    label: string;
    linkId?: string;
  };
  ctaSecondary?: {
    label: string;
    linkId?: string;
  };
}

export interface CredentialsContent {
  modality?: string; // "Online e Presencial"
  location?: string; // "São Paulo, SP"
  audience?: string; // "Adultos"
  approach?: string; // "Psicanálise, TCC"
  sessionDuration?: string; // "50 minutos"
  languages?: string; // "Português"
  badges?: Array<{ label: string; icon?: string }>;
}

export interface StartHereContent {
  cards?: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    linkId?: string;
    linkType?: "whatsapp" | "form" | "scroll" | "url";
  }>;
}

export interface CTAsContent {
  layout?: "stack" | "grid";
  showClickCounts?: boolean;
}

export interface AboutContent {
  body?: string;
  bulletPoints?: string[];
  imageAssetId?: string;
  showImage?: boolean;
}

export interface ResourcesContent {
  displayMode?: "cards" | "list";
  resources?: Array<{
    id: string;
    title: string;
    description?: string;
    type: "pdf" | "article" | "guide";
    assetId?: string;
    url?: string;
    icon?: string;
  }>;
}

export interface FaqContent {
  displayMode?: "accordion" | "list";
}

export interface FooterContent {
  showSocials?: boolean;
  showPrivacy?: boolean;
  copyrightText?: string;
  customLinks?: Array<{
    label: string;
    url: string;
  }>;
}

// ---- Analytics ----

export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, string | number | boolean | null | undefined>;
}

export interface TrackingContext {
  sessionId: string;
  pageSlug: string;
  referrer: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  deviceType: "mobile" | "tablet" | "desktop";
}

// ---- Admin / Editor ----

export interface EditorState {
  pageId: string;
  blocks: import("./database").Block[];
  selectedBlockId: string | null;
  isDirty: boolean;
  isPublishing: boolean;
  isSaving: boolean;
  previewMode: "desktop" | "mobile";
  viewMode: "editor" | "preview";
}

// ---- Forms ----

export interface InterestFormData {
  name: string;
  whatsapp: string;
  email?: string;
  contactPreference: "whatsapp" | "email" | "either";
  preferredModality: "online" | "presencial" | "either";
  message?: string;
  bestTime: "manha" | "tarde" | "noite" | "qualquer";
  consent: boolean;
  honeypot?: string; // campo anti-spam, deve estar vazio
}

// ---- API Responses ----

export type ApiResponse<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };
