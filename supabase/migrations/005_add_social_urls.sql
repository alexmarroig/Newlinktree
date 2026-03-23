-- ============================================================
-- Migration 005: Add LinkedIn and YouTube URLs to profiles
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS linkedin_url  TEXT,
  ADD COLUMN IF NOT EXISTS youtube_url   TEXT;
