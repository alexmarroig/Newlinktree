-- ============================================================
-- THERAPY BIO HUB — Migration 003: Funções auxiliares
-- ============================================================

-- Função para retornar leads agrupados por dia (últimos N dias)
CREATE OR REPLACE FUNCTION public.get_leads_by_day(days_back INTEGER DEFAULT 30)
RETURNS TABLE (day DATE, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE_TRUNC('day', created_at)::DATE AS day,
    COUNT(*) AS count
  FROM public.form_submissions
  WHERE created_at >= NOW() - (days_back || ' days')::INTERVAL
  GROUP BY DATE_TRUNC('day', created_at)::DATE
  ORDER BY day ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter estatísticas de links
CREATE OR REPLACE FUNCTION public.get_link_stats(p_page_id UUID)
RETURNS TABLE (
  link_id UUID,
  label TEXT,
  type TEXT,
  click_count INTEGER,
  ctr NUMERIC
) AS $$
DECLARE
  total_clicks INTEGER;
BEGIN
  SELECT SUM(l.click_count) INTO total_clicks
  FROM public.links l
  WHERE l.page_id = p_page_id;

  IF total_clicks IS NULL OR total_clicks = 0 THEN
    total_clicks := 1; -- Evita divisão por zero
  END IF;

  RETURN QUERY
  SELECT
    l.id AS link_id,
    l.label,
    l.type,
    l.click_count,
    ROUND((l.click_count::NUMERIC / total_clicks) * 100, 1) AS ctr
  FROM public.links l
  WHERE l.page_id = p_page_id
  ORDER BY l.click_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
