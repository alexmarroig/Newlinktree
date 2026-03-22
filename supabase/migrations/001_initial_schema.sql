-- ============================================================
-- THERAPY BIO HUB — Migration 001: Schema Inicial
-- ============================================================

-- Habilita extensão UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABELA: profiles
-- Dados da terapeuta/profissional
-- ============================================================
CREATE TABLE public.profiles (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name               TEXT NOT NULL,
  professional_title TEXT NOT NULL DEFAULT 'Psicóloga Clínica',
  crp                TEXT,
  bio                TEXT,
  subtitle           TEXT,
  avatar_url         TEXT,
  whatsapp_number    TEXT,
  instagram_url      TEXT,
  website_url        TEXT,
  created_at         TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at         TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================================
-- TABELA: themes
-- Configurações de tema visual por perfil
-- ============================================================
CREATE TABLE public.themes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id        UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  primary_color     TEXT DEFAULT '28 18% 42%' NOT NULL,
  secondary_color   TEXT DEFAULT '35 20% 72%' NOT NULL,
  background_color  TEXT DEFAULT '45 30% 97%' NOT NULL,
  text_color        TEXT DEFAULT '20 12% 11%' NOT NULL,
  accent_color      TEXT DEFAULT '38 22% 85%' NOT NULL,
  font_heading      TEXT DEFAULT 'Playfair Display' NOT NULL,
  font_body         TEXT DEFAULT 'Inter' NOT NULL,
  border_radius     TEXT DEFAULT 'lg' NOT NULL,
  shadow_intensity  TEXT DEFAULT 'soft' NOT NULL,
  layout_width      TEXT DEFAULT 'narrow' NOT NULL,
  card_style        TEXT DEFAULT 'elevated' NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at        TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================================
-- TABELA: pages
-- Páginas do hub (preparado para multi-página futura)
-- ============================================================
CREATE TABLE public.pages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  title           TEXT NOT NULL,
  status          TEXT DEFAULT 'draft' NOT NULL
                    CHECK (status IN ('draft', 'published')),
  seo_title       TEXT,
  seo_description TEXT,
  og_image_url    TEXT,
  canonical_url   TEXT,
  robots          TEXT DEFAULT 'index,follow' NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  published_at    TIMESTAMPTZ
);

CREATE INDEX idx_pages_slug ON public.pages(slug);
CREATE INDEX idx_pages_profile_id ON public.pages(profile_id);

-- ============================================================
-- TABELA: blocks
-- Blocos modulares da página
-- ============================================================
CREATE TABLE public.blocks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id       UUID REFERENCES public.pages(id) ON DELETE CASCADE NOT NULL,
  type          TEXT NOT NULL
                  CHECK (type IN ('hero','credentials','start_here','ctas','about','resources','faq','footer')),
  title         TEXT,
  subtitle      TEXT,
  content_json  JSONB DEFAULT '{}'::jsonb NOT NULL,
  position      INTEGER DEFAULT 0 NOT NULL,
  is_enabled    BOOLEAN DEFAULT true NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_blocks_page_id ON public.blocks(page_id);
CREATE INDEX idx_blocks_position ON public.blocks(page_id, position);

-- ============================================================
-- TABELA: assets
-- Arquivos (imagens, PDFs) no Supabase Storage
-- ============================================================
CREATE TABLE public.assets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name        TEXT NOT NULL,
  file_path   TEXT NOT NULL,
  public_url  TEXT NOT NULL,
  file_type   TEXT NOT NULL,
  mime_type   TEXT,
  size_bytes  BIGINT,
  alt_text    TEXT,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_assets_profile_id ON public.assets(profile_id);

-- ============================================================
-- TABELA: links
-- CTAs e botões de ação
-- ============================================================
CREATE TABLE public.links (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id           UUID REFERENCES public.pages(id) ON DELETE CASCADE NOT NULL,
  block_id          UUID REFERENCES public.blocks(id) ON DELETE SET NULL,
  label             TEXT NOT NULL,
  sublabel          TEXT,
  type              TEXT NOT NULL
                      CHECK (type IN ('whatsapp','url','instagram','download','form','scroll','modal','internal')),
  icon              TEXT,
  url               TEXT,
  whatsapp_message  TEXT,
  file_asset_id     UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  open_in_new_tab   BOOLEAN DEFAULT true NOT NULL,
  variant           TEXT DEFAULT 'primary' NOT NULL
                      CHECK (variant IN ('primary','secondary','ghost','outline','soft')),
  position          INTEGER DEFAULT 0 NOT NULL,
  is_enabled        BOOLEAN DEFAULT true NOT NULL,
  tracking_enabled  BOOLEAN DEFAULT true NOT NULL,
  click_count       INTEGER DEFAULT 0 NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at        TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_links_page_id ON public.links(page_id);
CREATE INDEX idx_links_block_id ON public.links(block_id);
CREATE INDEX idx_links_position ON public.links(page_id, position);

-- ============================================================
-- TABELA: faq_items
-- Perguntas frequentes
-- ============================================================
CREATE TABLE public.faq_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id    UUID REFERENCES public.pages(id) ON DELETE CASCADE NOT NULL,
  question   TEXT NOT NULL,
  answer     TEXT NOT NULL,
  position   INTEGER DEFAULT 0 NOT NULL,
  is_enabled BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_faq_page_id ON public.faq_items(page_id);

-- ============================================================
-- TABELA: form_submissions
-- Formulários de interesse em psicoterapia (leads)
-- ============================================================
CREATE TABLE public.form_submissions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id             UUID REFERENCES public.pages(id) ON DELETE SET NULL,
  name                TEXT NOT NULL,
  whatsapp            TEXT NOT NULL,
  email               TEXT,
  contact_preference  TEXT CHECK (contact_preference IN ('whatsapp','email','either')),
  preferred_modality  TEXT CHECK (preferred_modality IN ('online','presencial','either')),
  message             TEXT,
  best_time           TEXT CHECK (best_time IN ('manha','tarde','noite','qualquer')),
  consent             BOOLEAN NOT NULL DEFAULT false,
  referrer            TEXT,
  utm_source          TEXT,
  utm_medium          TEXT,
  utm_campaign        TEXT,
  utm_term            TEXT,
  session_id          TEXT,
  ip_hash             TEXT,  -- SHA-256 do IP, não o IP real (LGPD)
  status              TEXT DEFAULT 'new' NOT NULL
                        CHECK (status IN ('new','contacted','in_progress','archived')),
  created_at          TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_form_submissions_page_id ON public.form_submissions(page_id);
CREATE INDEX idx_form_submissions_status ON public.form_submissions(status);
CREATE INDEX idx_form_submissions_created_at ON public.form_submissions(created_at DESC);

-- ============================================================
-- TABELA: lead_notes
-- Notas internas sobre cada lead
-- ============================================================
CREATE TABLE public.lead_notes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES public.form_submissions(id) ON DELETE CASCADE NOT NULL,
  note          TEXT NOT NULL,
  created_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_lead_notes_submission_id ON public.lead_notes(submission_id);

-- ============================================================
-- TABELA: published_versions
-- Snapshots de versões publicadas da página
-- ============================================================
CREATE TABLE public.published_versions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id        UUID REFERENCES public.pages(id) ON DELETE CASCADE NOT NULL,
  version_number INTEGER NOT NULL,
  snapshot_json  JSONB NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT now() NOT NULL,
  published_by   UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  UNIQUE(page_id, version_number)
);

CREATE INDEX idx_published_versions_page_id ON public.published_versions(page_id);

-- ============================================================
-- TABELA: settings
-- Configurações gerais do sistema por perfil
-- ============================================================
CREATE TABLE public.settings (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id                 UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  privacy_policy             TEXT,
  consent_text               TEXT DEFAULT 'Concordo com a política de privacidade e autorizo o contato para fins relacionados à psicoterapia.' NOT NULL,
  timezone                   TEXT DEFAULT 'America/Sao_Paulo' NOT NULL,
  locale                     TEXT DEFAULT 'pt-BR' NOT NULL,
  site_url                   TEXT,
  contact_email              TEXT,
  whatsapp_default_message   TEXT DEFAULT 'Olá! Vim pelo seu perfil e gostaria de saber mais sobre o processo terapêutico.',
  created_at                 TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at                 TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================================
-- FUNÇÃO: updated_at trigger
-- Atualiza o campo updated_at automaticamente
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplica o trigger em todas as tabelas com updated_at
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_themes_updated_at
  BEFORE UPDATE ON public.themes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_pages_updated_at
  BEFORE UPDATE ON public.pages
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_blocks_updated_at
  BEFORE UPDATE ON public.blocks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_links_updated_at
  BEFORE UPDATE ON public.links
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_faq_items_updated_at
  BEFORE UPDATE ON public.faq_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- FUNÇÃO: increment_link_click
-- Incrementa contagem de cliques de forma atômica
-- ============================================================
CREATE OR REPLACE FUNCTION public.increment_link_click(link_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.links
  SET click_count = click_count + 1
  WHERE id = link_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
