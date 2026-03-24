/**
 * Tipos gerados a partir do schema do Supabase.
 * Em produção, gere via: supabase gen types typescript
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          professional_title: string;
          crp: string | null;
          bio: string | null;
          subtitle: string | null;
          avatar_url: string | null;
          whatsapp_number: string | null;
          instagram_url: string | null;
          website_url: string | null;
          linkedin_url: string | null;
          youtube_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          professional_title: string;
          crp?: string | null;
          bio?: string | null;
          subtitle?: string | null;
          avatar_url?: string | null;
          whatsapp_number?: string | null;
          instagram_url?: string | null;
          website_url?: string | null;
          linkedin_url?: string | null;
          youtube_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      themes: {
        Row: {
          id: string;
          profile_id: string;
          primary_color: string;
          secondary_color: string;
          background_color: string;
          text_color: string;
          accent_color: string;
          font_heading: string;
          font_body: string;
          border_radius: string;
          shadow_intensity: string;
          layout_width: string;
          card_style: string;
          background_image_url: string | null;
          background_type: string;
          button_style: string;
          button_color: string | null;
          button_text_color: string | null;
          button_shadow: string;
          button_roundness: string;
          wallpaper_effect: string;
          wallpaper_tint: number;
          wallpaper_noise: boolean;
          title_size: string;
          avatar_layout: string;
          title_font_color: string | null;
          page_text_color: string | null;
          page_font: string;
          button_animation: string;
          profile_badge_text: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          primary_color?: string;
          secondary_color?: string;
          background_color?: string;
          text_color?: string;
          accent_color?: string;
          font_heading?: string;
          font_body?: string;
          border_radius?: string;
          shadow_intensity?: string;
          layout_width?: string;
          card_style?: string;
          background_image_url?: string | null;
          background_type?: string;
          button_style?: string;
          button_color?: string | null;
          button_text_color?: string | null;
          button_shadow?: string;
          button_roundness?: string;
          button_animation?: string;
          profile_badge_text?: string | null;
          wallpaper_effect?: string;
          wallpaper_tint?: number;
          wallpaper_noise?: boolean;
          title_size?: string;
          avatar_layout?: string;
          title_font_color?: string | null;
          page_text_color?: string | null;
          page_font?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["themes"]["Insert"]>;
      };
      pages: {
        Row: {
          id: string;
          profile_id: string;
          slug: string;
          title: string;
          status: "draft" | "published";
          seo_title: string | null;
          seo_description: string | null;
          og_image_url: string | null;
          canonical_url: string | null;
          robots: string;
          created_at: string;
          updated_at: string;
          published_at: string | null;
        };
        Insert: {
          id?: string;
          profile_id: string;
          slug: string;
          title: string;
          status?: "draft" | "published";
          seo_title?: string | null;
          seo_description?: string | null;
          og_image_url?: string | null;
          canonical_url?: string | null;
          robots?: string;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["pages"]["Insert"]>;
      };
      blocks: {
        Row: {
          id: string;
          page_id: string;
          type: BlockType;
          title: string | null;
          subtitle: string | null;
          content_json: Json;
          position: number;
          is_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          page_id: string;
          type: BlockType;
          title?: string | null;
          subtitle?: string | null;
          content_json?: Json;
          position?: number;
          is_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["blocks"]["Insert"]>;
      };
      links: {
        Row: {
          id: string;
          page_id: string;
          block_id: string | null;
          label: string;
          sublabel: string | null;
          type: LinkType;
          icon: string | null;
          url: string | null;
          whatsapp_message: string | null;
          file_asset_id: string | null;
          open_in_new_tab: boolean;
          variant: LinkVariant;
          position: number;
          is_enabled: boolean;
          tracking_enabled: boolean;
          click_count: number;
          thumbnail_url: string | null;
          custom_bg_color: string | null;
          custom_text_color: string | null;
          custom_icon: string | null;
          link_animation: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          page_id: string;
          block_id?: string | null;
          label: string;
          sublabel?: string | null;
          type: LinkType;
          icon?: string | null;
          url?: string | null;
          whatsapp_message?: string | null;
          file_asset_id?: string | null;
          open_in_new_tab?: boolean;
          variant?: LinkVariant;
          position?: number;
          is_enabled?: boolean;
          tracking_enabled?: boolean;
          click_count?: number;
          thumbnail_url?: string | null;
          custom_bg_color?: string | null;
          custom_text_color?: string | null;
          custom_icon?: string | null;
          link_animation?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["links"]["Insert"]>;
      };
      assets: {
        Row: {
          id: string;
          profile_id: string;
          name: string;
          file_path: string;
          public_url: string;
          file_type: string;
          mime_type: string | null;
          size_bytes: number | null;
          alt_text: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          name: string;
          file_path: string;
          public_url: string;
          file_type: string;
          mime_type?: string | null;
          size_bytes?: number | null;
          alt_text?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["assets"]["Insert"]>;
      };
      faq_items: {
        Row: {
          id: string;
          page_id: string;
          question: string;
          answer: string;
          position: number;
          is_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          page_id: string;
          question: string;
          answer: string;
          position?: number;
          is_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["faq_items"]["Insert"]>;
      };
      form_submissions: {
        Row: {
          id: string;
          page_id: string | null;
          name: string;
          whatsapp: string;
          email: string | null;
          contact_preference: ContactPreference | null;
          preferred_modality: PreferredModality | null;
          message: string | null;
          best_time: BestTime | null;
          consent: boolean;
          referrer: string | null;
          utm_source: string | null;
          utm_medium: string | null;
          utm_campaign: string | null;
          utm_term: string | null;
          session_id: string | null;
          ip_hash: string | null;
          status: LeadStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          page_id?: string | null;
          name: string;
          whatsapp: string;
          email?: string | null;
          contact_preference?: ContactPreference | null;
          preferred_modality?: PreferredModality | null;
          message?: string | null;
          best_time?: BestTime | null;
          consent: boolean;
          referrer?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          utm_term?: string | null;
          session_id?: string | null;
          ip_hash?: string | null;
          status?: LeadStatus;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["form_submissions"]["Insert"]
        >;
      };
      lead_notes: {
        Row: {
          id: string;
          submission_id: string;
          note: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          submission_id: string;
          note: string;
          created_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["lead_notes"]["Insert"]>;
      };
      published_versions: {
        Row: {
          id: string;
          page_id: string;
          version_number: number;
          snapshot_json: Json;
          created_at: string;
          published_by: string | null;
        };
        Insert: {
          id?: string;
          page_id: string;
          version_number: number;
          snapshot_json: Json;
          created_at?: string;
          published_by?: string | null;
        };
        Update: Partial<
          Database["public"]["Tables"]["published_versions"]["Insert"]
        >;
      };
      settings: {
        Row: {
          id: string;
          profile_id: string;
          privacy_policy: string | null;
          consent_text: string;
          timezone: string;
          locale: string;
          site_url: string | null;
          contact_email: string | null;
          whatsapp_default_message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          privacy_policy?: string | null;
          consent_text?: string;
          timezone?: string;
          locale?: string;
          site_url?: string | null;
          contact_email?: string | null;
          whatsapp_default_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["settings"]["Insert"]>;
      };
    };
  };
};

// ---- Enums e tipos derivados ----

export type BlockType =
  | "hero"
  | "credentials"
  | "start_here"
  | "ctas"
  | "about"
  | "resources"
  | "faq"
  | "footer";

export type LinkType =
  | "whatsapp"
  | "url"
  | "instagram"
  | "download"
  | "form"
  | "scroll"
  | "modal"
  | "internal"
  | "divider";

export type LinkVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "outline"
  | "soft";

export type LeadStatus = "new" | "contacted" | "in_progress" | "archived";
export type ContactPreference = "whatsapp" | "email" | "either";
export type PreferredModality = "online" | "presencial" | "either";
export type BestTime = "manha" | "tarde" | "noite" | "qualquer";

// ---- Row types shorthand ----
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Theme = Database["public"]["Tables"]["themes"]["Row"];
export type Page = Database["public"]["Tables"]["pages"]["Row"];
export type Block = Database["public"]["Tables"]["blocks"]["Row"];
export type Link = Database["public"]["Tables"]["links"]["Row"];
export type Asset = Database["public"]["Tables"]["assets"]["Row"];
export type FaqItem = Database["public"]["Tables"]["faq_items"]["Row"];
export type FormSubmission =
  Database["public"]["Tables"]["form_submissions"]["Row"];
export type LeadNote = Database["public"]["Tables"]["lead_notes"]["Row"];
export type PublishedVersion =
  Database["public"]["Tables"]["published_versions"]["Row"];
export type Settings = Database["public"]["Tables"]["settings"]["Row"];
