-- ============================================================
-- THERAPY BIO HUB — Migration 008: SaaS, assinaturas e onboarding
-- ============================================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id                  UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan_code                   TEXT NOT NULL DEFAULT 'professional'
                                CHECK (plan_code IN ('professional','premium')),
  status                      TEXT NOT NULL DEFAULT 'trialing'
                                CHECK (status IN ('trialing','pending','active','past_due','paused','canceled','expired')),
  provider                    TEXT NOT NULL DEFAULT 'mercado_pago',
  provider_subscription_id    TEXT,
  provider_customer_id        TEXT,
  checkout_url                TEXT,
  trial_ends_at               TIMESTAMPTZ DEFAULT (now() + interval '7 days'),
  current_period_ends_at      TIMESTAMPTZ,
  canceled_at                 TIMESTAMPTZ,
  created_at                  TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at                  TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_profile_id ON public.subscriptions(profile_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_provider_subscription_id
  ON public.subscriptions(provider_subscription_id);

CREATE TABLE IF NOT EXISTS public.billing_events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider          TEXT NOT NULL DEFAULT 'mercado_pago',
  provider_event_id TEXT NOT NULL,
  event_type        TEXT NOT NULL,
  payload_json      JSONB NOT NULL,
  processed_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(provider, provider_event_id)
);

CREATE TABLE IF NOT EXISTS public.page_templates (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code         TEXT NOT NULL UNIQUE,
  name         TEXT NOT NULL,
  description  TEXT,
  blocks_json  JSONB NOT NULL,
  links_json   JSONB NOT NULL DEFAULT '[]'::jsonb,
  faq_json     JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active    BOOLEAN DEFAULT true NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_owner_read"
  ON public.subscriptions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = subscriptions.profile_id
        AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "subscriptions_service_role_all"
  ON public.subscriptions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "billing_events_service_role_all"
  ON public.billing_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "page_templates_authenticated_read"
  ON public.page_templates
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "page_templates_service_role_all"
  ON public.page_templates
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE TRIGGER set_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Recria estatísticas de leads com filtro explícito por perfil para evitar vazamento entre tenants.
DROP FUNCTION IF EXISTS public.get_leads_by_day(INTEGER);

CREATE OR REPLACE FUNCTION public.get_leads_by_day(p_profile_id UUID, days_back INTEGER DEFAULT 30)
RETURNS TABLE (day DATE, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE_TRUNC('day', form_submissions.created_at)::DATE AS day,
    COUNT(*) AS count
  FROM public.form_submissions
  JOIN public.pages ON pages.id = form_submissions.page_id
  WHERE pages.profile_id = p_profile_id
    AND form_submissions.created_at >= NOW() - (days_back || ' days')::INTERVAL
  GROUP BY DATE_TRUNC('day', form_submissions.created_at)::DATE
  ORDER BY day ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

INSERT INTO public.page_templates (code, name, description, blocks_json, links_json, faq_json)
VALUES (
  'psicologa_classica',
  'Psicóloga clássica',
  'Template inicial para psicólogas com acolhimento, WhatsApp, formulário e FAQ.',
  '[
    {"type":"hero","title":"Atendimento psicológico com acolhimento e ética","subtitle":"Um espaço seguro para você se escutar, se organizar e cuidar da sua saúde emocional.","content_json":{"tagline":"Psicoterapia online","highlightText":"Comece pelo canal que for mais confortável para você."},"position":0,"is_enabled":true},
    {"type":"credentials","title":"Informações do atendimento","subtitle":null,"content_json":{"modality":"Online","location":"Brasil","audience":"Adultos","approach":"Psicoterapia","sessionDuration":"50 minutos","languages":"Português"},"position":1,"is_enabled":true},
    {"type":"ctas","title":"Agende ou tire dúvidas","subtitle":null,"content_json":{"layout":"stack","showClickCounts":false},"position":2,"is_enabled":true},
    {"type":"about","title":"Sobre meu trabalho","subtitle":null,"content_json":{"body":"Use este espaço para explicar sua abordagem, experiência e forma de conduzir o processo terapêutico.","bulletPoints":["Atendimento ético e sigiloso","Escuta qualificada","Plano de cuidado construído com cada pessoa"],"showImage":false},"position":3,"is_enabled":true},
    {"type":"faq","title":"Perguntas frequentes","subtitle":null,"content_json":{"displayMode":"accordion"},"position":4,"is_enabled":true},
    {"type":"footer","title":null,"subtitle":null,"content_json":{"showSocials":true,"showPrivacy":true},"position":5,"is_enabled":true}
  ]'::jsonb,
  '[
    {"label":"Conversar pelo WhatsApp","type":"whatsapp","icon":"MessageCircle","variant":"primary","position":0,"is_enabled":true,"tracking_enabled":true},
    {"label":"Tenho interesse em terapia","type":"form","icon":"HeartHandshake","variant":"secondary","position":1,"is_enabled":true,"tracking_enabled":true}
  ]'::jsonb,
  '[
    {"question":"Como funciona a primeira conversa?","answer":"A primeira conversa serve para entender sua demanda, explicar o funcionamento do processo e combinar os próximos passos.","position":0,"is_enabled":true},
    {"question":"O atendimento é sigiloso?","answer":"Sim. O atendimento psicológico segue princípios éticos e de confidencialidade previstos para a profissão.","position":1,"is_enabled":true}
  ]'::jsonb
)
ON CONFLICT (code) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  blocks_json = EXCLUDED.blocks_json,
  links_json = EXCLUDED.links_json,
  faq_json = EXCLUDED.faq_json,
  is_active = true;

-- Storage: restringe uploads novos à pasta do profile_id do próprio usuário.
DROP POLICY IF EXISTS "storage_authenticated_upload_avatars" ON storage.objects;
DROP POLICY IF EXISTS "storage_authenticated_upload_pdfs" ON storage.objects;
DROP POLICY IF EXISTS "storage_authenticated_upload_images" ON storage.objects;
DROP POLICY IF EXISTS "storage_authenticated_delete_avatars" ON storage.objects;
DROP POLICY IF EXISTS "storage_authenticated_delete_pdfs" ON storage.objects;
DROP POLICY IF EXISTS "storage_authenticated_delete_images" ON storage.objects;

CREATE POLICY "storage_owner_upload_avatars"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
        AND profiles.id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "storage_owner_delete_avatars"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
        AND profiles.id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "storage_owner_upload_pdfs"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'pdfs'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
        AND profiles.id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "storage_owner_delete_pdfs"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'pdfs'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
        AND profiles.id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "storage_owner_upload_images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'images'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
        AND profiles.id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "storage_owner_delete_images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'images'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
        AND profiles.id::text = (storage.foldername(name))[1]
    )
  );

-- Lead notes: escopo por submissão/página do dono, não apenas created_by.
DROP POLICY IF EXISTS "lead_notes_owner_all" ON public.lead_notes;

CREATE POLICY "lead_notes_owner_all"
  ON public.lead_notes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.form_submissions
      JOIN public.pages ON pages.id = form_submissions.page_id
      JOIN public.profiles ON profiles.id = pages.profile_id
      WHERE form_submissions.id = lead_notes.submission_id
        AND profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.form_submissions
      JOIN public.pages ON pages.id = form_submissions.page_id
      JOIN public.profiles ON profiles.id = pages.profile_id
      WHERE form_submissions.id = lead_notes.submission_id
        AND profiles.user_id = auth.uid()
    )
  );
