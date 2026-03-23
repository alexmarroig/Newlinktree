-- ============================================================
-- THERAPY BIO HUB — Seed Data
-- Dados iniciais realistas para Ana Silva, psicóloga
-- ============================================================
-- ATENÇÃO: Este seed cria um usuário admin. Execute APÓS criar
-- o usuário no Supabase Auth Dashboard.
-- Substitua o UUID abaixo pelo UUID real do usuário criado.
-- ============================================================

-- Variáveis (substitua pelos valores reais)
DO $$
DECLARE
  v_user_id     UUID := '619d28a3-89c9-414c-be64-ea3bd98c6f70';
  v_profile_id  UUID := gen_random_uuid();
  v_page_id     UUID := gen_random_uuid();
  v_theme_id    UUID := gen_random_uuid();
  v_settings_id UUID := gen_random_uuid();

  -- Blocos
  v_block_hero_id        UUID := gen_random_uuid();
  v_block_creds_id       UUID := gen_random_uuid();
  v_block_start_id       UUID := gen_random_uuid();
  v_block_ctas_id        UUID := gen_random_uuid();
  v_block_about_id       UUID := gen_random_uuid();
  v_block_resources_id   UUID := gen_random_uuid();
  v_block_faq_id         UUID := gen_random_uuid();
  v_block_footer_id      UUID := gen_random_uuid();

  -- Links
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
  bio, subtitle, whatsapp_number, instagram_url, website_url
) VALUES (
  v_profile_id,
  v_user_id,
  'Ana Clara Silva',
  'Psicóloga Clínica',
  'CRP 06/123456',
  'Psicóloga especializada em psicoterapia para adultos, com foco em ansiedade, autoconhecimento e transições de vida. Acredito que o processo terapêutico é um caminho único de descoberta e transformação.',
  'Atendimentos online e presenciais · São Paulo, SP',
  '5511999999999',
  'https://instagram.com/anaclarasilva.psi',
  'https://anaclarasilva.com.br'
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
  '28 18% 42%',     -- warm stone
  '35 20% 72%',     -- warm stone light
  '45 30% 97%',     -- warm stone 50
  '20 12% 11%',     -- warm stone 950
  '38 22% 85%',     -- warm stone 200
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
  'Camila-Freitas',
  'Camila Freitas — Psicóloga Clínica',
  'published',
  'Camila Freitas | Psicóloga Clínica',
  'Psicóloga clínica especializada em psicoterapia para adultos.',
  now()
);

-- ============================================================
-- BLOCOS
-- ============================================================

-- Hero
INSERT INTO public.blocks (id, page_id, type, position, content_json) VALUES (
  v_block_hero_id, v_page_id, 'hero', 0,
  '{
    "tagline": "Psicoterapia com presença e cuidado",
    "highlightText": "Um espaço seguro para se conhecer melhor",
    "ctaPrimary": {"label": "Quero iniciar terapia", "linkId": null},
    "ctaSecondary": {"label": "Saiba mais", "linkId": null}
  }'::jsonb
);

-- Credenciais
INSERT INTO public.blocks (id, page_id, type, position, content_json) VALUES (
  v_block_creds_id, v_page_id, 'credentials', 1,
  '{
    "modality": "Online e Presencial",
    "location": "São Paulo, SP",
    "audience": "Adultos",
    "approach": "Psicanálise, Psicologia Analítica",
    "sessionDuration": "50 minutos",
    "languages": "Português",
    "badges": [
      {"label": "Ansiedade", "icon": "Brain"},
      {"label": "Autoconhecimento", "icon": "Sparkles"},
      {"label": "Transições de vida", "icon": "Compass"},
      {"label": "Relacionamentos", "icon": "Heart"}
    ]
  }'::jsonb
);

-- Comece por aqui
INSERT INTO public.blocks (id, page_id, type, position, content_json) VALUES (
  v_block_start_id, v_page_id, 'start_here', 2,
  '{
    "cards": [
      {
        "id": "card-1",
        "title": "Quero iniciar terapia",
        "description": "Entre em contato para conversarmos sobre como posso te ajudar",
        "icon": "MessageCircle",
        "linkType": "whatsapp"
      },
      {
        "id": "card-2",
        "title": "Como funciona?",
        "description": "Entenda o processo terapêutico e o que esperar das sessões",
        "icon": "HelpCircle",
        "linkType": "scroll"
      },
      {
        "id": "card-3",
        "title": "Conheça meu trabalho",
        "description": "Saiba mais sobre minha abordagem e formação",
        "icon": "BookOpen",
        "linkType": "url"
      },
      {
        "id": "card-4",
        "title": "Baixar meu TCC",
        "description": "Acesse gratuitamente meu trabalho de conclusão de curso",
        "icon": "Download",
        "linkType": "download"
      }
    ]
  }'::jsonb
);

-- CTAs
INSERT INTO public.blocks (id, page_id, type, position, content_json) VALUES (
  v_block_ctas_id, v_page_id, 'ctas', 3,
  '{"layout": "stack", "showClickCounts": false}'::jsonb
);

-- Sobre
INSERT INTO public.blocks (id, page_id, type, title, subtitle, position, content_json) VALUES (
  v_block_about_id, v_page_id, 'about',
  'Sobre o meu trabalho',
  'Uma abordagem que respeita o seu tempo e seu processo',
  4,
  '{
    "body": "A psicoterapia é um espaço de escuta genuína, onde você pode explorar seus pensamentos, emoções e padrões com segurança e sem julgamentos.\n\nMeu trabalho é fundamentado na escuta cuidadosa e no respeito ao tempo único de cada pessoa. Não existe fórmula ou prazo certo — cada processo é singular como o ser humano que o vive.\n\nAtendo adultos que buscam maior autoconhecimento, que enfrentam ansiedade, dificuldades nos relacionamentos, transições de vida, ou simplesmente desejam se entender melhor.",
    "bulletPoints": [
      "Formação em Psicologia pela USP",
      "Especialização em Psicoterapia Psicanalítica",
      "Membro do Conselho Regional de Psicologia SP",
      "Atendimento sigiloso e ético conforme o CFP"
    ],
    "showImage": false
  }'::jsonb
);

-- Recursos
INSERT INTO public.blocks (id, page_id, type, title, subtitle, position, content_json) VALUES (
  v_block_resources_id, v_page_id, 'resources',
  'Recursos gratuitos',
  'Materiais para te ajudar no caminho do autoconhecimento',
  5,
  '{
    "displayMode": "cards",
    "resources": [
      {
        "id": "r-1",
        "title": "Meu TCC — Ansiedade na Contemporaneidade",
        "description": "Meu trabalho de conclusão de curso sobre ansiedade e os desafios da vida moderna. Acesso gratuito.",
        "type": "pdf",
        "icon": "FileText"
      },
      {
        "id": "r-2",
        "title": "O que é a psicoterapia?",
        "description": "Um guia introdutório sobre o processo terapêutico, o que esperar e como funciona na prática.",
        "type": "guide",
        "icon": "BookOpen"
      }
    ]
  }'::jsonb
);

-- FAQ
INSERT INTO public.blocks (id, page_id, type, title, subtitle, position, content_json) VALUES (
  v_block_faq_id, v_page_id, 'faq',
  'Perguntas frequentes',
  'Respostas honestas para as dúvidas mais comuns',
  6,
  '{}'::jsonb
);

-- Footer
INSERT INTO public.blocks (id, page_id, type, position, content_json) VALUES (
  v_block_footer_id, v_page_id, 'footer', 7,
  '{
    "showSocials": true,
    "showPrivacy": true,
    "copyrightText": "© 2025 Ana Clara Silva. CRP 06/123456. Todos os direitos reservados."
  }'::jsonb
);

-- ============================================================
-- LINKS / CTAs
-- ============================================================

INSERT INTO public.links (
  id, page_id, block_id, label, sublabel, type, icon,
  url, whatsapp_message, variant, position
) VALUES
(
  v_link_whatsapp_id, v_page_id, v_block_ctas_id,
  'Quero iniciar terapia',
  'Vamos conversar? Respondo em até 24h',
  'whatsapp', 'MessageCircle',
  null,
  'Olá, Ana Clara! Vim pelo seu perfil e gostaria de saber mais sobre como iniciar o processo terapêutico. 😊',
  'primary', 0
),
(
  v_link_form_id, v_page_id, v_block_ctas_id,
  'Formulário de interesse',
  'Preencha e entrarei em contato',
  'form', 'ClipboardList',
  null, null, 'secondary', 1
),
(
  v_link_site_id, v_page_id, v_block_ctas_id,
  'Conhecer meu site',
  'Saiba mais sobre minha formação e abordagem',
  'url', 'Globe',
  'https://anaclarasilva.com.br', null,
  'ghost', 2
),
(
  v_link_instagram_id, v_page_id, v_block_ctas_id,
  'Ver meu Instagram',
  'Conteúdo sobre saúde mental e psicologia',
  'instagram', 'Instagram',
  'https://instagram.com/anaclarasilva.psi', null,
  'ghost', 3
),
(
  v_link_tcc_id, v_page_id, v_block_ctas_id,
  'Baixar meu TCC',
  'Ansiedade na Contemporaneidade — acesso gratuito',
  'download', 'Download',
  null, null,
  'outline', 4
),
(
  v_link_how_id, v_page_id, v_block_ctas_id,
  'Como funciona a psicoterapia?',
  'Entenda o processo antes de começar',
  'scroll', 'HelpCircle',
  '#faq', null,
  'ghost', 5
);

-- ============================================================
-- FAQ ITEMS
-- ============================================================
INSERT INTO public.faq_items (page_id, question, answer, position) VALUES
(
  v_page_id,
  'Como funciona a primeira sessão?',
  'A primeira sessão é um espaço de acolhimento e escuta. Conversamos sobre o que te trouxe até aqui, suas expectativas e como posso te ajudar. Não há roteiro fixo — é um encontro genuíno para começarmos a nos conhecer. Você pode trazer o que quiser e no ritmo que preferir.',
  0
),
(
  v_page_id,
  'Com que frequência acontecem as sessões?',
  'As sessões geralmente ocorrem uma vez por semana, com duração de 50 minutos cada. Essa regularidade é importante para a continuidade e profundidade do processo terapêutico. Eventualmente, pode-se ajustar a frequência conforme as necessidades do processo.',
  1
),
(
  v_page_id,
  'O atendimento online é tão eficaz quanto o presencial?',
  'Sim. Diversas pesquisas confirmam a eficácia da psicoterapia online. O importante é que você se sinta confortável e seguro no ambiente em que está. O espaço virtual pode ser tão terapêutico quanto o presencial — o que importa é a qualidade da relação terapêutica.',
  2
),
(
  v_page_id,
  'Como é garantida a confidencialidade?',
  'O sigilo profissional é um princípio ético fundamental da psicologia, respaldado pelo Código de Ética Profissional do CFP. Tudo o que é partilhado nas sessões permanece entre nós. Há apenas situações muito específicas (risco iminente de vida) em que o sigilo pode ser relativizado, e mesmo assim você seria comunicado.',
  3
),
(
  v_page_id,
  'Por quanto tempo dura o processo terapêutico?',
  'Não há um prazo definido — cada processo é único. Algumas pessoas alcançam seus objetivos em poucos meses, outras continuam por anos e encontram valor contínuo no autoconhecimento. Conversamos regularmente sobre o andamento e você sempre tem autonomia para decidir o ritmo.',
  4
),
(
  v_page_id,
  'Você atende casos de ansiedade e depressão?',
  'Sim. Trabalho frequentemente com pessoas que enfrentam ansiedade, síndrome do pânico, depressão, burnout e questões relacionadas. É importante ressaltar que a psicoterapia atua de forma complementar ao tratamento psiquiátrico quando necessário — ambos os olhares são valiosos.',
  5
),
(
  v_page_id,
  'Qual o valor das sessões?',
  'Os honorários são informados no primeiro contato, pois podem variar conforme a modalidade (online/presencial) e possibilidades. Sigo as diretrizes do CFP e acredito que o acesso ao cuidado psicológico deve ser o mais inclusivo possível. Entre em contato para conversarmos.',
  6
);

-- ============================================================
-- SETTINGS
-- ============================================================
INSERT INTO public.settings (
  id, profile_id, consent_text, timezone, locale,
  site_url, contact_email, whatsapp_default_message,
  privacy_policy
) VALUES (
  v_settings_id, v_profile_id,
  'Concordo com a política de privacidade e autorizo o contato por parte da psicóloga Ana Clara Silva para fins relacionados à psicoterapia, conforme a LGPD (Lei 13.709/2018).',
  'America/Sao_Paulo',
  'pt-BR',
  'https://anaclarasilva.com.br',
  'contato@anaclarasilva.com.br',
  'Olá, Ana Clara! Vim pelo seu perfil e gostaria de saber mais sobre como iniciar o processo terapêutico. 😊',
  'Política de Privacidade

Seus dados pessoais são tratados com respeito e conforme a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).

Dados coletados: Nome, WhatsApp e e-mail (opcional) fornecidos voluntariamente no formulário de interesse.

Finalidade: Apenas para contato relacionado ao processo terapêutico.

Armazenamento: Seus dados são armazenados de forma segura e acessíveis apenas pela profissional responsável.

Seus direitos: Você pode solicitar acesso, correção ou exclusão dos seus dados a qualquer momento pelo e-mail: contato@anaclarasilva.com.br

Este site não utiliza cookies de rastreamento invasivos nem compartilha seus dados com terceiros.'
);

END $$;
