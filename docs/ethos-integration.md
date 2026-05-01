# ETHOS + BioHub integration

## Product flow

ETHOS is the entry point for discovery and cross-product navigation.
BioHub is a separate app with its own public pages, login, onboarding, admin, and page editor.

Recommended flow:

```txt
ethos-clinic.com
  -> BioHub section / CTA
  -> BioHub app
  -> /pricing or /auth/register
  -> /admin/billing
  -> Mercado Pago checkout
  -> BioHub subscriptions table
```

BioHub public profile pages stay inside BioHub:

```txt
https://biohub.ethos-clinic.com/{slug}
```

## Current BioHub responsibilities

This repository already owns:

- Marketing page at `/`.
- Pricing page at `/pricing`.
- Registration at `/auth/register`.
- Login at `/auth/login`.
- Admin panel at `/admin`.
- Billing page at `/admin/billing`.
- Mercado Pago checkout creation in `src/lib/billing/mercado-pago.ts`.
- Subscription status storage in the `subscriptions` table.
- Mercado Pago webhook at `/api/mercado-pago/webhook`.

## Billing rule

Payments may be started from ETHOS or BioHub, but there must be only one billing source of truth.

Use BioHub billing as the source of truth for the BioHub product:

- `subscriptions.profile_id` identifies the BioHub workspace.
- `subscriptions.plan_code` identifies the BioHub plan.
- `subscriptions.status` controls access.
- `subscriptions.provider` is currently `mercado_pago`.
- Mercado Pago metadata includes `product_code = biohub`.

ETHOS should not create a separate independent subscription record for BioHub unless it syncs back to this same source of truth.

## Environment variables

BioHub:

```env
NEXT_PUBLIC_APP_URL=https://biohub.ethos-clinic.com
NEXT_PUBLIC_ETHOS_SITE_URL=https://ethos-clinic.com
MERCADO_PAGO_ACCESS_TOKEN=APP_USR_...
MERCADO_PAGO_WEBHOOK_SECRET=...
```

ETHOS:

```env
NEXT_PUBLIC_BIOHUB_URL=https://biohub.ethos-clinic.com
BIOHUB_PRODUCT_CODE=biohub
```

## Recommended ETHOS links

Use these links from ETHOS:

- BioHub landing/pricing: `https://biohub.ethos-clinic.com/pricing`
- BioHub signup: `https://biohub.ethos-clinic.com/auth/register`
- Existing user login: `https://biohub.ethos-clinic.com/auth/login`

For the main ETHOS CTA, prefer `/pricing` if the section is commercial, or `/auth/register` if the button copy is direct like "Criar meu BioHub".

## Future shared billing API

If ETHOS must show the user's BioHub subscription status inside ETHOS, add a small server-to-server API in BioHub instead of reading Supabase directly from ETHOS.

Suggested contract:

```http
GET /api/internal/biohub/subscription?email=user@example.com
Authorization: Bearer <INTERNAL_API_SECRET>
```

Suggested response:

```json
{
  "product": "biohub",
  "status": "active",
  "planCode": "professional",
  "currentPeriodEndsAt": "2026-06-01T00:00:00.000Z"
}
```

Only add this when ETHOS needs to display or enforce access based on BioHub subscription state.
