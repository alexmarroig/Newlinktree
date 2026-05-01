-- ============================================================
-- THERAPY BIO HUB - Seed Data
-- Camila Freitas (clean version without TCC resources)
-- ============================================================

DO $$
DECLARE
  v_user_id     UUID := '619d28a3-89c9-414c-be64-ea3bd98c6f70';
  v_profile_id  UUID := gen_random_uuid();
  v_page_id     UUID := gen_random_uuid();
  v_theme_id    UUID := gen_random_uuid();
  v_settings_id UUID := gen_random_uuid();

  v_block_hero_id   UUID := gen_random_uuid();
  v_block_creds_id  UUID := gen_random_uuid();
  v_block_ctas_id   UUID := gen_random_uuid();
  v_block_footer_id UUID := gen_random_uuid();

  v_link_whatsapp_id  UUID := gen_random_uuid();
  v_link_site_id      UUID := gen_random_uuid();
  v_link_instagram_id UUID := gen_random_uuid();
BEGIN

INSERT INTO public.profiles (
  id, user_id, name, professional_title, crp,
  bio, subtitle, whatsapp_number, instagram_url, website_url, avatar_url
) VALUES (
  v_profile_id,
  v_user_id,
  'Camila Freitas',
  'Psicologa Clinica',
  'CRP 06/201444',
  'Psicologa especializada em psicoterapia para adultos, com foco em ansiedade, autoconhecimento e transicoes de vida.',
  'Atendimentos online e presenciais - Sao Paulo, SP',
  '5511943937007',
  'https://instagram.com/psi.cavfreitas',
  'https://www.psicavfreitas.com.br',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face'
);

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

INSERT INTO public.pages (
  id, profile_id, slug, title, status,
  seo_title, seo_description,
  published_at
) VALUES (
  v_page_id, v_profile_id,
  'camila-freitas',
  'Camila Freitas - Psicologa Clinica',
  'published',
  'Camila Freitas | Psicologa Clinica',
  'Psicologa clinica especializada em psicoterapia para adultos.',
  now()
);

INSERT INTO public.blocks (id, page_id, type, position, content_json) VALUES
(
  v_block_hero_id, v_page_id, 'hero', 0,
  '{"tagline":"Psicoterapia com presenca e cuidado","highlightText":"Um espaco seguro para se conhecer melhor"}'::jsonb
),
(
  v_block_creds_id, v_page_id, 'credentials', 1,
  '{"modality":"Online e Presencial","location":"Sao Paulo, SP","audience":"Adultos","approach":"Psicanalise","sessionDuration":"50 minutos","languages":"Portugues"}'::jsonb
),
(
  v_block_ctas_id, v_page_id, 'ctas', 2,
  '{"layout":"stack"}'::jsonb
),
(
  v_block_footer_id, v_page_id, 'footer', 3,
  '{"copyrightText":"2025 Camila Freitas. CRP 06/201444"}'::jsonb
);

INSERT INTO public.links (
  id, page_id, block_id, label, type,
  url, whatsapp_message, position
) VALUES
(
  v_link_whatsapp_id, v_page_id, v_block_ctas_id,
  'Quero iniciar terapia',
  'whatsapp',
  null,
  'Ola, Camila! Vim pelo seu site e gostaria de iniciar terapia.',
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

INSERT INTO public.settings (
  id, profile_id, consent_text, site_url, contact_email, whatsapp_default_message
) VALUES (
  v_settings_id, v_profile_id,
  'Concordo com a politica de privacidade conforme LGPD.',
  'https://www.psicavfreitas.com.br',
  'contato@psicavfreitas.com.br',
  'Ola, Camila! Vim pelo site.'
);

END $$;
