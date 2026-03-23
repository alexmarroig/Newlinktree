-- ============================================================
-- THERAPY BIO HUB — Migration 004: Fix form_submissions RLS
-- ============================================================
-- The previous owner read policy allowed any authenticated user
-- to read form_submissions where page_id IS NULL, creating a
-- horizontal privilege escalation vector.
-- This migration tightens the SELECT policy so it only grants
-- access to submissions that are linked to pages owned by the
-- requesting user. Orphan rows (page_id IS NULL) are no longer
-- readable by regular authenticated users — only service_role.
-- ============================================================

-- Drop the old leaky read policy
DROP POLICY IF EXISTS "form_submissions_owner_read" ON public.form_submissions;

-- Re-create with strict page ownership check (no page_id IS NULL escape)
CREATE POLICY "form_submissions_owner_read"
  ON public.form_submissions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pages
      JOIN public.profiles ON profiles.id = pages.profile_id
      WHERE pages.id = form_submissions.page_id
        AND profiles.user_id = auth.uid()
    )
  );
