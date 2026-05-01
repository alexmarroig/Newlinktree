-- ============================================================
-- BIOHUB - Camila Freitas: owner link + complimentary premium
-- ============================================================
-- Before running this migration, create the auth user in Supabase:
--   email: psi.camilafreitas@gmail.com
--   password: set in Supabase Auth dashboard, not in SQL
--
-- This script links the existing camila-freitas page/profile to that auth
-- user and grants a manual premium active subscription without checkout.
-- ============================================================

DO $$
DECLARE
  v_user_id UUID;
  v_profile_id UUID;
BEGIN
  SELECT id
    INTO v_user_id
  FROM auth.users
  WHERE lower(email) = lower('psi.camilafreitas@gmail.com')
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Auth user psi.camilafreitas@gmail.com was not found. Create it in Supabase Authentication first.';
  END IF;

  SELECT pages.profile_id
    INTO v_profile_id
  FROM public.pages
  WHERE lower(pages.slug) = 'camila-freitas'
  LIMIT 1;

  IF v_profile_id IS NULL THEN
    RAISE EXCEPTION 'BioHub page slug camila-freitas was not found.';
  END IF;

  UPDATE public.profiles
  SET
    user_id = v_user_id,
    name = 'Camila Freitas',
    professional_title = 'Psicologa Clinica',
    crp = 'CRP 06/201444',
    instagram_url = 'https://instagram.com/psi.cavfreitas',
    website_url = 'https://www.psicavfreitas.com.br',
    updated_at = now()
  WHERE id = v_profile_id;

  UPDATE public.pages
  SET
    slug = 'camila-freitas',
    title = 'Camila Freitas - Psicologa Clinica',
    status = 'published',
    seo_title = 'Camila Freitas | Psicologa Clinica',
    seo_description = 'Psicologa clinica especializada em psicoterapia para adultos.',
    published_at = COALESCE(published_at, now()),
    updated_at = now()
  WHERE profile_id = v_profile_id;

  INSERT INTO public.subscriptions (
    profile_id,
    plan_code,
    status,
    provider,
    provider_subscription_id,
    provider_customer_id,
    checkout_url,
    trial_ends_at,
    current_period_ends_at,
    canceled_at
  )
  VALUES (
    v_profile_id,
    'premium',
    'active',
    'manual',
    'manual-camila-freitas-free',
    'ethos-internal-free',
    NULL,
    NULL,
    NULL,
    NULL
  )
  ON CONFLICT (profile_id) DO UPDATE
  SET
    plan_code = 'premium',
    status = 'active',
    provider = 'manual',
    provider_subscription_id = 'manual-camila-freitas-free',
    provider_customer_id = 'ethos-internal-free',
    checkout_url = NULL,
    trial_ends_at = NULL,
    current_period_ends_at = NULL,
    canceled_at = NULL,
    updated_at = now();
END $$;
