-- ============================================================
-- THERAPY BIO HUB — Migration 002: Row Level Security Policies
-- ============================================================

-- Habilita RLS em todas as tabelas sensíveis
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.published_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PROFILES — RLS
-- ============================================================

-- Leitura pública do perfil (necessário para renderizar a página)
CREATE POLICY "profiles_public_read"
  ON public.profiles
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Apenas o próprio usuário pode atualizar seu perfil
CREATE POLICY "profiles_owner_update"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Sistema cria perfil via service role
CREATE POLICY "profiles_service_role_insert"
  ON public.profiles
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- ============================================================
-- THEMES — RLS
-- ============================================================

-- Leitura pública do tema (necessário para renderizar)
CREATE POLICY "themes_public_read"
  ON public.themes
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Apenas dono pode modificar
CREATE POLICY "themes_owner_all"
  ON public.themes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = themes.profile_id
        AND profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = themes.profile_id
        AND profiles.user_id = auth.uid()
    )
  );

-- ============================================================
-- PAGES — RLS
-- ============================================================

-- Páginas publicadas são públicas
CREATE POLICY "pages_published_public_read"
  ON public.pages
  FOR SELECT
  TO anon
  USING (status = 'published');

-- Dono pode ver todas as páginas (incluindo draft)
CREATE POLICY "pages_owner_read"
  ON public.pages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = pages.profile_id
        AND profiles.user_id = auth.uid()
    )
  );

-- Dono pode criar/atualizar/deletar suas páginas
CREATE POLICY "pages_owner_write"
  ON public.pages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = pages.profile_id
        AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "pages_owner_update"
  ON public.pages
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = pages.profile_id
        AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "pages_owner_delete"
  ON public.pages
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = pages.profile_id
        AND profiles.user_id = auth.uid()
    )
  );

-- ============================================================
-- BLOCKS — RLS
-- ============================================================

-- Blocos de páginas publicadas são públicos
CREATE POLICY "blocks_public_read"
  ON public.blocks
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE pages.id = blocks.page_id
        AND pages.status = 'published'
    )
  );

-- Dono pode gerenciar seus blocos
CREATE POLICY "blocks_owner_all"
  ON public.blocks
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pages
      JOIN public.profiles ON profiles.id = pages.profile_id
      WHERE pages.id = blocks.page_id
        AND profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pages
      JOIN public.profiles ON profiles.id = pages.profile_id
      WHERE pages.id = blocks.page_id
        AND profiles.user_id = auth.uid()
    )
  );

-- ============================================================
-- LINKS — RLS
-- ============================================================

-- Links de páginas publicadas são públicos
CREATE POLICY "links_public_read"
  ON public.links
  FOR SELECT
  TO anon
  USING (
    is_enabled = true AND
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE pages.id = links.page_id
        AND pages.status = 'published'
    )
  );

-- Dono pode gerenciar seus links
CREATE POLICY "links_owner_all"
  ON public.links
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pages
      JOIN public.profiles ON profiles.id = pages.profile_id
      WHERE pages.id = links.page_id
        AND profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pages
      JOIN public.profiles ON profiles.id = pages.profile_id
      WHERE pages.id = links.page_id
        AND profiles.user_id = auth.uid()
    )
  );

-- Anônimo pode incrementar click_count via RPC (função SECURITY DEFINER)
-- O acesso direto à coluna não é necessário

-- ============================================================
-- ASSETS — RLS
-- ============================================================

-- Assets públicos podem ser lidos por todos (URLs públicas do Storage)
CREATE POLICY "assets_public_read"
  ON public.assets
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Apenas dono pode gerenciar
CREATE POLICY "assets_owner_all"
  ON public.assets
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = assets.profile_id
        AND profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = assets.profile_id
        AND profiles.user_id = auth.uid()
    )
  );

-- ============================================================
-- FAQ_ITEMS — RLS
-- ============================================================

-- FAQs de páginas publicadas são públicos
CREATE POLICY "faq_public_read"
  ON public.faq_items
  FOR SELECT
  TO anon
  USING (
    is_enabled = true AND
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE pages.id = faq_items.page_id
        AND pages.status = 'published'
    )
  );

-- Dono pode gerenciar
CREATE POLICY "faq_owner_all"
  ON public.faq_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pages
      JOIN public.profiles ON profiles.id = pages.profile_id
      WHERE pages.id = faq_items.page_id
        AND profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pages
      JOIN public.profiles ON profiles.id = pages.profile_id
      WHERE pages.id = faq_items.page_id
        AND profiles.user_id = auth.uid()
    )
  );

-- ============================================================
-- FORM_SUBMISSIONS — RLS
-- ============================================================

-- Anônimo pode inserir (formulário público)
CREATE POLICY "form_submissions_anon_insert"
  ON public.form_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (consent = true);  -- Garante consentimento server-side

-- Apenas admin autenticado pode ler e gerenciar
CREATE POLICY "form_submissions_owner_read"
  ON public.form_submissions
  FOR SELECT
  TO authenticated
  USING (
    page_id IS NULL OR
    EXISTS (
      SELECT 1 FROM public.pages
      JOIN public.profiles ON profiles.id = pages.profile_id
      WHERE pages.id = form_submissions.page_id
        AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "form_submissions_owner_update"
  ON public.form_submissions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pages
      JOIN public.profiles ON profiles.id = pages.profile_id
      WHERE pages.id = form_submissions.page_id
        AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "form_submissions_owner_delete"
  ON public.form_submissions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pages
      JOIN public.profiles ON profiles.id = pages.profile_id
      WHERE pages.id = form_submissions.page_id
        AND profiles.user_id = auth.uid()
    )
  );

-- ============================================================
-- LEAD_NOTES — RLS
-- ============================================================

-- Apenas admin pode criar/ler/atualizar notas
CREATE POLICY "lead_notes_owner_all"
  ON public.lead_notes
  FOR ALL
  TO authenticated
  USING (auth.uid() = created_by OR created_by IS NULL)
  WITH CHECK (auth.uid() = created_by);

-- ============================================================
-- PUBLISHED_VERSIONS — RLS
-- ============================================================

-- Versões publicadas são acessíveis para renderização pública
CREATE POLICY "published_versions_public_read"
  ON public.published_versions
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE pages.id = published_versions.page_id
        AND pages.status = 'published'
    )
  );

-- Apenas dono pode criar versões
CREATE POLICY "published_versions_owner_insert"
  ON public.published_versions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pages
      JOIN public.profiles ON profiles.id = pages.profile_id
      WHERE pages.id = published_versions.page_id
        AND profiles.user_id = auth.uid()
    )
  );

-- ============================================================
-- SETTINGS — RLS
-- ============================================================

-- Settings de páginas publicadas são parcialmente públicos
CREATE POLICY "settings_public_read"
  ON public.settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Apenas dono pode modificar
CREATE POLICY "settings_owner_all"
  ON public.settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = settings.profile_id
        AND profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = settings.profile_id
        AND profiles.user_id = auth.uid()
    )
  );

-- ============================================================
-- STORAGE BUCKETS — Criar via Supabase Dashboard ou CLI
-- Execute estes comandos no Supabase SQL Editor:
-- ============================================================

-- Bucket para avatares (público)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880,  -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif']
) ON CONFLICT (id) DO NOTHING;

-- Bucket para PDFs (público)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pdfs',
  'pdfs',
  true,
  52428800,  -- 50MB
  ARRAY['application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Bucket para imagens gerais (público)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  10485760,  -- 10MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- RLS para Storage: apenas autenticados podem fazer upload
CREATE POLICY "storage_authenticated_upload_avatars"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "storage_public_read_avatars"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'avatars');

CREATE POLICY "storage_authenticated_delete_avatars"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatars');

CREATE POLICY "storage_authenticated_upload_pdfs"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'pdfs');

CREATE POLICY "storage_public_read_pdfs"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'pdfs');

CREATE POLICY "storage_authenticated_delete_pdfs"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'pdfs');

CREATE POLICY "storage_authenticated_upload_images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'images');

CREATE POLICY "storage_public_read_images"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'images');

CREATE POLICY "storage_authenticated_delete_images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'images');
