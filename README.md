# Therapy Bio Hub

A specialized bio-link platform for mental health professionals. Built with Next.js 15, React 19, Supabase, and PostHog.

## Features

- **Public profile page** — beautiful, SEO-optimised therapist page with custom domain support
- **Visual editor** — drag-and-drop block editor with live preview
- **Lead management** — capture and track interest forms with CRM features
- **Analytics** — PostHog integration with page views, CTA clicks, scroll depth
- **Full admin** — links, FAQ, assets, theme, SEO, and settings panels

---

## Local Setup

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) account (free tier works)
- A [PostHog](https://posthog.com) account (optional — analytics only)

### 1. Clone and install dependencies

```bash
git clone <repository-url>
cd Newlinktree
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in the values. See the [Environment Variables](#environment-variables) section below.

### 3. Set up Supabase

#### a. Create a new Supabase project

Go to [supabase.com/dashboard](https://supabase.com/dashboard), create a new project, and copy:
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **Anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Service role key** (Settings → API) → `SUPABASE_SERVICE_ROLE_KEY`

#### b. Run migrations

In the Supabase **SQL Editor**, run each migration file in order:

1. `supabase/migrations/001_initial_schema.sql` — creates all tables
2. `supabase/migrations/002_rls_policies.sql` — sets up Row Level Security
3. `supabase/migrations/003_functions.sql` — creates helper functions

#### c. Create the admin user

In the Supabase **Authentication** panel:

1. Go to **Authentication → Users → Add user**
2. Enter the therapist's email and a secure password
3. Copy the **User UID** that Supabase generates

#### d. Seed initial data

Open `supabase/seed.sql` and replace `SUBSTITUA-PELO-UUID-DO-USUARIO-AUTH` with the User UID you copied in the previous step.

Then run the modified seed in the **SQL Editor**.

### 4. Configure PostHog (optional)

If you want analytics:

1. Create a project at [app.posthog.com](https://app.posthog.com)
2. Copy the **Project API Key** → `NEXT_PUBLIC_POSTHOG_KEY`
3. Set `NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com`

Analytics events are tracked silently — the app works fine without PostHog configured.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the public page.
Open [http://localhost:3000/admin](http://localhost:3000/admin) to access the admin panel.

---

## Deploy to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial setup"
git push origin main
```

### 2. Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import your repository
2. Vercel will detect Next.js automatically — no build configuration needed

### 3. Set environment variables in Vercel

In your Vercel project, go to **Settings → Environment Variables** and add all the variables from `.env.example`:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
| `NEXT_PUBLIC_POSTHOG_KEY` | Your PostHog project key (optional) |
| `NEXT_PUBLIC_POSTHOG_HOST` | `https://app.posthog.com` |
| `NEXT_PUBLIC_APP_URL` | Your Vercel domain, e.g. `https://yourdomain.vercel.app` |
| `MERCADO_PAGO_ACCESS_TOKEN` | Token de acesso para checkout de assinaturas |

### 4. Redeploy

After setting env vars, trigger a redeploy from the Vercel dashboard.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server only) |
| `NEXT_PUBLIC_POSTHOG_KEY` | No | PostHog project API key |
| `NEXT_PUBLIC_POSTHOG_HOST` | No | PostHog host URL |
| `NEXT_PUBLIC_APP_URL` | Yes | Full URL of your deployment |
| `BIOHUB_ETHOS_INTEGRATION_ENABLED` | No | Feature flag da integração Ethos (`false` por padrão). Quando `false`, mantém comportamento legado integralmente. |
| `ETHOS_API_BASE_URL` | Condicional | URL base da API Ethos (obrigatória quando a flag estiver `true`). |
| `ETHOS_API_TOKEN` | Condicional | Token server-to-server para validar acesso no Ethos (obrigatório quando a flag estiver `true`). |
| `ETHOS_UPGRADE_URL` | No | URL de upgrade exibida em negação de acesso (default: `https://ethos.biohub.app/upgrade`). |
| `ETHOS_ACCESS_CACHE_TTL_SECONDS` | No | TTL do cache de autorização em segundos (default seguro: `60`). |
| `ETHOS_REQUEST_TIMEOUT_MS` | No | Timeout das chamadas ao Ethos em ms (default seguro: `3000`). |
| `NEXT_PUBLIC_ETHOS_SITE_URL` | No | Site principal ETHOS usado para navegaÃ§Ã£o entre produtos. |
| `MERCADO_PAGO_ACCESS_TOKEN` | Yes for billing | Token de acesso do Mercado Pago para assinaturas |
| `MERCADO_PAGO_WEBHOOK_SECRET` | No | Reservado para validaÃ§Ã£o de webhook |


### Ethos integration notes

- **Fail-safe default:** `BIOHUB_ETHOS_INTEGRATION_ENABLED=false` mantém todo fluxo legado de escrita/publicação sem chamadas externas.
- **Quando habilitado (`true`):** o backend valida acesso via `BiohubAccessService` antes de operações de escrita/publicação no admin.
- **Falhas de configuração:** com a flag `true`, ausência/invalidade de `ETHOS_API_BASE_URL` ou `ETHOS_API_TOKEN` causa erro explícito de configuração para evitar publicação indevida.
- **Defaults seguros:** `ETHOS_ACCESS_CACHE_TTL_SECONDS=60`, `ETHOS_REQUEST_TIMEOUT_MS=3000`, `ETHOS_UPGRADE_URL=https://ethos.biohub.app/upgrade`.

---

## First Login and Publishing

### Login to the admin panel

1. Go to `/admin` (or `/auth/login`)
2. Enter the email and password you created in Supabase Auth

### Customise your page

- **Editor Visual** — drag blocks, edit titles, subtitles, hero text, about body, and more
- **Links & CTAs** — add/remove buttons (WhatsApp, Instagram, links, download, form trigger)
- **Blocos** — enable or disable individual sections
- **Tema** — change colours, fonts, and card style
- **SEO** — set page title, description, and OG image
- **Configurações** — set WhatsApp number, consent text, contact email

### Publish the page

1. Go to **Editor Visual**
2. Click **Publicar** (top right)
3. Your public page is now live at `/{slug}` (e.g. `/ana-silva`)

### Upload assets

1. Go to **Arquivos**
2. Upload a profile photo (avatar) or PDF guide
3. The uploaded file URL can then be referenced in blocks or resources

### Manage leads

1. Go to **Leads**
2. See all form submissions from the public page
3. Update lead status (Novo → Contatado → Em andamento → Arquivado)
4. Add internal notes per lead

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | React 19, Tailwind CSS, Radix UI |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Analytics | PostHog |
| State | Zustand |
| Forms | React Hook Form + Zod |
| Drag & Drop | dnd-kit |

---

## Development Commands

```bash
npm run dev          # Start dev server with Turbopack
npm run build        # Production build
npm run type-check   # TypeScript check
npm run lint         # ESLint
npm run format       # Prettier
```

---

## ETHOS Integration

ETHOS should be the product/marketing entry point at `ethos-clinic.com`.
BioHub should run as an independent app, preferably at `biohub.ethos-clinic.com`.

Recommended ETHOS links:

- `https://biohub.ethos-clinic.com/pricing`
- `https://biohub.ethos-clinic.com/auth/register`
- `https://biohub.ethos-clinic.com/auth/login`

Payments can be started from ETHOS or BioHub, but BioHub subscription status should have a single source of truth. In this repo, the source of truth is the `subscriptions` table updated by the Mercado Pago checkout/webhook flow.

Set this in BioHub environments:

```env
NEXT_PUBLIC_APP_URL=https://biohub.ethos-clinic.com
NEXT_PUBLIC_ETHOS_SITE_URL=https://ethos-clinic.com
```

See `docs/ethos-integration.md` for the full integration contract and implementation prompt for the ETHOS repo.
