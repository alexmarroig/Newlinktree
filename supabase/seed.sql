-- ============================================================
-- THERAPY BIO HUB — Seed Data
-- Camila Freitas (VERSÃO FINAL LIMPA)
-- ============================================================

DO $$
DECLARE
  v_user_id     UUID := '619d28a3-89c9-414c-be64-ea3bd98c6f70';
  v_profile_id  UUID := gen_random_uuid();
  v_page_id     UUID := gen_random_uuid();
  v_theme_id    UUID := gen_random_uuid();
  v_settings_id UUID := gen_random_uuid();

  v_block_hero_id        UUID := gen_random_uuid();
  v_block_creds_id       UUID := gen_random_uuid();
  v_block_start_id       UUID := gen_random_uuid();
  v_block_ctas_id        UUID := gen_random_uuid();
  v_block_about_id       UUID := gen_random_uuid();
  v_block_resources_id   UUID := gen_random_uuid();
  v_block_faq_id         UUID := gen_random_uuid();
  v_block_footer_id      UUID := gen_random_uuid();

  v_link_whatsapp_id UUID := gen_random_uuid();
  v_link_form_id     UUID := gen_random_uuid();
  v_link_site_id     UUID := gen_random_uuid();
  v_link_instagram_id UUID := gen_random_uuid();
  v_link_tcc_id      UUID := gen_random_uuid();
  v_link_how_id      UUID := gen_random_uuid();

BEGIN

-- ============================================================
-- PERFIL
-- ============================================================
INSERT INTO public.profiles (
  id, user_id, name, professional_title, crp,
  bio, subtitle, whatsapp_number, instagram_url, website_url, avatar_url
) VALUES (
  v_profile_id,
  v_user_id,
  'Camila Freitas',
  'Psicóloga Clínica',
  'CRP 06/201444',
  'Psicóloga especializada em psicoterapia para adultos, com foco em ansiedade, autoconhecimento e transições de vida.',
  'Atendimentos online e presenciais · São Paulo, SP',
  '5511943937007',
  'https://instagram.com/psi.cavfreitas',
  'https://www.psicavfreitas.com.br',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face'
);

-- ============================================================
-- TEMA
-- ============================================================
INSERT INTO public.themes (
  id, profile_id,
  primary_color, secondary_color, background_color,
  text_color, accent_color, font_heading, font_body,
  border_radius, shadow_intensity, layout_width, card_style
) VALUES (
  v_theme_id, v_profile_id,
  '28 18% 42%',
  '35 20% 72%',
  '45 30% 97%',
  '20 12% 11%',
  '38 22% 85%',
  'Playfair Display',
  'Inter',
  'lg', 'soft', 'narrow', 'elevated'
);

-- ============================================================
-- PÁGINA
-- ============================================================
INSERT INTO public.pages (
  id, profile_id, slug, title, status,
  seo_title, seo_description,
  published_at
) VALUES (
  v_page_id, v_profile_id,
  'camila-freitas',
  'Camila Freitas — Psicóloga Clínica',
  'published',
  'Camila Freitas | Psicóloga Clínica',
  'Psicóloga clínica especializada em psicoterapia para adultos.',
  now()
);

-- ============================================================
-- BLOCOS
-- ============================================================

INSERT INTO public.blocks (id, page_id, type, position, content_json) VALUES (
  v_block_hero_id, v_page_id, 'hero', 0,
  '{
    "tagline": "Psicoterapia com presença e cuidado",
    "highlightText": "Um espaço seguro para se conhecer melhor"
  }'::jsonb
);

INSERT INTO public.blocks (id, page_id, type, position, content_json) VALUES (
  v_block_creds_id, v_page_id, 'credentials', 1,
  '{
    "modality": "Online e Presencial",
    "location": "São Paulo, SP",
    "audience": "Adultos",
    "approach": "Psicanálise",
    "sessionDuration": "50 minutos",
    "languages": "Português"
  }'::jsonb
);

INSERT INTO public.blocks (id, page_id, type, position, content_json) VALUES (
  v_block_ctas_id, v_page_id, 'ctas', 2,
  '{"layout": "stack"}'::jsonb
);

INSERT INTO public.blocks (id, page_id, type, position, content_json) VALUES (
  v_block_footer_id, v_page_id, 'footer', 3,
  '{
    "copyrightText": "© 2025 Camila Freitas. CRP 06/201444"
  }'::jsonb
);

-- ============================================================
-- LINKS
-- ============================================================

INSERT INTO public.links (
  id, page_id, block_id, label, type,
  url, whatsapp_message, position
) VALUES
(
  v_link_whatsapp_id, v_page_id, v_block_ctas_id,
  'Quero iniciar terapia',
  'whatsapp',
  null,
  'Olá, Camila! Vim pelo seu site e gostaria de iniciar terapia 😊',
  0
),
(
  v_link_site_id, v_page_id, v_block_ctas_id,
  'Acessar site completo',
  'url',
  'https://www.psicavfreitas.com.br',
  null,
  1
),
(
  v_link_instagram_id, v_page_id, v_block_ctas_id,
  'Instagram',
  'instagram',
  'https://instagram.com/psi.cavfreitas',
  null,
  2
);

-- ============================================================
-- SETTINGS
-- ============================================================

INSERT INTO public.settings (
  id, profile_id, consent_text, site_url, contact_email, whatsapp_default_message
) VALUES (
  v_settings_id, v_profile_id,
  'Concordo com a política de privacidade conforme LGPD.',
  'https://www.psicavfreitas.com.br',
  'contato@psicavfreitas.com.br',
  'Olá, Camila! Vim pelo site 😊'
);

END $$;
